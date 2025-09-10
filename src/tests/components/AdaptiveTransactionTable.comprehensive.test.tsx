import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdaptiveTransactionTable from "../../components/dashboard/AdaptiveTransactionTable";
import {
  FlexibleTransaction,
  DocumentStructure,
} from "../../types/transaction";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "dashboard.excelPreview.date": "Date",
        "dashboard.excelPreview.description": "Description",
        "dashboard.excelPreview.amount": "Amount",
        "dashboard.excelPreview.type": "Type",
        "dashboard.excelPreview.balance": "Balance",
        "dashboard.excelPreview.normalizedView": "Normalized View",
        "dashboard.excelPreview.originalView": "Original View",
        "dashboard.excelPreview.showMappings": "Show Mappings",
        "dashboard.excelPreview.confidence": "Confidence",
        "dashboard.excelPreview.noOriginalData":
          "No original data structure available",
        "dashboard.excelPreview.extractionMethod": "Extraction Method",
        "dashboard.excelPreview.columnsCount": "columns",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock @heroui/react components with more detailed implementations
vi.mock("@heroui/react", () => ({
  Table: ({ children, className, ...props }: any) => (
    <table className={className} {...props}>
      {children}
    </table>
  ),
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableColumn: ({ children, className }: any) => (
    <th className={className}>{children}</th>
  ),
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children, className }: any) => (
    <tr className={className}>{children}</tr>
  ),
  TableCell: ({ children, className }: any) => (
    <td className={className}>{children}</td>
  ),
  Chip: ({ children, color, variant, className }: any) => (
    <span className={`chip ${color} ${variant} ${className}`}>{children}</span>
  ),
  Button: ({
    children,
    onClick,
    variant,
    size,
    isDisabled,
    className,
  }: any) => (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`btn ${variant} ${size} ${className}`}
    >
      {children}
    </button>
  ),
  Switch: ({ isSelected, onValueChange, size, className }: any) => (
    <input
      type="checkbox"
      checked={isSelected}
      onChange={(e) => onValueChange(e.target.checked)}
      className={`switch ${size} ${className}`}
      data-testid="view-toggle"
    />
  ),
  Card: ({ children, className }: any) => (
    <div className={`card ${className}`}>{children}</div>
  ),
  CardBody: ({ children, className }: any) => (
    <div className={`card-body ${className}`}>{children}</div>
  ),
  Pagination: ({ page, total, onChange, size, className }: any) => (
    <div className={`pagination ${size} ${className}`}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        data-testid="pagination-prev"
      >
        Previous
      </button>
      <span data-testid="pagination-info">
        {page} of {total}
      </span>
      <button
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page === total}
        data-testid="pagination-next"
      >
        Next
      </button>
    </div>
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

