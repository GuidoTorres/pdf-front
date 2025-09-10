import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EnhancedTransactionPreview from "../EnhancedTransactionPreview";
import { DocumentWithStatus } from "../../../stores/useDocumentStore";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return key.replace(
          /\{\{(\w+)\}\}/g,
          (match, param) => params[param] || match
        );
      }
      return key;
    },
  }),
}));

// Mock @heroui/react components
vi.mock("@heroui/react", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardBody: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  Tabs: ({ children, selectedKey, onSelectionChange }: any) => (
    <div>
      <div data-testid="tabs-container">{children}</div>
      <button onClick={() => onSelectionChange("metadata")}>
        Switch to Metadata
      </button>
    </div>
  ),
  Tab: ({ children, title }: any) => (
    <div>
      <div data-testid="tab-title">{title}</div>
      <div>{children}</div>
    </div>
  ),
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  Chip: ({ children, color, variant }: any) => (
    <span className={`chip-${color}-${variant}`}>{children}</span>
  ),
}));

// Mock @iconify/react
vi.mock("@iconify/react", () => ({
  Icon: ({ icon }: any) => <span data-icon={icon}>{icon}</span>,
}));

// Mock the child components
vi.mock("../AdaptiveTransactionTable", () => ({
  default: ({ transactions, documentStructure }: any) => (
    <div data-testid="adaptive-transaction-table">
      <div>Transactions: {transactions.length}</div>
      <div>Structure: {documentStructure ? "Available" : "Not Available"}</div>
    </div>
  ),
}));

vi.mock("../ExtractionMetadataPanel", () => ({
  default: ({ documentStructure, transactions }: any) => (
    <div data-testid="extraction-metadata-panel">
      <div>Metadata Panel</div>
      <div>Transactions: {transactions.length}</div>
      <div>Structure: {documentStructure ? "Available" : "Not Available"}</div>
    </div>
  ),
}));

vi.mock("../ExcelExportButton", () => ({
  default: ({
    document,
    onExportStart,
    onExportComplete,
    onExportError,
  }: any) => (
    <button
      data-testid="excel-export-button"
      onClick={() => {
        onExportStart?.();
        onExportComplete?.(true, "test.xlsx");
      }}
    >
      Export to Excel
    </button>
  ),
}));

describe("EnhancedTransactionPreview", () => {
  const mockCompletedDocument: DocumentWithStatus = {
    id: "doc-1",
    fileName: "test-statement.pdf",
    status: "completed",
    transactions: [
      {
        id: "tx-1",
        date: "2025-01-15",
        description: "ATM Withdrawal",
        amount: -150.0,
        type: "debit",
        balance: 1850.0,
      },
      {
        id: "tx-2",
        date: "2025-01-16",
        description: "Salary Deposit",
        amount: 2500.0,
        type: "credit",
        balance: 4350.0,
      },
    ],
    meta: {
      currency: "EUR",
      bank_name: "Test Bank",
    },
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:05:00Z",
  };

  const mockProcessingDocument: DocumentWithStatus = {
    ...mockCompletedDocument,
    status: "processing",
  };

  const mockNotificationHandler = vi.fn();

  it("renders no document state correctly", () => {
    render(
      <EnhancedTransactionPreview
        currentDocument={null}
        onShowNotification={mockNotificationHandler}
      />
    );

    expect(screen.getByText("No Document Selected")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Upload and process a bank statement to view the enhanced preview"
      )
    ).toBeInTheDocument();
  });

  it("renders processing state correctly", () => {
    render(
      <EnhancedTransactionPreview
        currentDocument={mockProcessingDocument}
        onShowNotification={mockNotificationHandler}
      />
    );

    expect(screen.getByText("Document Processing")).toBeInTheDocument();
    expect(
      screen.getByText("Please wait while the document is being processed")
    ).toBeInTheDocument();
  });

  it("renders completed document with transactions", () => {
    render(
      <EnhancedTransactionPreview
        currentDocument={mockCompletedDocument}
        onShowNotification={mockNotificationHandler}
      />
    );

    expect(screen.getByText("Enhanced Preview")).toBeInTheDocument();
    expect(
      screen.getByText("test-statement.pdf • 2 transactions")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("adaptive-transaction-table")
    ).toBeInTheDocument();
  });

  it("shows flexible data chip when available", () => {
    render(
      <EnhancedTransactionPreview
        currentDocument={mockCompletedDocument}
        onShowNotification={mockNotificationHandler}
      />
    );

    expect(screen.getByText("Flexible Data")).toBeInTheDocument();
  });

  it("renders Excel export button", () => {
    render(
      <EnhancedTransactionPreview
        currentDocument={mockCompletedDocument}
        onShowNotification={mockNotificationHandler}
      />
    );

    expect(screen.getByTestId("excel-export-button")).toBeInTheDocument();
  });

  it("handles Excel export notifications", () => {
    render(
      <EnhancedTransactionPreview
        currentDocument={mockCompletedDocument}
        onShowNotification={mockNotificationHandler}
      />
    );

    const exportButton = screen.getByTestId("excel-export-button");
    fireEvent.click(exportButton);

    expect(mockNotificationHandler).toHaveBeenCalledWith(
      "dashboard.export.excelExportStarted",
      "info"
    );
    expect(mockNotificationHandler).toHaveBeenCalledWith(
      "dashboard.export.excelExportSuccess",
      "success"
    );
  });

  it("displays transaction count in tabs", () => {
    render(
      <EnhancedTransactionPreview
        currentDocument={mockCompletedDocument}
        onShowNotification={mockNotificationHandler}
      />
    );

    expect(screen.getByText("2")).toBeInTheDocument(); // Transaction count chip
  });

  it("switches between tabs correctly", () => {
    render(
      <EnhancedTransactionPreview
        currentDocument={mockCompletedDocument}
        onShowNotification={mockNotificationHandler}
      />
    );

    // Initially shows transactions tab
    expect(
      screen.getByTestId("adaptive-transaction-table")
    ).toBeInTheDocument();

    // Switch to metadata tab
    const switchButton = screen.getByText("Switch to Metadata");
    fireEvent.click(switchButton);

    // Should show metadata panel
    expect(screen.getByTestId("extraction-metadata-panel")).toBeInTheDocument();
  });

  it("displays document metadata correctly", () => {
    render(
      <EnhancedTransactionPreview
        currentDocument={mockCompletedDocument}
        onShowNotification={mockNotificationHandler}
      />
    );

    expect(
      screen.getByText("test-statement.pdf • 2 transactions")
    ).toBeInTheDocument();
  });

  it("handles documents without currency gracefully", () => {
    const documentWithoutCurrency = {
      ...mockCompletedDocument,
      meta: {
        bank_name: "Test Bank",
      },
    };

    render(
      <EnhancedTransactionPreview
        currentDocument={documentWithoutCurrency}
        onShowNotification={mockNotificationHandler}
      />
    );

    expect(screen.getByText("Enhanced Preview")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EnhancedTransactionPreview
        currentDocument={mockCompletedDocument}
        onShowNotification={mockNotificationHandler}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
