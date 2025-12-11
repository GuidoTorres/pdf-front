import { create } from "zustand";
import {
  apiService,
  ProcessingResult,
  Transaction,
  getAuthToken,
} from "../services/api";
import { CategorizationService } from "../services/categorization";
import {
  BankDetectionService,
  BankDetectionResult,
} from "../services/bankDetection";
import { useWebSocketStore } from "./useWebSocketStore";

export type DocumentStatus = "processing" | "completed" | "failed" | "cancelled";

export interface DocumentWithStatus extends ProcessingResult {
  status: DocumentStatus;
  jobId?: string;
  fileName?: string;
  step?: string; // Add step for real-time progress
  bankDetection?: BankDetectionResult; // Add bank detection info
  // Additional fields from database
  id?: string;
  user_id?: string;
  original_file_name?: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
  pages_processed?: number;
  // Quality and processing info
  amountSignData?: {
    original_credit?: number;
    original_debit?: number;
    original_amount?: number;
    sign_detection_method?: string;
  };
}

interface DocumentState {
  documents: DocumentWithStatus[];
  isProcessing: boolean;
  activeJobId: string | null;
  currentDocument: DocumentWithStatus | null;
  batchProgress: { current: number; total: number; files: string[] } | null;
  editingTransactions: Record<string, boolean>; // Track which transactions are being edited
  hasUnsavedChanges: boolean;
  activePollingIntervals: Map<string, ReturnType<typeof setTimeout>>;
  setCurrentDocument: (document: DocumentWithStatus | null) => void;
  processDocument: (file: File) => Promise<void>;
  processBatchDocuments: (files: File[]) => Promise<void>;
  pollJobStatus: (jobId: string) => void;
  handleWebSocketJobUpdate: (
    jobId: string,
    status: string,
    progress?: number,
    step?: string,
    result?: any,
    error?: string
  ) => void;
  loadHistory: () => Promise<void>;
  updateTransaction: (
    transactionId: string,
    updates: Partial<Transaction>
  ) => void;
  setTransactionEditing: (transactionId: string, isEditing: boolean) => void;
  saveChanges: () => void;
  discardChanges: () => void;
  cancelJob: (jobId: string) => void;
  removeDocument: (jobId: string) => void;
}

// Store original document state for discarding changes
let originalDocumentState: DocumentWithStatus | null = null;

// Helper function to detect bank from document
function detectBankFromDocument(
  document: ProcessingResult,
  fileName?: string
): BankDetectionResult | undefined {
  // Create a comprehensive text representation from the document for analysis
  let documentText = "";

  // Add metadata information (this often contains bank names and account info)
  if (document.meta) {
    const meta = document.meta;
    if (meta.bank_name) documentText += `${meta.bank_name} `;
    if (meta.account_number) documentText += `account ${meta.account_number} `;
    if (meta.currency) documentText += `${meta.currency} `;
    if (meta.period)
      documentText += `periodo ${meta.period} period ${meta.period} `;
  }

  // Add a sample of transaction descriptions (banking patterns are often here)
  const sampleTransactions = document.transactions.slice(0, 10); // First 10 transactions
  sampleTransactions.forEach((transaction) => {
    documentText += `${transaction.description} `;
    if (transaction.post_date) documentText += `${transaction.post_date} `;
    if (transaction.value_date) documentText += `${transaction.value_date} `;
  });

  // Add filename as additional context (often contains bank name)
  if (fileName) {
    documentText += `${fileName} `;
  }

  // Add some common banking document headers/keywords to help detection
  documentText +=
    "extracto statement movimientos transactions cuenta account saldo balance banco bank ";



  // Try to detect the bank
  const result = BankDetectionService.detectBank(documentText, fileName);



  return result || undefined;
}