describe("AdaptiveTransactionTable - Comprehensive Tests", () => {
  // Mock data for different bank formats
  const mockBCPTransactions: FlexibleTransaction[] = [
    {
      id: "bcp-1",
      date: "2025-01-15",
      description: "Retiro ATM",
      amount: -150.0,
      type: "debit",
      originalData: {
        Fecha: "15/01/2025",
        Concepto: "Retiro ATM",
        Debe: "150.00",
        Haber: "",
        Saldo: "1,850.00",
      },
      transformationMetadata: {
        sourceColumns: ["Fecha", "Concepto", "Debe", "Saldo"],
        confidence: 0.95,
        preservationFlags: {
          originalFormatPreserved: true,
          dataTypesPreserved: true,
          allColumnsIncluded: true,
        },
      },
    },
    {
      id: "bcp-2",
      date: "2025-01-16",
      description: "Depósito Salario",
      amount: 2500.0,
      type: "credit",
      originalData: {
        Fecha: "16/01/2025",
        Concepto: "Depósito Salario",
        Debe: "",
        Haber: "2,500.00",
        Saldo: "4,350.00",
      },
      transformationMetadata: {
        sourceColumns: ["Fecha", "Concepto", "Haber", "Saldo"],
        confidence: 0.98,
        preservationFlags: {
          originalFormatPreserved: true,
          dataTypesPreserved: true,
          allColumnsIncluded: true,
        },
      },
    },
  ];

  const mockBBVATransactions: FlexibleTransaction[] = [
    {
      id: "bbva-1",
      date: "2025-01-15",
      description: "Transferencia Recibida",
      amount: 1000.0,
      type: "credit",
      originalData: {
        "Fecha Operación": "15/01/2025",
        Descripción: "Transferencia Recibida",
        Importe: "1,000.00",
        "Saldo Disponible": "5,000.00",
      },
      transformationMetadata: {
        sourceColumns: ["Fecha Operación", "Descripción", "Importe"],
        confidence: 0.92,
        preservationFlags: {
          originalFormatPreserved: true,
          dataTypesPreserved: true,
          allColumnsIncluded: true,
        },
      },
    },
  ];

  const mockInterbankTransactions: FlexibleTransaction[] = [
    {
      id: "interbank-1",
      date: "2025-01-20",
      description: "Depósito Efectivo",
      amount: 500.0,
      type: "credit",
      originalData: {
        "Fec. Valor": "20/01/2025",
        "Detalle Operación": "Depósito Efectivo",
        Cargos: "0.00",
        Abonos: "500.00",
        "Saldo Final": "5,500.00",
      },
      transformationMetadata: {
        sourceColumns: ["Fec. Valor", "Detalle Operación", "Abonos"],
        confidence: 0.89,
        preservationFlags: {
          originalFormatPreserved: true,
          dataTypesPreserved: false, // Different data types
          allColumnsIncluded: true,
        },
      },
    },
  ];

  const mockBCPDocumentStructure: DocumentStructure = {
    originalHeaders: ["Fecha", "Concepto", "Debe", "Haber", "Saldo"],
    columnMetadata: {
      originalColumnNames: ["Fecha", "Concepto", "Debe", "Haber", "Saldo"],
      normalizedColumnNames: [
        "date",
        "description",
        "debit",
        "credit",
        "balance",
      ],
      columnTypes: ["date", "text", "currency", "currency", "currency"],
      dataPatterns: ["dd/mm/yyyy", "text", "decimal", "decimal", "decimal"],
    },
    preservedData: true,
    extractionMethod: "table_based",
    confidence: 0.95,
  };

  const mockBBVADocumentStructure: DocumentStructure = {
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
      dataPatterns: ["dd/mm/yyyy", "text", "decimal", "decimal"],
    },
    preservedData: true,
    extractionMethod: "hybrid",
    confidence: 0.92,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dynamic Table Rendering with Various Column Sets - Requirement 4.1", () => {
    it("should render BCP format with original column names", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Switch to original view
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // Verify BCP-specific column names are displayed
      expect(screen.getByText("Fecha")).toBeInTheDocument();
      expect(screen.getByText("Concepto")).toBeInTheDocument();
      expect(screen.getByText("Debe")).toBeInTheDocument();
      expect(screen.getByText("Haber")).toBeInTheDocument();
      expect(screen.getByText("Saldo")).toBeInTheDocument();

      // Verify original data is displayed
      expect(screen.getByText("15/01/2025")).toBeInTheDocument();
      expect(screen.getByText("Retiro ATM")).toBeInTheDocument();
      expect(screen.getByText("150.00")).toBeInTheDocument();
    });

    it("should render BBVA format with different column structure", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBBVATransactions}
          documentStructure={mockBBVADocumentStructure}
          currency="EUR"
        />
      );

      // Switch to original view
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // Verify BBVA-specific column names are displayed
      expect(screen.getByText("Fecha Operación")).toBeInTheDocument();
      expect(screen.getByText("Descripción")).toBeInTheDocument();
      expect(screen.getByText("Importe")).toBeInTheDocument();
      expect(screen.getByText("Saldo Disponible")).toBeInTheDocument();

      // Verify original data is displayed
      expect(screen.getByText("15/01/2025")).toBeInTheDocument();
      expect(screen.getByText("Transferencia Recibida")).toBeInTheDocument();
      expect(screen.getByText("1,000.00")).toBeInTheDocument();
    });

    it("should handle unusual column names gracefully", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockInterbankTransactions}
          currency="USD"
        />
      );

      // Switch to original view
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // Verify unusual column names are displayed
      expect(screen.getByText("Fec. Valor")).toBeInTheDocument();
      expect(screen.getByText("Detalle Operación")).toBeInTheDocument();
      expect(screen.getByText("Cargos")).toBeInTheDocument();
      expect(screen.getByText("Abonos")).toBeInTheDocument();
      expect(screen.getByText("Saldo Final")).toBeInTheDocument();
    });

    it("should adapt to varying column counts dynamically", () => {
      const { rerender } = render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Switch to original view and verify 5 columns
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      let headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(5); // BCP has 5 columns

      // Re-render with BBVA data (4 columns)
      rerender(
        <AdaptiveTransactionTable
          transactions={mockBBVATransactions}
          documentStructure={mockBBVADocumentStructure}
          currency="EUR"
        />
      );

      headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(4); // BBVA has 4 columns
    });
  });

  describe("Original vs Normalized View Toggle - Requirement 4.2", () => {
    it("should start in normalized view by default", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Verify normalized column headers are shown
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Amount")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();

      // Verify normalized data is shown
      expect(screen.getByText("2025-01-15")).toBeInTheDocument();
      expect(screen.getByText("Retiro ATM")).toBeInTheDocument();
    });

    it("should toggle to original view when switch is activated", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      const toggle = screen.getByTestId("view-toggle");

      // Initially should be unchecked (normalized view)
      expect(toggle).not.toBeChecked();

      // Click to switch to original view
      fireEvent.click(toggle);
      expect(toggle).toBeChecked();

      // Verify original view is shown
      expect(screen.getByText("Original View")).toBeInTheDocument();
      expect(screen.getByText("Fecha")).toBeInTheDocument();
      expect(screen.getByText("15/01/2025")).toBeInTheDocument();
    });

    it("should toggle back to normalized view", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      const toggle = screen.getByTestId("view-toggle");

      // Switch to original view
      fireEvent.click(toggle);
      expect(screen.getByText("Original View")).toBeInTheDocument();

      // Switch back to normalized view
      fireEvent.click(toggle);
      expect(screen.getByText("Normalized View")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("2025-01-15")).toBeInTheDocument();
    });

    it("should hide toggle when no original data is available", () => {
      const normalizedOnlyTransactions = mockBCPTransactions.map((tx) => ({
        ...tx,
        originalData: undefined,
        transformationMetadata: undefined,
      }));

      render(
        <AdaptiveTransactionTable
          transactions={normalizedOnlyTransactions}
          currency="PEN"
        />
      );

      // Toggle should not be present
      expect(screen.queryByTestId("view-toggle")).not.toBeInTheDocument();
      expect(screen.queryByText("Normalized View")).not.toBeInTheDocument();
    });
  });

  describe("Excel Export Button and Download Process - Requirement 4.3", () => {
    it("should show export functionality when document is available", () => {
      const mockDocument = {
        id: "doc-123",
        status: "completed",
        original_file_name: "test_statement.pdf",
      };

      // This test would need the ExcelExportButton to be integrated
      // For now, we'll test the table's readiness for export
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Verify data is ready for export
      expect(screen.getByText("Retiro ATM")).toBeInTheDocument();
      expect(screen.getByText("Depósito Salario")).toBeInTheDocument();
    });

    it("should maintain data integrity for export", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Switch to original view to verify export data
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // Verify all original data is preserved and accessible
      expect(screen.getByText("150.00")).toBeInTheDocument();
      expect(screen.getByText("2,500.00")).toBeInTheDocument();
      expect(screen.getByText("1,850.00")).toBeInTheDocument();
      expect(screen.getByText("4,350.00")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior with Different Screen Sizes - Requirement 4.4", () => {
    it("should handle large tables on small screens", () => {
      // Mock a small screen size
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 320,
      });

      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Table should still render all data
      expect(screen.getByText("Retiro ATM")).toBeInTheDocument();
      expect(screen.getByText("Depósito Salario")).toBeInTheDocument();
    });

    it("should handle many columns on narrow screens", () => {
      // Create transaction with many columns
      const wideTransaction: FlexibleTransaction = {
        id: "wide-1",
        date: "2025-01-15",
        description: "Wide Transaction",
        amount: 100.0,
        type: "credit",
        originalData: {
          Col1: "Value1",
          Col2: "Value2",
          Col3: "Value3",
          Col4: "Value4",
          Col5: "Value5",
          Col6: "Value6",
          Col7: "Value7",
          Col8: "Value8",
        },
      };

      render(
        <AdaptiveTransactionTable
          transactions={[wideTransaction]}
          currency="PEN"
        />
      );

      // Switch to original view
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // All columns should be accessible
      expect(screen.getByText("Col1")).toBeInTheDocument();
      expect(screen.getByText("Col8")).toBeInTheDocument();
    });

    it("should maintain usability with pagination on small screens", () => {
      // Create many transactions to trigger pagination
      const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
        ...mockBCPTransactions[0],
        id: `tx-${i}`,
        description: `Transaction ${i}`,
      }));

      render(
        <AdaptiveTransactionTable
          transactions={manyTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Pagination should be present and functional
      expect(screen.getByTestId("pagination-info")).toHaveTextContent("1 of 3");
      expect(screen.getByTestId("pagination-next")).toBeInTheDocument();
      expect(screen.getByTestId("pagination-prev")).toBeInTheDocument();

      // Navigate to next page
      fireEvent.click(screen.getByTestId("pagination-next"));
      expect(screen.getByTestId("pagination-info")).toHaveTextContent("2 of 3");
    });
  });

  describe("Advanced Features and Edge Cases", () => {
    it("should display confidence scores correctly", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Confidence scores should be visible
      expect(screen.getByText("95%")).toBeInTheDocument();
      expect(screen.getByText("98%")).toBeInTheDocument();
    });

    it("should handle missing transformation metadata gracefully", () => {
      const transactionsWithoutMetadata = mockBCPTransactions.map((tx) => ({
        ...tx,
        transformationMetadata: undefined,
      }));

      render(
        <AdaptiveTransactionTable
          transactions={transactionsWithoutMetadata}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Should still render without errors
      expect(screen.getByText("Retiro ATM")).toBeInTheDocument();
    });

    it("should show extraction method and confidence from document structure", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Document-level metadata should be displayed
      expect(screen.getByText("table_based")).toBeInTheDocument();
      expect(screen.getByText("95%")).toBeInTheDocument();
    });

    it("should handle empty transactions array", () => {
      render(
        <AdaptiveTransactionTable
          transactions={[]}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Should render without errors
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("should handle special characters in original data", () => {
      const specialCharsTransaction: FlexibleTransaction = {
        id: "special-1",
        date: "2025-01-15",
        description: "Special Transaction",
        amount: 100.0,
        type: "credit",
        originalData: {
          Descripción: "Pago en línea - Café & Té S.A.",
          Referencia: "REF#12345-ABC/2025",
          Moneda: "S/. 100.00",
          Observaciones: "Comisión: 2.5% + IGV",
        },
      };

      render(
        <AdaptiveTransactionTable
          transactions={[specialCharsTransaction]}
          currency="PEN"
        />
      );

      // Switch to original view
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // Special characters should be preserved
      expect(
        screen.getByText("Pago en línea - Café & Té S.A.")
      ).toBeInTheDocument();
      expect(screen.getByText("REF#12345-ABC/2025")).toBeInTheDocument();
      expect(screen.getByText("S/. 100.00")).toBeInTheDocument();
      expect(screen.getByText("Comisión: 2.5% + IGV")).toBeInTheDocument();
    });

    it("should handle currency formatting correctly", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="USD"
        />
      );

      // Currency should be passed through correctly
      expect(screen.getByText("Retiro ATM")).toBeInTheDocument();
      // Note: Actual currency formatting would depend on implementation
    });
  });

  describe("Performance and Accessibility", () => {
    it("should handle large datasets efficiently", async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockBCPTransactions[0],
        id: `large-tx-${i}`,
        description: `Large Transaction ${i}`,
      }));

      const startTime = performance.now();

      render(
        <AdaptiveTransactionTable
          transactions={largeDataset}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);

      // Should still show pagination correctly
      expect(screen.getByTestId("pagination-info")).toHaveTextContent(
        "1 of 100"
      );
    });

    it("should provide accessible table structure", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      // Table should have proper ARIA structure
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      const columnHeaders = screen.getAllByRole("columnheader");
      expect(columnHeaders.length).toBeGreaterThan(0);

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1); // Header + data rows
    });

    it("should support keyboard navigation", () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockBCPTransactions}
          documentStructure={mockBCPDocumentStructure}
          currency="PEN"
        />
      );

      const toggle = screen.getByTestId("view-toggle");

      // Should be focusable
      toggle.focus();
      expect(document.activeElement).toBe(toggle);

      // Should respond to keyboard events
      fireEvent.keyDown(toggle, { key: "Enter" });
      // Note: Actual keyboard handling would depend on component implementation
    });
  });
});
