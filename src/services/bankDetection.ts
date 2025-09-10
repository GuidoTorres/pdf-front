export interface BankInfo {
  bankName: string;
  country: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  currency: string;
  statementPeriod?: string;
  language: 'es' | 'en';
  documentType: 'bank_statement' | 'credit_card' | 'savings' | 'checking' | 'unknown';
}

export interface BankDetectionResult {
  bankInfo: BankInfo;
  confidence: number;
  matchedPatterns: string[];
  detectedFeatures: {
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    dateFormat?: string;
    currency?: string;
    statementPeriod?: string;
    totalBalance?: number;
    documentHeaders?: string[];
  };
}

// Generic patterns for bank statement detection
const BANKING_PATTERNS = {
  // Spanish patterns
  spanish: {
    statementHeaders: [
      'extracto', 'movimientos', 'operaciones', 'transacciones', 'cuenta',
      'resumen', 'estado de cuenta', 'movimientos periodo', 'detalle',
      'historial', 'operaciones realizadas'
    ],
    bankIdentifiers: [
      'banco', 'caja', 'credit', 'bank', 'entidad', 'financiera',
      'cooperativa', 'mutua', 'ahorro'
    ],
    accountPatterns: [
      /ES\d{2}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{2}[\s\-]?\d{10}/gi, // Spanish IBAN
      /\d{4}[\s\-]?\d{4}[\s\-]?\d{2}[\s\-]?\d{10}/g, // Spanish account format
      /\d{20,24}/g // Generic long account numbers
    ],
    currencies: ['EUR', '€', 'EUROS'],
    dateFormats: [
      /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/g,
      /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/g
    ]
  },
  // English patterns
  english: {
    statementHeaders: [
      'statement', 'account statement', 'bank statement', 'summary',
      'transaction history', 'account activity', 'monthly statement',
      'account summary', 'balance', 'transactions'
    ],
    bankIdentifiers: [
      'bank', 'credit union', 'financial', 'trust', 'savings',
      'federal credit union', 'national bank', 'state bank'
    ],
    accountPatterns: [
      /\d{9,12}/g, // US routing numbers
      /\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}/g, // Credit card format
      /\d{10,17}/g // Generic account numbers
    ],
    currencies: ['USD', '$', 'GBP', '£', 'CAD', 'AUD'],
    dateFormats: [
      /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/g,
      /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/g,
      /\w{3}\s+\d{1,2},?\s+\d{4}/g // Jan 15, 2024
    ]
  }
};

