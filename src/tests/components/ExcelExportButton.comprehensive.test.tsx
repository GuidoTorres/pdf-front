import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ExcelExportButton from "../../components/dashboard/ExcelExportButton";
import { DocumentWithStatus } from "../../stores/useDocumentStore";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "dashboard.export.excel": "Export to Excel",
        "dashboard.export.exporting": "Exporting...",
        "dashboard.export.success": "Export successful",
        "dashboard.export.error": "Export failed",
        "dashboard.export.downloadStarted": "Download started",
        "dashboard.export.preparing": "Preparing export...",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock @heroui/react components
vi.mock("@heroui/react", () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    isLoading,
    isDisabled,
    className,
    startContent,
  }: any) => (
    <button
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`btn ${variant} ${size} ${className} ${
        isLoading ? "loading" : ""
      }`}
      data-testid="excel-export-button"
    >
      {startContent}
      {isLoading ? "Loading..." : children}
    </button>
  ),
  Tooltip: ({ children, content }: any) => (
    <div title={content}>{children}</div>
  ),
}));

// Mock @iconify/react
vi.mock("@iconify/react", () => ({
  Icon: ({ icon, className }: any) => (
    <span data-icon={icon} className={className}>
      {icon}
    </span>
  ),
}));

// Mock notification system
const mockShowNotification = vi.fn();
vi.mock("../../hooks/useNotification", () => ({
  useNotification: () => ({
    showNotification: mockShowNotification,
  }),
}));

// Mock API service
const mockExportToExcel = vi.fn();
vi.mock("../../services/api", () => ({
  exportToExcel: mockExportToExcel,
}));

// Mock file download utility
const mockDownloadFile = vi.fn();
vi.mock("../../utils/fileDownload", () => ({
  downloadFile: mockDownloadFile,
}));

