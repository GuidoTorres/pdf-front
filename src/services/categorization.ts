export interface CategoryRule {
  keywords: string[];
  category: string;
  subcategory?: string;
  icon: string;
  color: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories?: string[];
}

// Main categories with colors and icons
export const CATEGORIES: TransactionCategory[] = [
  {
    id: "food",
    name: "Alimentación",
    icon: "lucide:utensils",
    color: "warning",
    subcategories: ["Restaurantes", "Supermercados", "Delivery"],
  },
  {
    id: "transport",
    name: "Transporte",
    icon: "lucide:car",
    color: "primary",
    subcategories: ["Uber/Taxi", "Gasolina", "Parking", "Transporte Público"],
  },
  {
    id: "shopping",
    name: "Compras",
    icon: "lucide:shopping-bag",
    color: "secondary",
    subcategories: ["Amazon", "Ropa", "Electrónicos", "Casa"],
  },
  {
    id: "entertainment",
    name: "Entretenimiento",
    icon: "lucide:gamepad-2",
    color: "success",
    subcategories: ["Netflix/Streaming", "Cine", "Música", "Juegos"],
  },
  {
    id: "bills",
    name: "Servicios",
    icon: "lucide:receipt",
    color: "danger",
    subcategories: ["Electricidad", "Agua", "Internet", "Teléfono", "Gas"],
  },
  {
    id: "health",
    name: "Salud",
    icon: "lucide:heart",
    color: "default",
    subcategories: ["Médico", "Farmacia", "Seguro", "Gym"],
  },
  {
    id: "income",
    name: "Ingresos",
    icon: "lucide:trending-up",
    color: "success",
    subcategories: ["Salario", "Freelance", "Inversiones", "Otros Ingresos"],
  },
  {
    id: "banking",
    name: "Servicios Bancarios",
    icon: "lucide:building-2",
    color: "default",
    subcategories: ["Comisiones", "Transferencias", "Cajero"],
  },
  {
    id: "other",
    name: "Otros",
    icon: "lucide:more-horizontal",
    color: "default",
    subcategories: [],
  },
];