export class BankDetectionService {
  static detectBank(documentText: string, fileName?: string): BankDetectionResult | null {
    const text = documentText.toLowerCase();
    
    // Determine language first
    const language = this.detectLanguage(text);
    const patterns = BANKING_PATTERNS[language];
    
    let confidence = 0;
    const matchedPatterns: string[] = [];
    const detectedFeatures: BankDetectionResult['detectedFeatures'] = {};
    
    // Extract bank name from text
    let bankName = this.extractBankName(text, patterns, fileName);
    
    // If no specific bank name found, check if this looks like a banking document
    if (!bankName) {
      const headerMatches = this.countHeaderMatches(text, patterns);
      const accountNumbers = this.extractAccountNumbers(text, patterns);
      const currency = this.extractCurrency(text, patterns);
      
      // More sophisticated scoring for banking document detection
      let bankingScore = 0;
      if (headerMatches > 0) bankingScore += headerMatches * 0.3;
      if (accountNumbers.length > 0) bankingScore += 0.4;
      if (currency) bankingScore += 0.2;
      
      // Additional indicators
      if (text.includes('balance') || text.includes('saldo')) bankingScore += 0.1;
      if (text.includes('statement') || text.includes('extracto')) bankingScore += 0.1;
      
      if (bankingScore >= 0.5) {
        // Try to extract bank name from document structure
        bankName = this.extractBankFromDocumentStructure(text, fileName, language);
        console.log('Using enhanced bank detection:', bankName);
      } else {
        console.log(`No bank name found and insufficient banking score: ${bankingScore}`);
        return null;
      }
    }
    
    // Calculate dynamic confidence based on bank name quality
    const bankNameQuality = this.assessBankNameQuality(bankName);
    confidence += bankNameQuality.confidence;
    matchedPatterns.push(`Bank Name: ${bankName} (quality: ${bankNameQuality.score})`);
    
    // Extract account numbers with validation
    const accountNumbers = this.extractAccountNumbers(text, patterns);
    if (accountNumbers.length > 0) {
      detectedFeatures.accountNumber = accountNumbers[0];
      const accountConfidence = this.validateAccountNumber(accountNumbers[0], language);
      confidence += accountConfidence;
      matchedPatterns.push(`Account: ${accountNumbers[0]} (confidence: ${accountConfidence})`);
    }
    
    // Extract currency with regional validation
    const currency = this.extractCurrency(text, patterns);
    if (currency) {
      detectedFeatures.currency = currency;
      const currencyConfidence = this.validateCurrency(currency, language);
      confidence += currencyConfidence;
      matchedPatterns.push(`Currency: ${currency} (confidence: ${currencyConfidence})`);
    }
    
    // Extract statement period with date validation
    const period = this.extractStatementPeriod(text, language);
    if (period) {
      detectedFeatures.statementPeriod = period;
      const periodConfidence = this.validatePeriod(period);
      confidence += periodConfidence;
      matchedPatterns.push(`Period: ${period} (confidence: ${periodConfidence})`);
    }
    
    // Check for statement headers with weighted scoring
    const headerMatches = this.countHeaderMatches(text, patterns);
    if (headerMatches > 0) {
      const headerConfidence = Math.min(headerMatches * 0.05, 0.15); // Reduced weight
      confidence += headerConfidence;
      matchedPatterns.push(`Headers: ${headerMatches} found (confidence: ${headerConfidence})`);
    }
    
    // Detect document type
    const documentType = this.detectDocumentType(text, language);
    
    // Determine country from language and patterns
    const country = this.detectCountry(text, language, patterns);
    
    // Extract additional features
    const routingNumber = this.extractRoutingNumber(text, language);
    if (routingNumber) {
      detectedFeatures.routingNumber = routingNumber;
      confidence += 0.1;
    }
    
    const swiftCode = this.extractSwiftCode(text);
    if (swiftCode) {
      detectedFeatures.swiftCode = swiftCode;
      confidence += 0.1;
    }
    
    // Only return if we have reasonable confidence
    if (confidence < 0.25) {
      console.log('Confidence too low:', confidence);
      return null;
    }
    
    console.log('Bank detection successful with confidence:', confidence);
    
    const bankInfo: BankInfo = {
      bankName,
      country,
      accountNumber: detectedFeatures.accountNumber,
      routingNumber: detectedFeatures.routingNumber,
      swiftCode: detectedFeatures.swiftCode,
      currency: currency || (language === 'spanish' ? 'EUR' : 'USD'),
      statementPeriod: detectedFeatures.statementPeriod,
      language: language === 'spanish' ? 'es' : 'en',
      documentType
    };
    
    return {
      bankInfo,
      confidence: Math.min(confidence, 1.0),
      matchedPatterns,
      detectedFeatures
    };
  }
  