describe("ExcelExportButton - Comprehensive Tests", () => {
  const mockCompletedDocument: DocumentWithStatus = {
    id: "doc-123",
    job_id: "job-123",
    user_id: "user-123",
    original_file_name: "bank_statement_january_2025.pdf",
    status: "completed",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:05:00Z",
    pages_processed: 3,
    file_size: 1024000,
    transactions: JSON.stringify([
      {
        id: "tx1",
        date: "2025-01-10",
        description: "Test Transaction",
        amount: -100.0,
        type: "debit",
        originalData: {
          Fecha: "10/01/2025",
          Concepto: "Test Transaction",
          Importe: "-100.00",
        },
      },
    ]),
    original_structure: JSON.stringify({
      originalHeaders: ["Fecha", "Concepto", "Importe"],
      columnMetadata: {
        originalColumnNames: ["Fecha", "Concepto", "Importe"],
        normalizedColumnNames: ["date", "description", "amount"],
        columnTypes: ["date", "text", "currency"],
      },
    }),
    column_mappings: JSON.stringify([
      {
        tableId: "table1",
        columnMappings: [
          {
            originalName: "Fecha",
            normalizedName: "date",
            standardType: "date",
          },
          {
            originalName: "Concepto",
            normalizedName: "description",
            standardType: "text",
          },
          {
            originalName: "Importe",
            normalizedName: "amount",
            standardType: "currency",
          },
        ],
      },
    ]),
    extract_type: "bank_statement",
    bank_type: "bcp",
    format_version: "2024.1",
  };

  const mockProcessingDocument: DocumentWithStatus = {
    ...mockCompletedDocument,
    id: "doc-processing",
    status: "processing",
  };

  const mockFailedDocument: DocumentWithStatus = {
    ...mockCompletedDocument,
    id: "doc-failed",
    status: "failed",
  };

  const mockEmptyDocument: DocumentWithStatus = {
    ...mockCompletedDocument,
    id: "doc-empty",
    transactions: JSON.stringify([]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockExportToExcel.mockResolvedValue({
      data: new Blob(["mock excel data"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      headers: {
        "content-disposition": 'attachment; filename="export_2025-01-15.xlsx"',
      },
    });
    mockDownloadFile.mockResolvedValue(undefined);
  });

  describe("Excel Export Button Functionality - Requirement 4.3", () => {
    it("should render export button for completed document", () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Export to Excel");
      expect(button).not.toBeDisabled();
    });

    it("should show Excel icon in button", () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="flat" />
      );

      const icon = screen
        .getByTestId("excel-export-button")
        .querySelector("[data-icon]");
      expect(icon).toBeInTheDocument();
    });

    it("should disable button for processing document", () => {
      render(
        <ExcelExportButton document={mockProcessingDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toBeDisabled();
    });

    it("should disable button for failed document", () => {
      render(
        <ExcelExportButton document={mockFailedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toBeDisabled();
    });

    it("should disable button for document with no transactions", () => {
      render(
        <ExcelExportButton document={mockEmptyDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toBeDisabled();
    });
  });

  describe("Download Process - Requirement 4.3", () => {
    it("should initiate download when button is clicked", async () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      // Should show loading state
      await waitFor(() => {
        expect(button).toHaveTextContent("Loading...");
        expect(button).toBeDisabled();
      });

      // Should call export API
      expect(mockExportToExcel).toHaveBeenCalledWith(mockCompletedDocument.id);

      // Should trigger file download
      await waitFor(() => {
        expect(mockDownloadFile).toHaveBeenCalled();
      });

      // Should show success notification
      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "success",
            message: expect.stringContaining("Export successful"),
          })
        );
      });
    });

    it("should handle export API errors gracefully", async () => {
      mockExportToExcel.mockRejectedValue(new Error("Network error"));

      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      // Should show error notification
      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "error",
            message: expect.stringContaining("Export failed"),
          })
        );
      });

      // Button should be re-enabled
      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(button).not.toHaveTextContent("Loading...");
      });
    });

    it("should handle download errors gracefully", async () => {
      mockDownloadFile.mockRejectedValue(new Error("Download failed"));

      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "error",
            message: expect.stringContaining("Export failed"),
          })
        );
      });
    });

    it("should generate correct filename from document", async () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockDownloadFile).toHaveBeenCalledWith(
          expect.any(Blob),
          expect.stringMatching(
            /bank_statement_january_2025_export_\d{4}-\d{2}-\d{2}\.xlsx/
          )
        );
      });
    });

    it("should handle document without original filename", async () => {
      const documentWithoutName = {
        ...mockCompletedDocument,
        original_file_name: null,
      };

      render(
        <ExcelExportButton document={documentWithoutName} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockDownloadFile).toHaveBeenCalledWith(
          expect.any(Blob),
          expect.stringMatching(/document_export_\d{4}-\d{2}-\d{2}\.xlsx/)
        );
      });
    });
  });

  describe("Loading States and User Feedback", () => {
    it("should show loading state during export", async () => {
      // Make the export take some time
      mockExportToExcel.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      // Should immediately show loading state
      expect(button).toHaveTextContent("Loading...");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("loading");

      // Should return to normal state after completion
      await waitFor(() => {
        expect(button).not.toHaveTextContent("Loading...");
        expect(button).not.toBeDisabled();
      });
    });

    it("should prevent multiple simultaneous exports", async () => {
      mockExportToExcel.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");

      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should only call export once
      expect(mockExportToExcel).toHaveBeenCalledTimes(1);
    });

    it("should show progress notifications", async () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      // Should show preparing notification
      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "info",
            message: expect.stringContaining("Preparing export"),
          })
        );
      });
    });
  });

  describe("Button Variants and Styling", () => {
    it("should apply solid variant styling", () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toHaveClass("solid");
    });

    it("should apply flat variant styling", () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="flat" />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toHaveClass("flat");
    });

    it("should apply ghost variant styling", () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="ghost" />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toHaveClass("ghost");
    });

    it("should apply custom size", () => {
      render(
        <ExcelExportButton
          document={mockCompletedDocument}
          variant="solid"
          size="lg"
        />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toHaveClass("lg");
    });

    it("should apply custom className", () => {
      render(
        <ExcelExportButton
          document={mockCompletedDocument}
          variant="solid"
          className="custom-export-btn"
        />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toHaveClass("custom-export-btn");
    });
  });

  describe("Accessibility and Keyboard Support", () => {
    it("should be keyboard accessible", () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");

      // Should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);

      // Should respond to Enter key
      fireEvent.keyDown(button, { key: "Enter" });
      expect(mockExportToExcel).toHaveBeenCalled();
    });

    it("should respond to Space key", () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.keyDown(button, { key: " " });
      expect(mockExportToExcel).toHaveBeenCalled();
    });

    it("should have proper ARIA attributes", () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("should provide tooltip information", () => {
      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      // Tooltip should provide additional context
      const tooltipContainer = screen.getByTitle(
        expect.stringContaining("Export")
      );
      expect(tooltipContainer).toBeInTheDocument();
    });
  });

  describe("Integration with Document States", () => {
    it("should handle document with flexible data structure", async () => {
      const flexibleDocument = {
        ...mockCompletedDocument,
        original_structure: JSON.stringify({
          originalHeaders: [
            "Fecha Operación",
            "Descripción",
            "Importe",
            "Saldo Disponible",
          ],
          columnMetadata: {
            originalColumnNames: [
              "Fecha Operación",
              "Descripción",
              "Importe",
              "Saldo Disponible",
            ],
            normalizedColumnNames: ["date", "description", "amount", "balance"],
            columnTypes: ["date", "text", "currency", "currency"],
          },
        }),
      };

      render(<ExcelExportButton document={flexibleDocument} variant="solid" />);

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalledWith(flexibleDocument.id);
      });
    });

    it("should handle document without original structure", async () => {
      const normalizedDocument = {
        ...mockCompletedDocument,
        original_structure: null,
        column_mappings: null,
      };

      render(
        <ExcelExportButton document={normalizedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalledWith(normalizedDocument.id);
      });
    });

    it("should handle large documents efficiently", async () => {
      const largeDocument = {
        ...mockCompletedDocument,
        file_size: 50 * 1024 * 1024, // 50MB
        pages_processed: 100,
      };

      render(<ExcelExportButton document={largeDocument} variant="solid" />);

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      // Should handle large documents without issues
      await waitFor(() => {
        expect(mockExportToExcel).toHaveBeenCalledWith(largeDocument.id);
      });
    });
  });

  describe("Error Recovery and Retry", () => {
    it("should allow retry after failed export", async () => {
      mockExportToExcel
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          data: new Blob(["mock excel data"]),
          headers: {
            "content-disposition": 'attachment; filename="export.xlsx"',
          },
        });

      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");

      // First attempt fails
      fireEvent.click(button);
      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" })
        );
      });

      // Second attempt succeeds
      fireEvent.click(button);
      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          expect.objectContaining({ type: "success" })
        );
      });

      expect(mockExportToExcel).toHaveBeenCalledTimes(2);
    });

    it("should handle timeout errors", async () => {
      mockExportToExcel.mockRejectedValue(new Error("Request timeout"));

      render(
        <ExcelExportButton document={mockCompletedDocument} variant="solid" />
      );

      const button = screen.getByTestId("excel-export-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "error",
            message: expect.stringContaining("Export failed"),
          })
        );
      });
    });
  });
});