export const useDocumentStore = create<DocumentState>((set, get) => {
  const clearPollingTimer = (jobId: string) => {
    const timers = get().activePollingIntervals;
    const existing = timers.get(jobId);
    if (existing) {
      clearTimeout(existing);
      clearInterval(existing);
    }
    if (timers.has(jobId)) {
      const newTimers = new Map(timers);
      newTimers.delete(jobId);
      set({ activePollingIntervals: newTimers });
    }
  };

  return {
    documents: [],
    isProcessing: false,
    activeJobId: null,
    currentDocument: null,
    batchProgress: null,
    editingTransactions: {},
    hasUnsavedChanges: false,
    activePollingIntervals: new Map(),

    setCurrentDocument: (document) => {
    // Store original state when setting current document
    originalDocumentState = document
      ? JSON.parse(JSON.stringify(document))
      : null;
    set({
      currentDocument: document,
      editingTransactions: {},
      hasUnsavedChanges: false,
    });
  },

    processDocument: async (file: File) => {
    set({ isProcessing: true, activeJobId: null });

    const placeholder: DocumentWithStatus = {
      jobId: `temp-${Date.now()}`,
      fileName: file.name,
      meta: { bank_name: file.name, currency: "" },
      transactions: [],
      status: "processing",
      step: "Initializing...",
    };
    set((state) => ({ documents: [placeholder, ...state.documents] }));

    try {
      const response = await apiService.processDocument(file);
      if (response.success && response.data?.jobId) {
        const { jobId } = response.data;
        set({ activeJobId: jobId });
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.jobId === placeholder.jobId
              ? { ...doc, jobId, status: "processing" }
              : doc
          ),
        }));

        // Use WebSocket for real-time updates with polling safety net
        const wsStore = useWebSocketStore.getState();
        if (wsStore.isConnected) {
          const safetyTimer = setTimeout(() => {
            const currentState = get();
            const doc = currentState.documents.find((d) => d.jobId === jobId);
            if (doc && doc.status !== "completed" && doc.status !== "failed") {
              get().pollJobStatus(jobId);
            }
          }, 30000);

          clearPollingTimer(jobId);
          set((state) => {
            const timers = new Map(state.activePollingIntervals);
            timers.set(jobId, safetyTimer);
            return { activePollingIntervals: timers };
          });
        } else {
            get().pollJobStatus(jobId);
        }
      } else {
        throw new Error(response.error || "Failed to start processing");
      }
    } catch (error) {
      console.error("Error starting document processing:", error);
      
      // Check if it's a page limit error - check error message only since response is out of scope
      const errorMessage = error.message || "";
      const isPageLimitError = 
        errorMessage.includes('Insufficient pages') ||
        errorMessage.includes('Páginas insuficientes') ||
        errorMessage.includes('pages remaining') ||
        errorMessage.includes('page limit');

      // Show appropriate notification for page limit errors
      if (isPageLimitError) {
        import("./useNotificationStore").then(({ useNotificationStore }) => {
          useNotificationStore
            .getState()
            .error(
              "Page Limit Exceeded",
              "You have reached your monthly page limit. Please upgrade your plan or wait for your monthly reset to continue processing documents."
            );
        }).catch(err => {
          console.error("Failed to load notification store:", err);
        });
      }

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.jobId === placeholder.jobId ? { 
            ...doc, 
            status: "failed",
            step: isPageLimitError ? "Page limit exceeded" : "Failed to start processing"
          } : doc
        ),
        isProcessing: false,
      }));
    }
    },

    pollJobStatus: (jobId: string) => {
    clearPollingTimer(jobId);

    const interval = setInterval(async () => {
      try {
        // Check if document still exists and needs polling
        const currentDoc = get().documents.find(d => d.jobId === jobId);
        if (!currentDoc || currentDoc.status === "completed" || currentDoc.status === "failed") {
          clearInterval(interval);
          clearPollingTimer(jobId);
          return;
        }

        const statusResponse = await apiService.getJobStatus(jobId);
        if (statusResponse.success) {
          const { state, result, progress } = statusResponse.data;

          // Update progress step
          if (progress?.step) {
            set((state) => ({
              documents: state.documents.map((doc) =>
                doc.jobId === jobId ? { ...doc, step: progress.step } : doc
              ),
            }));
          }

          if (state === "completed") {
            clearInterval(interval);
            clearPollingTimer(jobId);
            const newDocument = result as ProcessingResult;

            // Apply automatic categorization to transactions
            const categorizedTransactions = newDocument.transactions.map(
              (transaction) => {
                const categorization =
                  CategorizationService.categorizeTransaction(
                    transaction.description,
                    transaction.amount,
                    transaction.type // Pass transaction type for proper categorization
                  );

                return {
                  ...transaction,
                  category: categorization.category,
                  subcategory: categorization.subcategory,
                  confidence: categorization.confidence,
                  date:
                    transaction.date ||
                    transaction.post_date ||
                    transaction.value_date, // Ensure date field for display
                };
              }
            );

            // Detect bank from document content - temporarily disabled
            // const currentState = get();
            // const currentDoc = currentState.documents.find(
            //   (doc) => doc.jobId === jobId
            // );
            // const bankDetection = detectBankFromDocument(
            //   newDocument,
            //   currentDoc?.fileName
            // );
            const bankDetection = null;

            const categorizedDocument = {
              ...newDocument,
              transactions: categorizedTransactions,
              bankDetection,
            };

            // Update pages in real-time if page deduction info is available
            if (
              statusResponse.data.result?.pages_deducted ||
              statusResponse.data.result?.pages_remaining !== undefined
            ) {
              const { useAuthStore } = await import("../stores/useAuthStore");
              const pagesDeducted =
                statusResponse.data.result.pages_deducted || 1;
              const remainingPages = statusResponse.data.result.pages_remaining;

              useAuthStore
                .getState()
                .updateUserPages(pagesDeducted, remainingPages);

              // Trigger page deduction notification
              const currentState = get();
              const currentDoc = currentState.documents.find(
                (doc) => doc.jobId === jobId
              );
              if (currentDoc?.fileName && window.dispatchEvent) {
                window.dispatchEvent(
                  new CustomEvent("pageDeducted", {
                    detail: {
                      pagesDeducted,
                      remainingPages,
                      fileName: currentDoc.fileName,
                    },
                  })
                );
              }
            }

            set((state) => ({
              documents: state.documents.map((doc) =>
                doc.jobId === jobId
                  ? { ...doc, ...categorizedDocument, status: "completed" }
                  : doc
              ),
              isProcessing: false,
              activeJobId: null,
            }));
          } else if (state === "failed") {
            clearInterval(interval);
            clearPollingTimer(jobId);
            set((state) => ({
              documents: state.documents.map((doc) =>
                doc.jobId === jobId ? { ...doc, status: "failed" } : doc
              ),
              isProcessing: false,
              activeJobId: null,
            }));
          }
        }
      } catch (error) {
        console.error("Error polling job status:", error);
        clearInterval(interval);
        clearPollingTimer(jobId);
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.jobId === jobId ? { ...doc, status: "failed" } : doc
          ),
          isProcessing: false,
          activeJobId: null,
        }));
      }
    }, 3000);

    set((state) => {
      const timers = new Map(state.activePollingIntervals);
      timers.set(jobId, interval);
      return { activePollingIntervals: timers };
    });
    },

    loadHistory: async () => {
    // Check if user is authenticated before making API call
    const token = getAuthToken();
    if (!token) {
      return;
    }

    try {
      const response = await apiService.getProcessingHistory();
      

      if (response.success && Array.isArray(response.data)) {
        const documentsWithStatus: DocumentWithStatus[] = response.data.map(
          (doc) => {
            return {
              id: doc.id,
              jobId: doc.job_id,
              fileName: doc.original_file_name,
              status: doc.status,
              created_at: doc.createdAt,
              updated_at: doc.updatedAt,
              file_size: doc.file_size || 0,
              pages_processed: doc.page_count || 1,
              transactions: doc.transactions || [],
              originalTransactions: doc.originalTransactions || null, // Add originalTransactions mapping
              originalTable: doc.originalTable || null, // Add originalTable mapping
              meta: doc.metadata,
              original_file_name: doc.original_file_name,
              provider: doc.provider,
            } as DocumentWithStatus;
          }
        );

        set({ documents: documentsWithStatus });
      } else {
        set({ documents: [] });
      }
    } catch (error) {
      set({ documents: [] });
    }
    },

  processBatchDocuments: async (files: File[]) => {
    if (files.length === 0) return;

    set({
      isProcessing: true,
      batchProgress: {
        current: 0,
        total: files.length,
        files: files.map((f) => f.name),
      },
    });

    // Create placeholders for all files
    const placeholders: DocumentWithStatus[] = files.map((file) => ({
      jobId: `temp-${Date.now()}-${Math.random()}`,
      fileName: file.name,
      meta: { bank_name: file.name, currency: "" },
      transactions: [],
      status: "processing",
      step: "Queued...",
    }));

    set((state) => ({
      documents: [...placeholders, ...state.documents],
    }));

    // Process files sequentially to avoid overwhelming the server
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const placeholder = placeholders[i];

      set((state) => ({
        batchProgress: state.batchProgress
          ? {
              ...state.batchProgress,
              current: i + 1,
            }
          : null,
        documents: state.documents.map((doc) =>
          doc.jobId === placeholder.jobId
            ? { ...doc, step: "Processing..." }
            : doc
        ),
      }));

      try {
        const response = await apiService.processDocument(file);
        if (response.success && response.data?.jobId) {
          const { jobId } = response.data;

          set((state) => ({
            documents: state.documents.map((doc) =>
              doc.jobId === placeholder.jobId
                ? { ...doc, jobId, status: "processing" }
                : doc
            ),
          }));

          // Start polling for this job
          get().pollJobStatus(jobId);
        } else {
          throw new Error(response.error || "Failed to start processing");
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        
        // Check if it's a page limit error
        const errorMessage = error.message || "";
        const responseError = response?.error || "";
        const isPageLimitError = 
          errorMessage.includes('Insufficient pages') ||
          errorMessage.includes('Páginas insuficientes') ||
          errorMessage.includes('pages remaining') ||
          errorMessage.includes('page limit') ||
          responseError.includes('Insufficient pages') ||
          response?.errorCode === 'INSUFFICIENT_PAGES';

        // Show appropriate notification for page limit errors (only once per batch)
        if (isPageLimitError && !get().documents.some(doc => doc.step === "Page limit exceeded")) {
          import("./useNotificationStore").then(({ useNotificationStore }) => {
            useNotificationStore
              .getState()
              .error(
                "Page Limit Exceeded",
                "You have reached your monthly page limit. Please upgrade your plan or wait for your monthly reset to continue processing documents."
              );
          });
        }

        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.jobId === placeholder.jobId
              ? { 
                  ...doc, 
                  status: "failed", 
                  step: isPageLimitError ? "Page limit exceeded" : "Failed" 
                }
              : doc
          ),
        }));
      }

      // Small delay between files to prevent server overload
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    set({
      isProcessing: false,
      batchProgress: null,
    });
  },

    updateTransaction: (transactionId: string, updates: Partial<Transaction>) => {
    const state = get();
    if (!state.currentDocument) return;

    // Apply categorization if description changed
    let finalUpdates = { ...updates };
    if (updates.description) {
      const currentTransaction = state.currentDocument.transactions.find(
        (t) => t.id === transactionId
      );
      const categorization = CategorizationService.categorizeTransaction(
        updates.description,
        updates.amount ?? currentTransaction?.amount ?? 0,
        updates.type ?? currentTransaction?.type // Pass transaction type for proper categorization
      );

      // Only auto-categorize if user hasn't manually set category
      if (!updates.category) {
        finalUpdates = {
          ...finalUpdates,
          category: categorization.category,
          subcategory: categorization.subcategory,
          confidence: categorization.confidence,
        };
      }
    }

    const updatedTransactions = state.currentDocument.transactions.map(
      (transaction) =>
        transaction.id === transactionId
          ? { ...transaction, ...finalUpdates }
          : transaction
    );

    const updatedDocument = {
      ...state.currentDocument,
      transactions: updatedTransactions,
    };

    set({
      currentDocument: updatedDocument,
      hasUnsavedChanges: true,
    });
    },

    setTransactionEditing: (transactionId: string, isEditing: boolean) => {
    set((state) => ({
      editingTransactions: {
        ...state.editingTransactions,
        [transactionId]: isEditing,
      },
    }));
    },

    saveChanges: () => {
    const state = get();
    if (!state.currentDocument || !state.hasUnsavedChanges) return;

    // Update the document in the documents array
    const updatedDocuments = state.documents.map((doc) =>
      doc.jobId === state.currentDocument?.jobId ? state.currentDocument : doc
    );

    // Update original state to current state
    originalDocumentState = JSON.parse(JSON.stringify(state.currentDocument));

    set({
      documents: updatedDocuments,
      hasUnsavedChanges: false,
      editingTransactions: {},
    });

    // TODO: In a real app, you'd also persist changes to backend
    },

    discardChanges: () => {
    if (originalDocumentState) {
      set({
        currentDocument: JSON.parse(JSON.stringify(originalDocumentState)),
        hasUnsavedChanges: false,
        editingTransactions: {},
      });
    }
    },

  handleWebSocketJobUpdate: (
    jobId: string,
    status: string,
    progress?: number,
    step?: string,
    result?: any,
    error?: string
  ) => {
    let documents = get().documents;
    let targetDoc = documents.find((doc) => doc.jobId === jobId);

    if (!targetDoc && (status === "completed" || status === "failed")) {
      const recentDoc = documents.find(
        (doc) =>
          doc.jobId.startsWith("temp-") &&
          Date.now() - Number(doc.jobId.split("-")[1]) < 60000
      );

      if (recentDoc) {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.jobId === recentDoc.jobId ? { ...doc, jobId } : doc
          ),
        }));
        documents = get().documents;
        targetDoc = documents.find((doc) => doc.jobId === jobId);
      }
    }

    if (!targetDoc) {
      return;
    }

    if (status === "completed" || status === "failed") {
      clearPollingTimer(jobId);
      set((state) => ({
        isProcessing: state.activeJobId === jobId ? false : state.isProcessing,
        activeJobId: state.activeJobId === jobId ? null : state.activeJobId,
      }));
    }

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.jobId !== jobId) {
          return doc;
        }

        if (doc.status === "cancelled") {
          return doc;
        }

        const nextDoc: DocumentWithStatus = {
          ...doc,
          step: step ?? doc.step,
          progress: progress ?? doc.progress,
        };

        if (status === "completed" && result) {
          const categorizedTransactions =
            result.transactions?.map((transaction: Transaction) => {
              const categorization = CategorizationService.categorizeTransaction(
                transaction.description,
                transaction.amount,
                transaction.type
              );

              return {
                ...transaction,
                category: categorization.category,
                subcategory: categorization.subcategory,
                confidence: categorization.confidence,
                date:
                  transaction.date ||
                  transaction.post_date ||
                  transaction.value_date,
              };
            }) || [];

          const bankDetection = detectBankFromDocument(
            result,
            doc.fileName
          );

          return {
            ...nextDoc,
            ...result,
            transactions: categorizedTransactions,
            bankDetection,
            status: "completed",
          };
        }

        if (status === "failed") {
          return {
            ...nextDoc,
            status: "failed",
            step: error || "Processing failed",
          };
        }

        return {
          ...nextDoc,
          status: status as DocumentStatus,
        };
      }),
    }));
  },

    cancelJob: (jobId: string) => {
      const currentDoc = get().documents.find((doc) => doc.jobId === jobId);
      if (!currentDoc) {
        return;
      }

      clearPollingTimer(jobId);

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.jobId === jobId
            ? {
                ...doc,
                status: "cancelled" as DocumentStatus,
                step: "Cancelled by user",
              }
            : doc
        ),
        isProcessing: state.documents.some(
          (doc) => doc.jobId !== jobId && doc.status === "processing"
        ),
      }));

      if (get().currentDocument?.jobId === jobId) {
        set({ currentDocument: null });
      }
    },

    removeDocument: async (jobId: string) => {
      try {
        const response = await apiService.cancelJob(jobId);
        if (!response.success) {
          console.error('Failed to cancel job on backend:', response.error);
        }
      } catch (error) {
        console.error('Error calling cancel job API:', error);
      }

      clearPollingTimer(jobId);

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.jobId === jobId
            ? {
                ...doc,
                status: "cancelled" as DocumentStatus,
                step: "Cancelado por el usuario",
              }
            : doc
        ),
        isProcessing: state.documents.some(
          (doc) => doc.jobId !== jobId && doc.status === "processing"
        ),
      }));

      if (get().currentDocument?.jobId === jobId) {
        set({ currentDocument: null });
      }
    },
  };
});