// Expense categorization rules (for debit transactions)
export const EXPENSE_CATEGORIZATION_RULES: CategoryRule[] = [
  // Food & Restaurants
  {
    keywords: ["mcdonalds", "burger", "kfc", "pizza", "dominos", "telepizza"],
    category: "food",
    subcategory: "Restaurantes",
    icon: "lucide:utensils",
    color: "warning",
  },
  {
    keywords: [
      "mercadona",
      "carrefour",
      "eroski",
      "alcampo",
      "lidl",
      "dia",
      "supermercado",
    ],
    category: "food",
    subcategory: "Supermercados",
    icon: "lucide:shopping-cart",
    color: "warning",
  },
  {
    keywords: ["glovo", "uber eats", "just eat", "deliveroo", "delivery"],
    category: "food",
    subcategory: "Delivery",
    icon: "lucide:bike",
    color: "warning",
  },
  {
    keywords: ["restaurante", "bar", "cafeteria", "cafe"],
    category: "food",
    subcategory: "Restaurantes",
    icon: "lucide:utensils",
    color: "warning",
  },

  // Transport
  {
    keywords: ["uber", "cabify", "taxi", "bolt"],
    category: "transport",
    subcategory: "Uber/Taxi",
    icon: "lucide:car",
    color: "primary",
  },
  {
    keywords: ["repsol", "cepsa", "bp", "galp", "gasolina", "gasolinera"],
    category: "transport",
    subcategory: "Gasolina",
    icon: "lucide:fuel",
    color: "primary",
  },
  {
    keywords: ["parking", "aparcamiento", "estacionamiento"],
    category: "transport",
    subcategory: "Parking",
    icon: "lucide:square-parking",
    color: "primary",
  },
  {
    keywords: ["metro", "autobus", "tren", "renfe", "emt", "tmb"],
    category: "transport",
    subcategory: "Transporte Público",
    icon: "lucide:train",
    color: "primary",
  },

  // Shopping
  {
    keywords: ["amazon", "amzn"],
    category: "shopping",
    subcategory: "Amazon",
    icon: "lucide:package",
    color: "secondary",
  },
  {
    keywords: ["zara", "h&m", "mango", "pull&bear", "bershka", "stradivarius"],
    category: "shopping",
    subcategory: "Ropa",
    icon: "lucide:shirt",
    color: "secondary",
  },
  {
    keywords: ["media markt", "fnac", "pccomponentes", "apple", "samsung"],
    category: "shopping",
    subcategory: "Electrónicos",
    icon: "lucide:smartphone",
    color: "secondary",
  },
  {
    keywords: ["ikea", "leroy merlin", "bricomart"],
    category: "shopping",
    subcategory: "Casa",
    icon: "lucide:home",
    color: "secondary",
  },

  // Entertainment
  {
    keywords: ["netflix", "spotify", "amazon prime", "disney+", "hbo"],
    category: "entertainment",
    subcategory: "Netflix/Streaming",
    icon: "lucide:tv",
    color: "success",
  },
  {
    keywords: ["cine", "cinema", "yelmo", "kinepolis"],
    category: "entertainment",
    subcategory: "Cine",
    icon: "lucide:film",
    color: "success",
  },
  {
    keywords: ["steam", "playstation", "xbox", "nintendo"],
    category: "entertainment",
    subcategory: "Juegos",
    icon: "lucide:gamepad-2",
    color: "success",
  },

  // Bills & Services
  {
    keywords: ["iberdrola", "endesa", "gas natural", "repsol electricidad"],
    category: "bills",
    subcategory: "Electricidad",
    icon: "lucide:zap",
    color: "danger",
  },
  {
    keywords: ["canal isabel ii", "aguas", "hidralia"],
    category: "bills",
    subcategory: "Agua",
    icon: "lucide:droplets",
    color: "danger",
  },
  {
    keywords: ["movistar", "vodafone", "orange", "jazztel", "masmovil"],
    category: "bills",
    subcategory: "Internet",
    icon: "lucide:wifi",
    color: "danger",
  },
  {
    keywords: ["telefonica", "yoigo"],
    category: "bills",
    subcategory: "Teléfono",
    icon: "lucide:phone",
    color: "danger",
  },

  // Health
  {
    keywords: ["farmacia", "pharmacy"],
    category: "health",
    subcategory: "Farmacia",
    icon: "lucide:pill",
    color: "default",
  },
  {
    keywords: ["medico", "hospital", "clinica", "doctor"],
    category: "health",
    subcategory: "Médico",
    icon: "lucide:stethoscope",
    color: "default",
  },
  {
    keywords: ["gym", "gimnasio", "fitness"],
    category: "health",
    subcategory: "Gym",
    icon: "lucide:dumbbell",
    color: "default",
  },
  {
    keywords: ["seguro", "axa", "mapfre", "sanitas"],
    category: "health",
    subcategory: "Seguro",
    icon: "lucide:shield",
    color: "default",
  },

  // Banking
  {
    keywords: ["comision", "mantenimiento", "cuota"],
    category: "banking",
    subcategory: "Comisiones",
    icon: "lucide:percent",
    color: "default",
  },
  {
    keywords: ["cajero", "atm"],
    category: "banking",
    subcategory: "Cajero",
    icon: "lucide:credit-card",
    color: "default",
  },

  // Common Peruvian banking terms
  {
    keywords: ["ret.cajero", "retiro cajero", "retiro atm"],
    category: "banking",
    subcategory: "Retiros",
    icon: "lucide:banknote",
    color: "default",
  },
  {
    keywords: ["compra pos", "pos", "tarjeta"],
    category: "shopping",
    subcategory: "Compras con Tarjeta",
    icon: "lucide:credit-card",
    color: "secondary",
  },
];

