import { Transaction } from "../services/api";

/**
 * Utility functions for working with enhanced Transaction objects
 */

/**
 * Check if a transaction has original amount data for debugging
 */
export function hasOriginalAmountData(transaction: Transaction): boolean {
  return !!(
    transaction.original_credit !== undefined ||
    transaction.original_debit !== undefined ||
    transaction.original_amount !== undefined
  );
}

/**
 * Get the transaction type display name
 */
export function getTransactionTypeDisplayName(
  type: Transaction["type"]
): string {
  switch (type) {
    case "credit":
      return "Income";
    case "debit":
      return "Expense";
    default:
      return "Unknown";
  }
}

/**
 * Get the sign detection method display name
 */
export function getSignDetectionMethodDisplayName(
  method: Transaction["sign_detection_method"]
): string {
  switch (method) {
    case "columns":
      return "Credit/Debit Columns";
    case "heuristics":
      return "Description Analysis";
    case "hybrid":
      return "Combined Method";
    default:
      return "Unknown";
  }
}

/**
 * Check if a transaction has high confidence in its sign detection
 */
export function hasHighConfidenceSignDetection(
  transaction: Transaction
): boolean {
  // If confidence is not provided, assume high confidence for column-based detection
  if (transaction.confidence === undefined) {
    return transaction.sign_detection_method === "columns";
  }

  return transaction.confidence >= 0.8;
}

/**
 * Format transaction amount with proper sign display
 */
export function formatTransactionAmount(
  transaction: Transaction,
  currency: string = "EUR"
): string {
  const formatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  });

  return formatter.format(transaction.amount);
}

/**
 * Get debug information for a transaction
 */
export function getTransactionDebugInfo(transaction: Transaction): {
  hasOriginalData: boolean;
  signDetectionMethod: string;
  confidence?: number;
  originalValues: {
    credit?: number;
    debit?: number;
    amount?: number;
  };
} {
  return {
    hasOriginalData: hasOriginalAmountData(transaction),
    signDetectionMethod: getSignDetectionMethodDisplayName(
      transaction.sign_detection_method
    ),
    confidence: transaction.confidence,
    originalValues: {
      credit: transaction.original_credit,
      debit: transaction.original_debit,
      amount: transaction.original_amount,
    },
  };
}
