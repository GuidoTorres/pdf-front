import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdaptiveTransactionTable from "../../components/dashboard/AdaptiveTransactionTable";
import ExcelExportButton from "../../components/dashboard/ExcelExportButton";
import {
  FlexibleTransaction,
  DocumentStructure,
} from "../../types/transaction";
import { DocumentWithStatus } from "../../stores/useDocumentStore";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock @heroui/react with responsive behavior
vi.mock("@heroui/react", () => ({
  Table: ({ children, className, ...props }: any) => (
    <div className={`table-responsive ${className}`} {...props}>
      <table>{children}</table>
    </div>
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

// Mock window resize functionality
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

global.ResizeObserver = mockResizeObserver;

describe("Responsive Transaction View Tests - Requirement 4.4", () => {
  const mockTransactions: FlexibleTransaction[] = [
    {
      id: "tx1",
      date: "2025-01-15",
      description:
        "ATM Withdrawal with very long description that might overflow",
      amount: -150.0,
      type: "debit",
      originalData: {
        "Fecha Operación": "15/01/2025",
        "Concepto Detallado":
          "ATM Withdrawal with very long description that might overflow",
        "Número de Referencia": "REF-123456789012345",
        Debe: "150.00",
        Haber: "",
        "Saldo Disponible": "1,850.00",
        Comisión: "2.50",
        IGV: "0.45",
        Moneda: "PEN",
        Canal: "ATM",
        Ubicación: "Av. Javier Prado Este 123, San Isidro, Lima",
      },
    },
    {
      id: "tx2",
      date: "2025-01-16",
      description: "Salary Deposit",
      amount: 2500.0,
      type: "credit",
      originalData: {
        "Fecha Operación": "16/01/2025",
        "Concepto Detallado": "Salary Deposit",
        "Número de Referencia": "SAL-987654321098765",
        Debe: "",
        Haber: "2,500.00",
        "Saldo Disponible": "4,350.00",
        Comisión: "0.00",
        IGV: "0.00",
        Moneda: "PEN",
        Canal: "Online",
        Ubicación: "N/A",
      },
    },
  ];

  const mockWideDocumentStructure: DocumentStructure = {
    originalHeaders: [
      "Fecha Operación",
      "Concepto Detallado",
      "Número de Referencia",
      "Debe",
      "Haber",
      "Saldo Disponible",
      "Comisión",
      "IGV",
      "Moneda",
      "Canal",
      "Ubicación",
    ],
    columnMetadata: {
      originalColumnNames: [
        "Fecha Operación",
        "Concepto Detallado",
        "Número de Referencia",
        "Debe",
        "Haber",
        "Saldo Disponible",
        "Comisión",
        "IGV",
        "Moneda",
        "Canal",
        "Ubicación",
      ],
      normalizedColumnNames: [
        "date",
        "description",
        "reference",
        "debit",
        "credit",
        "balance",
        "fee",
        "tax",
        "currency",
        "channel",
        "location",
      ],
      columnTypes: [
        "date",
        "text",
        "text",
        "currency",
        "currency",
        "currency",
        "currency",
        "currency",
        "text",
        "text",
        "text",
      ],
      dataPatterns: [
        "dd/mm/yyyy",
        "text",
        "text",
        "decimal",
        "decimal",
        "decimal",
        "decimal",
        "decimal",
        "text",
        "text",
        "text",
      ],
    },
    preservedData: true,
    extractionMethod: "table_based",
    confidence: 0.95,
  };

  const mockDocument: DocumentWithStatus = {
    id: "doc-123",
    job_id: "job-123",
    user_id: "user-123",
    original_file_name: "wide_statement.pdf",
    status: "completed",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:05:00Z",
    pages_processed: 3,
    file_size: 1024000,
    transactions: JSON.stringify(mockTransactions),
    original_structure: JSON.stringify(mockWideDocumentStructure),
    extract_type: "bank_statement",
    bank_type: "bcp",
  };

  // Helper function to simulate screen resize
  const resizeScreen = (width: number, height: number = 768) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event("resize"));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to desktop size
    resizeScreen(1920, 1080);
  });

  describe("Mobile Screen Behavior (320px - 768px)", () => {
    it("should render table on mobile screens without horizontal overflow", () => {
      resizeScreen(375); // iPhone size

      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      const tableContainer = screen.getByRole("table").parentElement;
      expect(tableContainer).toHaveClass("table-responsive");

      // Should still show all data
      expect(
        screen.getByText(
          "ATM Withdrawal with very long description that might overflow"
        )
      ).toBeInTheDocument();
    });

    it("should handle wide original view on mobile", () => {
      resizeScreen(320); // Small mobile

      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Switch to original view
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // Should show all 11 columns
      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(11);

      // Should show original data
      expect(screen.getByText("Fecha Operación")).toBeInTheDocument();
      expect(
        screen.getByText("Av. Javier Prado Este 123, San Isidro, Lima")
      ).toBeInTheDocument();
    });

    it("should maintain pagination functionality on mobile", () => {
      resizeScreen(375);

      // Create many transactions for pagination
      const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
        ...mockTransactions[0],
        id: `mobile-tx-${i}`,
        description: `Mobile Transaction ${i}`,
      }));

      render(
        <AdaptiveTransactionTable
          transactions={manyTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Pagination should work on mobile
      expect(screen.getByTestId("pagination-info")).toHaveTextContent("1 of 3");

      const nextButton = screen.getByTestId("pagination-next");
      fireEvent.click(nextButton);

      expect(screen.getByTestId("pagination-info")).toHaveTextContent("2 of 3");
    });

    it("should handle export button on mobile screens", () => {
      resizeScreen(375);

      render(
        <ExcelExportButton document={mockDocument} variant="solid" size="sm" />
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("sm"); // Should use smaller size on mobile
    });
  });

  describe("Tablet Screen Behavior (768px - 1024px)", () => {
    it("should optimize layout for tablet screens", () => {
      resizeScreen(768);

      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Should render without issues
      expect(
        screen.getByText(
          "ATM Withdrawal with very long description that might overflow"
        )
      ).toBeInTheDocument();

      // Toggle should be accessible
      const toggle = screen.getByTestId("view-toggle");
      expect(toggle).toBeInTheDocument();
    });

    it("should handle landscape tablet orientation", () => {
      resizeScreen(1024, 768); // Landscape tablet

      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Switch to original view
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // Should show all columns comfortably
      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(11);
    });
  });

  describe("Desktop Screen Behavior (1024px+)", () => {
    it("should display full table layout on desktop", () => {
      resizeScreen(1920);

      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Should show all data without scrolling issues
      expect(
        screen.getByText(
          "ATM Withdrawal with very long description that might overflow"
        )
      ).toBeInTheDocument();

      // Switch to original view
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // All 11 columns should be visible
      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(11);
    });

    it("should handle ultra-wide screens", () => {
      resizeScreen(3440, 1440); // Ultra-wide monitor

      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Should utilize available space efficiently
      expect(
        screen.getByText(
          "ATM Withdrawal with very long description that might overflow"
        )
      ).toBeInTheDocument();
    });
  });

  describe("Dynamic Resize Behavior", () => {
    it("should adapt when screen size changes", async () => {
      const { rerender } = render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Start on desktop
      resizeScreen(1920);
      expect(
        screen.getByText(
          "ATM Withdrawal with very long description that might overflow"
        )
      ).toBeInTheDocument();

      // Resize to mobile
      resizeScreen(375);
      rerender(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Should still work on mobile
      expect(
        screen.getByText(
          "ATM Withdrawal with very long description that might overflow"
        )
      ).toBeInTheDocument();
    });

    it("should maintain view state during resize", async () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Switch to original view on desktop
      resizeScreen(1920);
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);
      expect(screen.getByText("Original View")).toBeInTheDocument();

      // Resize to mobile
      resizeScreen(375);

      // Should maintain original view
      expect(screen.getByText("Original View")).toBeInTheDocument();
      expect(screen.getByText("Fecha Operación")).toBeInTheDocument();
    });
  });

  describe("Content Overflow Handling", () => {
    it("should handle long text content gracefully", () => {
      const longTextTransaction: FlexibleTransaction = {
        id: "long-tx",
        date: "2025-01-15",
        description:
          "This is an extremely long transaction description that should test how the component handles text overflow and wrapping in different screen sizes and should not break the layout",
        amount: -100.0,
        type: "debit",
        originalData: {
          "Descripción Muy Larga":
            "This is an extremely long transaction description that should test how the component handles text overflow and wrapping in different screen sizes and should not break the layout",
          "Referencia Extendida":
            "REF-VERY-LONG-REFERENCE-NUMBER-THAT-MIGHT-CAUSE-OVERFLOW-ISSUES-123456789012345678901234567890",
        },
      };

      resizeScreen(375); // Mobile

      render(
        <AdaptiveTransactionTable
          transactions={[longTextTransaction]}
          currency="PEN"
        />
      );

      // Should render without breaking layout
      expect(
        screen.getByText(/This is an extremely long transaction description/)
      ).toBeInTheDocument();

      // Switch to original view
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      expect(
        screen.getByText(/REF-VERY-LONG-REFERENCE-NUMBER/)
      ).toBeInTheDocument();
    });

    it("should handle many columns on narrow screens", () => {
      resizeScreen(320); // Very narrow

      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Switch to original view with 11 columns
      const toggle = screen.getByTestId("view-toggle");
      fireEvent.click(toggle);

      // All columns should be accessible
      expect(screen.getByText("Fecha Operación")).toBeInTheDocument();
      expect(screen.getByText("Ubicación")).toBeInTheDocument();
    });
  });

  describe("Touch and Mobile Interaction", () => {
    it("should handle touch interactions on mobile", () => {
      resizeScreen(375);

      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      const toggle = screen.getByTestId("view-toggle");

      // Simulate touch events
      fireEvent.touchStart(toggle);
      fireEvent.touchEnd(toggle);
      fireEvent.click(toggle);

      expect(screen.getByText("Original View")).toBeInTheDocument();
    });

    it("should handle swipe gestures for pagination", () => {
      resizeScreen(375);

      const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
        ...mockTransactions[0],
        id: `swipe-tx-${i}`,
        description: `Swipe Transaction ${i}`,
      }));

      render(
        <AdaptiveTransactionTable
          transactions={manyTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Pagination should work with touch
      const nextButton = screen.getByTestId("pagination-next");
      fireEvent.touchStart(nextButton);
      fireEvent.touchEnd(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByTestId("pagination-info")).toHaveTextContent("2 of 3");
    });
  });

  describe("Performance on Different Screen Sizes", () => {
    it("should render efficiently on mobile with large datasets", async () => {
      resizeScreen(375);

      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...mockTransactions[0],
        id: `perf-mobile-tx-${i}`,
        description: `Performance Mobile Transaction ${i}`,
      }));

      const startTime = performance.now();

      render(
        <AdaptiveTransactionTable
          transactions={largeDataset}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time even on mobile
      expect(renderTime).toBeLessThan(1000);

      // Should show pagination
      expect(screen.getByTestId("pagination-info")).toHaveTextContent(
        "1 of 10"
      );
    });

    it("should handle screen orientation changes", async () => {
      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Portrait mobile
      resizeScreen(375, 667);
      expect(
        screen.getByText(
          "ATM Withdrawal with very long description that might overflow"
        )
      ).toBeInTheDocument();

      // Landscape mobile
      resizeScreen(667, 375);
      expect(
        screen.getByText(
          "ATM Withdrawal with very long description that might overflow"
        )
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility on Different Screen Sizes", () => {
    it("should maintain accessibility on mobile screens", () => {
      resizeScreen(375);

      render(
        <AdaptiveTransactionTable
          transactions={mockTransactions}
          documentStructure={mockWideDocumentStructure}
          currency="PEN"
        />
      );

      // Table structure should be preserved
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole("columnheader");
      expect(headers.length).toBeGreaterThan(0);

      // Toggle should be accessible
      const toggle = screen.getByTestId("view-toggle");
      toggle.focus();
      expect(document.activeElement).toBe(toggle);
    });

    it("should support screen readers on all screen sizes", () => {
      [375, 768, 1920].forEach((width) => {
        resizeScreen(width);

        const { unmount } = render(
          <AdaptiveTransactionTable
            transactions={mockTransactions}
            documentStructure={mockWideDocumentStructure}
            currency="PEN"
          />
        );

        // Table should have proper structure for screen readers
        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        unmount();
      });
    });
  });
});