// Income categorization rules (for credit transactions)
export const INCOME_CATEGORIZATION_RULES: CategoryRule[] = [
  // Salary and employment income
  {
    keywords: ["nomina", "salario", "sueldo", "pago", "salary", "payroll"],
    category: "income",
    subcategory: "Salario",
    icon: "lucide:banknote",
    color: "success",
  },
  {
    keywords: [
      "freelance",
      "honorarios",
      "consultoria",
      "servicios profesionales",
    ],
    category: "income",
    subcategory: "Freelance",
    icon: "lucide:briefcase",
    color: "success",
  },
  {
    keywords: ["dividendos", "intereses", "rendimientos", "inversiones"],
    category: "income",
    subcategory: "Inversiones",
    icon: "lucide:trending-up",
    color: "success",
  },
  {
    keywords: ["devolucion", "reembolso", "refund", "cashback"],
    category: "income",
    subcategory: "Devoluciones",
    icon: "lucide:undo",
    color: "success",
  },
  {
    keywords: ["venta", "sale", "ingreso por venta"],
    category: "income",
    subcategory: "Ventas",
    icon: "lucide:shopping-bag",
    color: "success",
  },
  // Banking transfers and deposits (credit side)
  {
    keywords: ["tran.cel.bm", "transferencia celular", "bim"],
    category: "income",
    subcategory: "Transferencias Recibidas",
    icon: "lucide:smartphone",
    color: "success",
  },
  {
    keywords: ["plin", "yape", "tunki"],
    category: "income",
    subcategory: "Billeteras Digitales",
    icon: "lucide:wallet",
    color: "success",
  },
  {
    keywords: ["deposito", "abono", "ingreso", "transferencia"],
    category: "income",
    subcategory: "Otros Ingresos",
    icon: "lucide:plus-circle",
    color: "success",
  },
];

// Combined rules for backward compatibility
export const CATEGORIZATION_RULES: CategoryRule[] = [
  ...EXPENSE_CATEGORIZATION_RULES,
  ...INCOME_CATEGORIZATION_RULES,
];

export class CategorizationService {
  static categorizeTransaction(
    description: string,
    amount: number,
    transactionType?: "credit" | "debit"
  ): { category: string; subcategory: string; confidence: number } {
    const desc = description.toLowerCase().trim();

    // Determine which rule set to use based on transaction type
    let rulesToUse: CategoryRule[];

    if (transactionType === "credit") {
      // For credit transactions, use income rules
      rulesToUse = INCOME_CATEGORIZATION_RULES;
    } else if (transactionType === "debit") {
      // For debit transactions, use expense rules
      rulesToUse = EXPENSE_CATEGORIZATION_RULES;
    } else {
      // Fallback: use amount-based logic for backward compatibility
      if (amount > 0) {
        rulesToUse = INCOME_CATEGORIZATION_RULES;
      } else {
        rulesToUse = EXPENSE_CATEGORIZATION_RULES;
      }
    }

    // Try to match by description using the appropriate rule set
    let bestMatch: {
      rule: CategoryRule;
      confidence: number;
      matchDetails: string;
    } | null = null;

    for (const rule of rulesToUse) {
      for (const keyword of rule.keywords) {
        const matchScore = this.calculateKeywordMatchScore(desc, keyword);

        if (matchScore.isMatch) {
          let confidence = 0.6; // Base confidence

          // Add match-based confidence
          confidence += matchScore.score;

          // Context-based adjustments
          const contextBonus = this.getContextualBonus(
            desc,
            rule.category,
            amount
          );
          confidence += contextBonus;

          // Penalty for ambiguous matches
          const ambiguityPenalty = this.calculateAmbiguityPenalty(
            desc,
            keyword
          );
          confidence -= ambiguityPenalty;

          // Cap confidence
          confidence = Math.min(confidence, 0.95);

          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = {
              rule,
              confidence,
              matchDetails: `keyword: "${keyword}", score: ${matchScore.score.toFixed(
                2
              )}, context: ${contextBonus.toFixed(2)}`,
            };
          }
        }
      }
    }

    // If we found a good match, use it
    if (bestMatch && bestMatch.confidence > 0.6) {
      return {
        category: bestMatch.rule.category,
        subcategory: bestMatch.rule.subcategory || "General",
        confidence: bestMatch.confidence,
      };
    }

    // If no good match found, provide default categorization based on transaction type
    if (
      transactionType === "credit" ||
      (transactionType === undefined && amount > 0)
    ) {
      // For credit transactions or positive amounts, default to income
      return {
        category: "income",
        subcategory: "Otros Ingresos",
        confidence: bestMatch ? Math.max(bestMatch.confidence, 0.3) : 0.3,
      };
    } else if (
      transactionType === "debit" ||
      (transactionType === undefined && amount <= 0)
    ) {
      // For debit transactions or negative amounts, use best match if available
      if (bestMatch) {
        return {
          category: bestMatch.rule.category,
          subcategory: bestMatch.rule.subcategory || "General",
          confidence: bestMatch.confidence,
        };
      }

      // Default to "other" for expenses without clear categorization
      return {
        category: "other",
        subcategory: "Sin categorizar",
        confidence: 0.1,
      };
    }

