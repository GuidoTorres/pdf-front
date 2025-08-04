import { create } from 'zustand';
import { apiService, ProcessingResult } from '../services/api';

export type DocumentStatus = 'processing' | 'completed' | 'failed';

export interface DocumentWithStatus extends ProcessingResult {
  status: DocumentStatus;
  jobId?: string;
  fileName?: string; 
}

interface DocumentState {
  documents: DocumentWithStatus[];
  isProcessing: boolean;
  activeJobId: string | null;
  currentDocument: DocumentWithStatus | null; // Documento seleccionado para vista previa
  setCurrentDocument: (document: DocumentWithStatus | null) => void;
  processDocument: (file: File, provider?: 'docling' | 'traditional') => Promise<void>;
  pollJobStatus: (jobId: string) => void;
  loadHistory: () => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isProcessing: false,
  activeJobId: null,
  currentDocument: null,

  setCurrentDocument: (document) => set({ currentDocument: document }),

  processDocument: async (file: File, provider = 'docling') => {
    set({ isProcessing: true, activeJobId: null });

    const placeholder: DocumentWithStatus = {
      jobId: `temp-${Date.now()}`,
      fileName: file.name,
      meta: { bank_name: file.name, currency: '' },
      transactions: [],
      status: 'processing',
    };
    set(state => ({ documents: [placeholder, ...state.documents] }));

    try {
      const response = await apiService.processDocument(file, provider);
      if (response.success && response.data?.jobId) {
        const { jobId } = response.data;
        set({ activeJobId: jobId });
        set(state => ({
          documents: state.documents.map(doc => 
            doc.jobId === placeholder.jobId ? { ...doc, jobId, status: 'processing' } : doc
          )
        }));
        get().pollJobStatus(jobId);
      } else {
        throw new Error(response.error || 'Failed to start processing');
      }
    } catch (error) {
      console.error("Error starting document processing:", error);
      set(state => ({
        documents: state.documents.map(doc => 
          doc.jobId === placeholder.jobId ? { ...doc, status: 'failed' } : doc
        ),
        isProcessing: false 
      }));
    }
  },

  pollJobStatus: (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await apiService.getJobStatus(jobId);
        if (statusResponse.success) {
          const { state, result } = statusResponse.data;

          if (state === 'completed') {
            clearInterval(interval);
            const newDocument = result as ProcessingResult;
            console.log("New document data:", newDocument);
            set(state => ({
              documents: state.documents.map(doc => 
                doc.jobId === jobId ? { ...doc, ...newDocument, status: 'completed' } : doc
              ),
              isProcessing: false,
              activeJobId: null,
            }));
          } else if (state === 'failed') {
            clearInterval(interval);
            set(state => ({
              documents: state.documents.map(doc => 
                doc.jobId === jobId ? { ...doc, status: 'failed' } : doc
              ),
              isProcessing: false,
              activeJobId: null,
            }));
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        clearInterval(interval);
        set(state => ({
          documents: state.documents.map(doc => 
            doc.jobId === jobId ? { ...doc, status: 'failed' } : doc
          ),
          isProcessing: false, 
          activeJobId: null 
        }));
      }
    }, 3000);
  },

  loadHistory: async () => {
    try {
      const response = await apiService.getProcessingHistory();
      if (response.success && Array.isArray(response.data)) {
        const documentsWithStatus: DocumentWithStatus[] = response.data.map(doc => ({ 
          ...doc, 
          status: 'completed',
          fileName: doc.meta?.bank_name || 'Documento procesado'
        }));
        set({ documents: documentsWithStatus });
      } else {
        set({ documents: [] });
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      set({ documents: [] });
    }
  },
}));