  private static detectLanguage(text: string): 'spanish' | 'english' {
    const lowerText = text.toLowerCase();
    
    // More comprehensive word lists with weighted scores
    const spanishIndicators = [
      { words: ['extracto', 'banco', 'cuenta', 'saldo'], weight: 3 },
      { words: ['movimientos', 'operaciones', 'transacciones'], weight: 2 },
      { words: ['fecha', 'importe', 'concepto', 'descripción'], weight: 2 },
      { words: ['euros', 'eur', 'desde', 'hasta', 'periodo'], weight: 2 },
      { words: ['transferencia', 'domiciliación', 'cargo', 'abono'], weight: 2 },
      { words: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'], weight: 1 }
    ];
    
    const englishIndicators = [
      { words: ['statement', 'bank', 'account', 'balance'], weight: 3 },
      { words: ['transaction', 'activity', 'summary'], weight: 2 },
      { words: ['date', 'amount', 'description', 'reference'], weight: 2 },
      { words: ['dollar', 'usd', 'from', 'through', 'period'], weight: 2 },
      { words: ['transfer', 'payment', 'deposit', 'withdrawal'], weight: 2 },
      { words: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'], weight: 1 }
    ];
    
    let spanishScore = 0;
    let englishScore = 0;
    
    // Calculate weighted scores
    spanishIndicators.forEach(indicator => {
      indicator.words.forEach(word => {
        if (lowerText.includes(word)) {
          spanishScore += indicator.weight;
        }
      });
    });
    
    englishIndicators.forEach(indicator => {
      indicator.words.forEach(word => {
        if (lowerText.includes(word)) {
          englishScore += indicator.weight;
        }
      });
    });
    
    console.log(`Language detection - Spanish: ${spanishScore}, English: ${englishScore}`);
    
    return spanishScore > englishScore ? 'spanish' : 'english';
  }
  
  private static extractBankName(text: string, patterns: any, fileName?: string): string | null {
    const bankIdentifiers = patterns.bankIdentifiers;
    
    const lowerText = text.toLowerCase();
    console.log('Extracting bank name from text:', lowerText.substring(0, 200));
    
    // First try to find exact known bank names
    const knownBanks = [
      // Spanish banks
      'bbva', 'santander', 'caixabank', 'bankia', 'ing', 'openbank', 'unicaja', 'sabadell',
      'banco popular', 'banco pastor', 'banco madrid', 'abanca', 'kutxabank', 'cajamar',
      'banco mediolanum', 'banco caminos', 'evo banco', 'pibank', 'banc sabadell',
      'la caixa', 'caja madrid', 'banco valencia', 'banco gallego', 'caja rural',
      // English banks
      'chase', 'bank of america', 'wells fargo', 'citibank', 'capital one', 'pnc bank',
      'us bank', 'td bank', 'bank of new york mellon', 'state street', 'goldman sachs',
      'morgan stanley', 'american express', 'discover', 'ally bank', 'charles schwab',
      'fidelity', 'vanguard', 'etrade', 'robinhood', 'paypal', 'venmo', 'truist',
      'regions bank', 'fifth third bank', 'keybank', 'navy federal', 'usaa'
    ];
    
    for (const bank of knownBanks) {
      if (lowerText.includes(bank.toLowerCase())) {
        console.log('Found known bank:', bank);
        return this.capitalizeWords(bank);
      }
    }
    
    // Try to extract using broader patterns
    const bankPatterns = [
      // Look for text before "bank" or "banco"
      /([a-záéíóúñA-Z][a-záéíóúñA-Z\s&]{2,25})\s+(bank|banco|credit union|financial)\b/gi,
      // Look for text before financial keywords
      /([a-záéíóúñA-Z][a-záéíóúñA-Z\s&]{2,25})\s+(caja|entidad|cooperativa|mutua)\b/gi,
      // Look in document headers (first few lines)
      /^([a-záéíóúñA-Z][a-záéíóúñA-Z\s&]{3,30})\s*$/gm,
      // Look for capitalized words at start of lines
      /^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s&]{2,25})\s/gm
    ];
    
    for (const pattern of bankPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          let bankName = match.trim();
          // Clean up the match
          bankName = bankName.replace(/(bank|banco|credit union|financial|caja|entidad|cooperativa|mutua).*$/gi, '').trim();
          bankName = bankName.replace(/\s+/g, ' ');
          
          // Skip if too short or contains numbers
          if (bankName.length < 3 || /\d/.test(bankName)) continue;
          
          // Skip common words that aren't bank names
          const commonWords = ['extracto', 'statement', 'movimientos', 'transactions', 'cuenta', 'account', 'saldo', 'balance'];
          if (commonWords.some(word => bankName.toLowerCase().includes(word))) continue;
          
          if (bankName.length >= 3) {
            return this.capitalizeWords(bankName + (match.toLowerCase().includes('bank') ? ' Bank' : 
                                                    match.toLowerCase().includes('banco') ? ' Banco' : ''));
          }
        }
      }
    }
    
    // Try filename as last resort
    if (fileName) {
      const fileNameLower = fileName.toLowerCase();
      const cleanFileName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
      
      // Check if filename contains bank identifiers
      for (const identifier of bankIdentifiers) {
        if (fileNameLower.includes(identifier)) {
          return this.capitalizeWords(cleanFileName);
        }
      }
      
      // Check if filename contains known bank names
      for (const bank of knownBanks) {
        if (fileNameLower.includes(bank.toLowerCase())) {
          return this.capitalizeWords(bank);
        }
      }
      
      // If filename looks like a bank name (not too generic)
      if (cleanFileName.length > 3 && cleanFileName.length < 30) {
        return this.capitalizeWords(cleanFileName);
      }
    }
    
    return null;
  }
  
  private static extractAccountNumbers(text: string, patterns: any): string[] {
    const accounts: string[] = [];
    
    for (const pattern of patterns.accountPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        accounts.push(...matches.map(match => match.replace(/[\s\-]/g, '')));
      }
    }
    
    // Remove duplicates and return unique accounts
    return [...new Set(accounts)];
  }
  
  private static extractCurrency(text: string, patterns: any): string | null {
    for (const currency of patterns.currencies) {
      if (text.includes(currency.toLowerCase())) {
        return currency;
      }
    }
    return null;
  }
  
  private static extractStatementPeriod(text: string, language: 'spanish' | 'english'): string | null {
    const lowerText = text.toLowerCase();
    
    // First try specific period patterns with more flexible matching
    const specificPatterns = language === 'spanish' ? [
      // Spanish patterns - more flexible spacing and separators
      /periodo\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})\s*[-a-záéíóúñ\s]*?(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})/gi,
      /desde\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})\s*hasta\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})/gi,
      /del\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})\s*al?\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})/gi,
      /fecha\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})\s*[-a-záéíóúñ\s]*?(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})/gi,
      // Match dates with Spanish month names
      /(\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+\d{4})\s*[-a-záéíóúñ\s]*?(\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+\d{4})/gi
    ] : [
      // English patterns - more flexible
      /statement\s+period\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})\s*[-a-z\s]*?(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})/gi,
      /from\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})\s*to\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})/gi,
      /period\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})\s*[-a-z\s]*?(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})/gi,
      /date\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})\s*[-a-z\s]*?(to|through)\s*:?\s*(\d{1,2}[\\/\-\.\s]*\d{1,2}[\\/\-\.\s]*\d{4})/gi,
      // English month name patterns
      /((january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{4})\s*[-\s]*?(to|through)\s*((january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{4})/gi,
      /from\s*((january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{4})\s*[-\s]*?to\s*((january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{4})/gi
    ];
    
    console.log(`Extracting period from text (${language}):`, lowerText.substring(0, 300));
    
    for (const pattern of specificPatterns) {
      const match = lowerText.match(pattern);
      if (match && match[1] && (match[2] || match[3])) {
        const date1 = match[1].trim();
        const date2 = (match[2] || match[3]).trim();
        console.log(`Found period pattern: ${date1} - ${date2}`);
        return `${date1} - ${date2}`;
      }
    }
    
    // If no specific patterns found, try to find any two dates that might be a period
    const allDates = this.extractAllDates(lowerText, language);
    console.log('All dates found:', allDates);
    
    if (allDates.length >= 2) {
      // Take the first and last dates as potential period
      const period = `${allDates[0]} - ${allDates[allDates.length - 1]}`;
      console.log(`Using first and last dates as period: ${period}`);
      return period;
    }
    
    console.log('No period found');
    return null;
  }
  
  private static extractAllDates(text: string, language: 'spanish' | 'english'): string[] {
    const dates: string[] = [];
    const lowerText = text.toLowerCase();
    
    // More comprehensive date patterns
    const datePatterns = [
      // Standard numeric formats with flexible separators
      /\b(\d{1,2})[\s]*[\\/\-\.][\s]*(\d{1,2})[\s]*[\\/\-\.][\s]*(\d{4})\b/g,
      /\b(\d{4})[\s]*[\\/\-\.][\s]*(\d{1,2})[\s]*[\\/\-\.][\s]*(\d{1,2})\b/g,
      
      // Spanish month names
      /\b(\d{1,2})\s+(de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(de\s+)?(\d{4})\b/gi,
      
      // English month names - full and abbreviated
      /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})\b/gi,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
      
      // ISO-like formats
      /\b(\d{4})[\-\.](\d{1,2})[\-\.](\d{1,2})\b/g,
      
      // More flexible numeric with spaces
      /\b(\d{1,2})\s+(\d{1,2})\s+(\d{4})\b/g
    ];
    
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(lowerText)) !== null) {
        // Clean up the match
        let dateStr = match[0].trim();
        
        // Skip if it's clearly not a date (e.g., looks like account numbers)
        if (dateStr.length > 20 || /^\d{10,}$/.test(dateStr.replace(/[\s\-\.\/]/g, ''))) {
          continue;
        }
        
        // Validate year is reasonable (between 2000 and current year + 1)
        const yearMatch = dateStr.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          if (year < 2000 || year > new Date().getFullYear() + 1) {
            continue;
          }
        }
        
        dates.push(dateStr);
      }
    }
    
    // Remove duplicates and sort
    const uniqueDates = [...new Set(dates)].sort();
    console.log('Extracted dates:', uniqueDates);
    
    return uniqueDates;
  }
  
  private static countHeaderMatches(text: string, patterns: any): number {
    let count = 0;
    for (const header of patterns.statementHeaders) {
      if (text.includes(header.toLowerCase())) {
        count++;
      }
    }
    return count;
  }
  
  private static detectDocumentType(text: string, language: 'spanish' | 'english'): BankInfo['documentType'] {
    const creditCardTerms = language === 'spanish' 
      ? ['tarjeta', 'crédito', 'visa', 'mastercard']
      : ['credit card', 'visa', 'mastercard', 'card statement'];
      
    const savingsTerms = language === 'spanish'
      ? ['ahorro', 'depósito']
      : ['savings', 'deposit'];
      
    const checkingTerms = language === 'spanish'
      ? ['corriente', 'cuenta corriente']
      : ['checking', 'current account'];
    
    for (const term of creditCardTerms) {
      if (text.includes(term.toLowerCase())) return 'credit_card';
    }
    
    for (const term of savingsTerms) {
      if (text.includes(term.toLowerCase())) return 'savings';
    }
    
    for (const term of checkingTerms) {
      if (text.includes(term.toLowerCase())) return 'checking';
    }
    
    return 'bank_statement';
  }
  
  private static detectCountry(text: string, language: 'spanish' | 'english', patterns: any): string {
    // Try to detect specific country indicators
    if (language === 'spanish') {
      if (text.includes('españa') || text.includes('spain') || /es\d{2}/i.test(text)) {
        return 'ES';
      }
      if (text.includes('méxico') || text.includes('mexico')) {
        return 'MX';
      }
      if (text.includes('argentina')) {
        return 'AR';
      }
      return 'ES'; // Default for Spanish
    } else {
      if (text.includes('united states') || text.includes('usa') || /routing.*\d{9}/.test(text)) {
        return 'US';
      }
      if (text.includes('united kingdom') || text.includes('uk') || text.includes('gbp')) {
        return 'GB';
      }
      if (text.includes('canada') || text.includes('cad')) {
        return 'CA';
      }
      return 'US'; // Default for English
    }
  }
  
  private static extractRoutingNumber(text: string, language: 'spanish' | 'english'): string | null {
    if (language === 'english') {
      const routingPattern = /routing[:\s]*(\d{9})/gi;
      const match = text.match(routingPattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }
  
  private static extractSwiftCode(text: string): string | null {
    const swiftPattern = /swift[:\s]*([a-z]{6}[a-z0-9]{2}([a-z0-9]{3})?)/gi;
    const match = text.match(swiftPattern);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    return null;
  }
  
  private static extractBankFromDocumentStructure(text: string, fileName?: string, language: 'spanish' | 'english' = 'spanish'): string {
    // Try to extract bank name from document headers (first 3 lines)
    const lines = text.split('\n').slice(0, 5);
    
    // Look for lines that might contain bank names
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length > 5 && cleanLine.length < 50) {
        // Skip lines that look like dates, numbers, or common headers
        if (/^\d+[\d\-\/\s]*$/.test(cleanLine)) continue;
        if (/^(extracto|statement|fecha|date|período|period)/i.test(cleanLine)) continue;
        
        // Look for capitalized words that might be bank names
        const capitalWords = cleanLine.match(/[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\s]{2,}/g);
        if (capitalWords && capitalWords.length > 0) {
          const potentialBank = capitalWords.join(' ').trim();
          if (potentialBank.length > 3) {
            return this.capitalizeWords(potentialBank);
          }
        }
      }
    }
    
    // Fallback to filename or generic name
    if (fileName) {
      const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');
      if (cleanFileName.length > 3) {
        return this.capitalizeWords(cleanFileName);
      }
    }
    
    return language === 'spanish' ? 'Entidad Bancaria' : 'Financial Institution';
  }

  private static assessBankNameQuality(bankName: string): { confidence: number; score: string } {
    const name = bankName.toLowerCase();
    
    // High quality: known bank names
    const knownBanks = ['santander', 'bbva', 'caixabank', 'bankia', 'ing', 'chase', 'bank of america'];
    if (knownBanks.some(bank => name.includes(bank))) {
      return { confidence: 0.4, score: 'high' };
    }
    
    // Medium quality: has banking keywords
    const bankingKeywords = ['banco', 'bank', 'caja', 'credit union', 'financial'];
    if (bankingKeywords.some(keyword => name.includes(keyword))) {
      return { confidence: 0.25, score: 'medium' };
    }
    
    // Low quality: generic or filename-based names
    if (name.includes('entidad') || name.includes('financial institution') || name.length < 5) {
      return { confidence: 0.15, score: 'low' };
    }
    
    // Default medium-low for other cases
    return { confidence: 0.2, score: 'medium-low' };
  }

  private static validateAccountNumber(accountNumber: string, language: 'spanish' | 'english'): number {
    const cleaned = accountNumber.replace(/[\s\-]/g, '');
    
    // Spanish IBAN validation
    if (language === 'spanish' && cleaned.startsWith('ES') && cleaned.length === 24) {
      return 0.3; // High confidence for valid Spanish IBAN
    }
    
    // US account number patterns
    if (language === 'english' && cleaned.length >= 9 && cleaned.length <= 17) {
      return 0.25; // Good confidence for US format
    }
    
    // Generic long number validation
    if (cleaned.length >= 10 && cleaned.length <= 24) {
      return 0.15; // Medium confidence
    }
    
    return 0.05; // Low confidence for short or invalid formats
  }

  private static validateCurrency(currency: string, language: 'spanish' | 'english'): number {
    const curr = currency.toUpperCase();
    
    // Perfect matches for regional expectations
    if (language === 'spanish' && ['EUR', '€', 'EUROS'].includes(curr)) return 0.15;
    if (language === 'english' && ['USD', '$', 'DOLLARS'].includes(curr)) return 0.15;
    
    // Valid but not regional default
    const validCurrencies = ['EUR', 'USD', 'GBP', 'CAD', 'AUD', '€', '$', '£'];
    if (validCurrencies.includes(curr)) return 0.1;
    
    return 0.05; // Unknown currency
  }

  private static validatePeriod(period: string): number {
    if (!period) return 0;
    
    // Check if period contains two dates
    const datePattern = /\d{1,2}[\\/\-\.\s]\d{1,2}[\\/\-\.\s]\d{4}/g;
    const dates = period.match(datePattern);
    
    if (dates && dates.length >= 2) {
      // Validate date range is reasonable (not more than 1 year)
      try {
        const startDate = new Date(dates[0].replace(/[\\/\-\.]/g, '/'));
        const endDate = new Date(dates[dates.length - 1].replace(/[\\/\-\.]/g, '/'));
        const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays > 0 && diffDays <= 365) {
          return 0.12; // Good period
        }
      } catch (e) {
        // Invalid dates
      }
    }
    
    return 0.05; // Period exists but can't validate
  }

  private static capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
  
  // Helper methods for UI compatibility
  static getBankLogo(bankName: string): string {
    // Return a generic bank icon for any bank
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6v12h20V6H2zm18 10H4V8h16v8z"/></svg>`;
  }
  
  static formatAccountNumber(accountNumber: string, country?: string): string {
    if (!accountNumber) return '';
    
    const cleaned = accountNumber.replace(/[\s\-]/g, '');
    
    // Spanish IBAN format
    if (cleaned.length === 24 && cleaned.startsWith('ES')) {
      return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8, 12)} ${cleaned.substring(12, 14)} ${cleaned.substring(14)}`;
    }
    
    // US account format
    if (cleaned.length >= 10 && cleaned.length <= 17) {
      return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d+)/, '$1 $2 $3 $4').trim();
    }
    
    // Default: just add spaces every 4 digits
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  }
}