    // Final fallback
    return {
      category: "other",
      subcategory: "Sin categorizar",
      confidence: 0.1,
    };
  }

  static getCategoryInfo(categoryId: string): TransactionCategory | undefined {
    return CATEGORIES.find((cat) => cat.id === categoryId);
  }

  static getAllCategories(): TransactionCategory[] {
    return CATEGORIES;
  }

  static getCategoryColor(categoryId: string): string {
    const category = this.getCategoryInfo(categoryId);
    return category?.color || "default";
  }

  static getCategoryIcon(categoryId: string): string {
    const category = this.getCategoryInfo(categoryId);
    return category?.icon || "lucide:more-horizontal";
  }

  private static calculateKeywordMatchScore(
    description: string,
    keyword: string
  ): { isMatch: boolean; score: number } {
    const desc = description.toLowerCase();
    const kw = keyword.toLowerCase();

    if (!desc.includes(kw)) {
      return { isMatch: false, score: 0 };
    }

    let score = 0.1; // Base match score

    // Exact match bonus
    if (desc === kw) {
      score += 0.3;
    }

    // Word boundary match (not partial word)
    const wordBoundaryRegex = new RegExp(`\\b${kw}\\b`, "i");
    if (wordBoundaryRegex.test(desc)) {
      score += 0.15;
    }

    // Position bonus (earlier = better)
    const position = desc.indexOf(kw);
    const positionScore = Math.max(0, 0.1 - (position / desc.length) * 0.1);
    score += positionScore;

    // Length bonus for specific keywords
    if (kw.length > 8) score += 0.1;
    else if (kw.length > 5) score += 0.05;

    return { isMatch: true, score: Math.min(score, 0.4) };
  }

  private static getContextualBonus(
    description: string,
    category: string,
    amount: number
  ): number {
    const desc = description.toLowerCase();
    let bonus = 0;

    // Amount-based context
    if (category === "food" && amount < 100) bonus += 0.05; // Small food purchases
    if (category === "transport" && amount < 50) bonus += 0.05; // Typical transport costs
    if (category === "bills" && amount > 20) bonus += 0.05; // Bills usually higher amounts

    // Description patterns that strengthen categorization
    const strengtheners: Record<string, string[]> = {
      food: ["restaurante", "comida", "menu", "cocina"],
      transport: ["viaje", "ruta", "estacion", "terminal"],
      shopping: ["compra", "tienda", "shop", "store"],
      entertainment: ["ocio", "diversión", "fun", "entertainment"],
      bills: ["factura", "servicio", "suministro", "mensual"],
      health: ["salud", "medico", "clinica", "hospital"],
      banking: ["banco", "comision", "transferencia", "cajero"],
      income: [
        "trabajo",
        "empleo",
        "empresa",
        "patron",
        "empleador",
        "pago",
        "cobro",
      ],
    };

    const categoryStrengtheners = strengtheners[category] || [];
    const matches = categoryStrengtheners.filter((word) =>
      desc.includes(word)
    ).length;
    bonus += matches * 0.03;

    return Math.min(bonus, 0.15);
  }

  private static calculateAmbiguityPenalty(
    description: string,
    keyword: string
  ): number {
    const desc = description.toLowerCase();
    const kw = keyword.toLowerCase();

    let penalty = 0;

    // Penalty for very short keywords that might be too generic
    if (kw.length <= 3) penalty += 0.05;

    // Penalty if the description contains multiple category keywords
    const allKeywords = CATEGORIZATION_RULES.flatMap((rule) => rule.keywords);
    const matchingKeywords = allKeywords.filter(
      (k) => k !== keyword && desc.includes(k.toLowerCase())
    ).length;

    if (matchingKeywords > 0) {
      penalty += matchingKeywords * 0.02;
    }

    // Penalty for descriptions with negation words
    const negationWords = ["no", "sin", "without", "not"];
    if (negationWords.some((neg) => desc.includes(neg))) {
      penalty += 0.1;
    }

    return Math.min(penalty, 0.2);
  }
}
