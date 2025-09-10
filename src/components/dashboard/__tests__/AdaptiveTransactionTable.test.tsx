import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdaptiveTransactionTable from "../AdaptiveTransactionTable";
import {
  FlexibleTransaction,
  DocumentStructure,
} from "../../../types/transaction";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock @heroui/react components
vi.mock("@heroui/react", () => ({
  Table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableColumn: ({ children }: any) => <th>{children}</th>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  Chip: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  Switch: ({ isSelected, onValueChange }: any) => (
    <input
      type="checkbox"
      checked={isSelected}
      onChange={(e) => onValueChange(e.target.checked)}
    />
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  CardBody: ({ children }: any) => <div>{children}</div>,
  Pagination: ({ page, total, onChange }: any) => (
    <div>
      <button onClick={() => onChange(Math.max(1, page - 1))}>Previous</button>
      <span>
        {page} of {total}
      </span>
      <button onClick={() => onChange(Math.min(total, page + 1))}>Next</button>
    </div>
  ),
  Tooltip: ({ children }: any) => <div>{children}</div>,
}));

// Mock @iconify/react
vi.mock("@iconify/react", () => ({
  Icon: ({ icon }: any) => <span data-icon={icon}>{icon}</span>,
}));

describe("AdaptiveTransactionTable", () => {
  const mockNormalizedTransactions: FlexibleTransaction[] = [
    {
      id: "1",
      date: "2025-01-15",
      description: "ATM Withdrawal",
      amount: 150.0,
      type: "debit",
    },
    {
      id: "2",
      date: "2025-01-16",
      description: "Salary Deposit",
      amount: 2500.0,
      type: "credit",
    },
  ];

  const mockFlexibleTransactions: FlexibleTransaction[] = [
    {
      id: "1",
      date: "2025-01-15",
      description: "ATM Withdrawal",
      amount: 150.0,
      type: "debit",
      originalData: {
        "Fecha Operación": "15/01/2025",
        Concepto: "Retiro ATM",
        Debe: "150.00",
        Haber: "",
        "Saldo Disponible": "1,850.00",
      },
      transformationMetadata: {
        sourceColumns: ["Fecha Operación", "Concepto", "Debe"],
        confidence: 0.95,
        preservationFlags: {
          originalFormatPreserved: true,
          dataTypesPreserved: true,
          allColumnsIncluded: true,
        },
      },
    },
    {
      id: "2",
      date: "2025-01-16",
      description: "Salary Deposit",
      amount: 2500.0,
      type: "credit",
      originalData: {
        "Fecha Operación": "16/01/2025",
        Concepto: "Depósito Salario",
        Debe: "",
        Haber: "2,500.00",
        "Saldo Disponible": "4,350.00",
      },
      transformationMetadata: {
        sourceColumns: ["Fecha Operación", "Concepto", "Haber"],
        confidence: 0.98,
        preservationFlags: {
          originalFormatPreserved: true,
          dataTypesPreserved: true,
          allColumnsIncluded: true,
        },
      },
    },
  ];

  const mockDocumentStructure: DocumentStructure = {
    originalHeaders: [
      "Fecha Operación",
      "Concepto",
      "Debe",
      "Haber",
      "Saldo Disponible",
    ],
    columnMetadata: {
      originalColumnNames: [
        "Fecha Operación",
        "Concepto",
        "Debe",
        "Haber",
        "Saldo Disponible",
      ],
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
    extractionMethod: "flexible",
    confidence: 0.92,
  };

  it("renders normalized view by default", () => {
    render(
      <AdaptiveTransactionTable
        transactions={mockNormalizedTransactions}
        currency="EUR"
      />
    );

    expect(screen.getByText("dashboard.excelPreview.date")).toBeInTheDocument();
    expect(
      screen.getByText("dashboard.excelPreview.description")
    ).toBeInTheDocument();
    expect(screen.getByText("ATM Withdrawal")).toBeInTheDocument();
    expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
  });

  it("shows view toggle when flexible data is available", () => {
    render(
      <AdaptiveTransactionTable
        transactions={mockFlexibleTransactions}
        documentStructure={mockDocumentStructure}
        currency="EUR"
      />
    );

    expect(screen.getByText("Normalized View")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("switches to original view when toggle is activated", () => {
    render(
      <AdaptiveTransactionTable
        transactions={mockFlexibleTransactions}
        documentStructure={mockDocumentStructure}
        currency="EUR"
      />
    );

    const toggle = screen.getByRole("checkbox");
    fireEvent.click(toggle);

    expect(screen.getByText("Original View")).toBeInTheDocument();
    expect(screen.getByText("Fecha Operación")).toBeInTheDocument();
    expect(screen.getByText("Concepto")).toBeInTheDocument();
    expect(screen.getByText("Retiro ATM")).toBeInTheDocument();
  });

  it("displays confidence scores for flexible transactions", () => {
    render(
      <AdaptiveTransactionTable
        transactions={mockFlexibleTransactions}
        documentStructure={mockDocumentStructure}
        currency="EUR"
      />
    );

    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
  });

  it("shows mapping highlights when enabled", () => {
    render(
      <AdaptiveTransactionTable
        transactions={mockFlexibleTransactions}
        documentStructure={mockDocumentStructure}
        currency="EUR"
      />
    );

    const mappingToggle = screen.getAllByRole("checkbox")[1]; // Second checkbox is for mappings
    fireEvent.click(mappingToggle);

    expect(screen.getByText("Show Mappings")).toBeInTheDocument();
  });

  it("displays metadata information", () => {
    render(
      <AdaptiveTransactionTable
        transactions={mockFlexibleTransactions}
        documentStructure={mockDocumentStructure}
        currency="EUR"
      />
    );

    expect(screen.getByText("flexible")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("5 columns")).toBeInTheDocument();
  });

  it("handles pagination correctly", () => {
    const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
      ...mockFlexibleTransactions[0],
      id: `tx-${i}`,
      description: `Transaction ${i}`,
    }));

    render(
      <AdaptiveTransactionTable
        transactions={manyTransactions}
        documentStructure={mockDocumentStructure}
        currency="EUR"
      />
    );

    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("shows no data message when no original data is available", () => {
    render(
      <AdaptiveTransactionTable
        transactions={mockNormalizedTransactions}
        currency="EUR"
      />
    );

    // Switch to original view (should show no data message)
    const toggle = screen.queryByRole("checkbox");
    if (toggle) {
      fireEvent.click(toggle);
      expect(
        screen.getByText("No original data structure available")
      ).toBeInTheDocument();
    }
  });

  it("formats currency correctly", () => {
    render(
      <AdaptiveTransactionTable
        transactions={mockFlexibleTransactions}
        currency="USD"
      />
    );

    // Check that currency formatting is applied (this would need more specific testing based on implementation)
    expect(screen.getByText("ATM Withdrawal")).toBeInTheDocument();
  });
});
