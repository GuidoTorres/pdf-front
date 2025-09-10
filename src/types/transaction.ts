// Transaction-related type definitions

export type TransactionType = "credit" | "debit";

export type SignDetectionMethod = "columns" | "heuristics" | "hybrid";

export interface TransactionDebugInfo {
  original_credit?: number;
  original_debit?: number;
  original_amount?: number;
  sign_detection_method: SignDetectionMethod;
  confidence?: number;
}

// Validation status for transactions
export type ValidationStatus = "valid" | "invalid" | "error" | "warning";

// Flexible transaction structure for enhanced data extraction
export interface FlexibleTransaction {
  // Standard normalized fields
  id?: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  balance?: number;
  reference?: string;
  category?: string;
  subcategory?: string;
  confidence?: number;

  // Original data preservation
  originalData?: Record<string, any>;

  // Validation metadata (from backend processing)
  _validation_status?: ValidationStatus;
  _validation_errors?: string[];
  _validation_error?: string;
  _quality_score?: number;

  // Transformation metadata
  transformationMetadata?: {
    sourceColumns?: string[];
    transformationRules?: string[];
    confidence?: number;
    preservationFlags?: {
      originalFormatPreserved?: boolean;
      dataTypesPreserved?: boolean;
      allColumnsIncluded?: boolean;
    };
  };

  // Debug info (existing)
  original_credit?: number;
  original_debit?: number;
  original_amount?: number;
  sign_detection_method?: SignDetectionMethod;
}

// Document structure metadata for flexible extraction
export interface DocumentStructure {
  originalHeaders?: string[];
  columnMetadata?: {
    originalColumnNames: string[];
    normalizedColumnNames: string[];
    columnTypes: string[];
    dataPatterns: string[];
  };
  preservedData?: boolean;
  extractionMethod?: string;
  confidence?: number;
  tableStructures?: Array<{
    columnCount: number;
    originalColumnNames: string[];
    normalizedColumnNames: string[];
    columnTypes: string[];
    dataPatterns: string[];
    uniqueIdentifiers: Record<string, any>;
  }>;
}

// Enhanced processing result with flexible data
export interface FlexibleProcessingResult {
  meta: {
    bank_name?: string;
    account_number?: string;
    currency: string;
    period?: string;
    opening_balance?: number;
    closing_balance?: number;
  };
  transactions: FlexibleTransaction[];
  originalTransactions?: FlexibleTransaction[];
  columnMetadata?: DocumentStructure["columnMetadata"];
  originalStructure?: DocumentStructure;
  preservedData?: boolean;
  quality?: {
    score: number;
    confidence: string;
    issues: string[];
  };
  provider: string;
  processing_time?: string;
}

// Re-export the main Transaction interface from api.ts for convenience
export type { Transaction } from "../services/api";
