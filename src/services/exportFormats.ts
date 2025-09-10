import { Transaction } from "./api";
import { CategorizationService } from "./categorization";

export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  extension: string;
  icon: string;
  supportsCategorization: boolean;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: "csv",
    name: "CSV (Excel)",
    description:
      "Comma-separated values, compatible with Excel and Google Sheets",
    extension: "csv",
    icon: "lucide:file-spreadsheet",
    supportsCategorization: true,
  },
  {
    id: "qif",
    name: "QIF (Quicken)",
    description:
      "Quicken Interchange Format, compatible with most accounting software",
    extension: "qif",
    icon: "lucide:calculator",
    supportsCategorization: true,
  },
  {
    id: "ofx",
    name: "OFX (Money)",
    description:
      "Open Financial Exchange, used by banks and financial institutions",
    extension: "ofx",
    icon: "lucide:building-2",
    supportsCategorization: false,
  },
  {
    id: "json",
    name: "JSON (Developers)",
    description: "JavaScript Object Notation, perfect for developers and APIs",
    extension: "json",
    icon: "lucide:code",
    supportsCategorization: true,
  },
  {
    id: "xlsx",
    name: "Excel (Advanced)",
    description: "Native Excel format with multiple sheets and charts",
    extension: "xlsx",
    icon: "lucide:file-bar-chart",
    supportsCategorization: true,
  },
];

export class ExportService {
  static downloadFile(
    content: string | Blob,
    filename: string,
    mimeType: string = "text/plain"
  ) {
    const blob =
      content instanceof Blob
        ? content
        : new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static formatDate(date: string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toISOString().split("T")[0]; // YYYY-MM-DD format
  }

  static formatQifDate(date: string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    // QIF uses MM/DD/YYYY format
    return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
      .getDate()
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  }

  static formatOfxDate(date: string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    // OFX uses YYYYMMDD format
    return (
      d.getFullYear().toString() +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      d.getDate().toString().padStart(2, "0")
    );
  }

  static exportCSV(
    transactions: Transaction[],
    filename: string,
    includeCategories: boolean = true
  ): void {
    const headers = includeCategories
      ? [
          "Fecha",
          "Descripción",
          "Categoría",
          "Subcategoría",
          "Importe",
          "Saldo",
        ]
      : ["Fecha", "Descripción", "Importe", "Saldo"];

    const rows = transactions.map((transaction) => {
      const baseRow = [
        this.formatDate(transaction.date || transaction.post_date),
        transaction.description,
      ];

      if (includeCategories) {
        baseRow.push(
          CategorizationService.getCategoryInfo(transaction.category || "other")
            ?.name || "Otros",
          transaction.subcategory || ""
        );
      }

      baseRow.push(
        transaction.amount.toString(),
        (transaction.balance || 0).toString()
      );

      return baseRow;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const value = cell.toString();
            if (
              value.includes(",") ||
              value.includes('"') ||
              value.includes("\n")
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    this.downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
  }

  static exportQIF(
    transactions: Transaction[],
    filename: string,
    includeCategories: boolean = true
  ): void {
    const qifContent = [
      "!Type:Bank",
      ...transactions.map((transaction) => {
        const lines = [
          `D${this.formatQifDate(transaction.date || transaction.post_date)}`,
          `T${transaction.amount}`,
          `P${transaction.description}`,
        ];

        if (
          includeCategories &&
          transaction.category &&
          transaction.category !== "other"
        ) {
          const categoryInfo = CategorizationService.getCategoryInfo(
            transaction.category
          );
          const categoryName = categoryInfo?.name || "Otros";
          lines.push(
            `L${categoryName}${
              transaction.subcategory ? ":" + transaction.subcategory : ""
            }`
          );
        }

        if (transaction.reference) {
          lines.push(`N${transaction.reference}`);
        }

        lines.push("^"); // End of transaction marker
        return lines.join("\n");
      }),
    ].join("\n");

    this.downloadFile(qifContent, filename, "application/qif");
  }

  static exportOFX(
    transactions: Transaction[],
    filename: string,
    accountNumber: string = "UNKNOWN",
    bankName: string = "UNKNOWN"
  ): void {
    const startDate =
      transactions.length > 0
        ? this.formatOfxDate(transactions[0].date || transactions[0].post_date)
        : this.formatOfxDate(new Date().toISOString());
    const endDate =
      transactions.length > 0
        ? this.formatOfxDate(
            transactions[transactions.length - 1].date ||
              transactions[transactions.length - 1].post_date
          )
        : this.formatOfxDate(new Date().toISOString());

    const ofxTransactions = transactions
      .map(
        (transaction, index) => `
    <STMTTRN>
      <TRNTYPE>${transaction.amount >= 0 ? "CREDIT" : "DEBIT"}</TRNTYPE>
      <DTPOSTED>${this.formatOfxDate(
        transaction.date || transaction.post_date
      )}</DTPOSTED>
      <TRNAMT>${transaction.amount}</TRNAMT>
      <FITID>${transaction.id || `TXN${index + 1}`}</FITID>
      <NAME>${transaction.description.substring(0, 32)}</NAME>
      <MEMO>${transaction.description}</MEMO>
    </STMTTRN>`
      )
      .join("");

    const ofxContent = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <DTSERVER>${this.formatOfxDate(new Date().toISOString())}</DTSERVER>
      <LANGUAGE>ENG</LANGUAGE>
    </SONRS>
  </SIGNONMSGSRSV1>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>1</TRNUID>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <STMTRS>
        <CURDEF>EUR</CURDEF>
        <BANKACCTFROM>
          <BANKID>${bankName}</BANKID>
          <ACCTID>${accountNumber}</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>${startDate}</DTSTART>
          <DTEND>${endDate}</DTEND>
          ${ofxTransactions}
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>${
            transactions.length > 0
              ? transactions[transactions.length - 1].balance || 0
              : 0
          }</BALAMT>
          <DTASOF>${this.formatOfxDate(new Date().toISOString())}</DTASOF>
        </LEDGERBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

    this.downloadFile(ofxContent, filename, "application/x-ofx");
  }

  static exportJSON(
    transactions: Transaction[],
    filename: string,
    meta?: any
  ): void {
    const exportData = {
      meta: {
        exportDate: new Date().toISOString(),
        totalTransactions: transactions.length,
        ...meta,
      },
      transactions: transactions.map((transaction) => ({
        ...transaction,
        categoryInfo: transaction.category
          ? CategorizationService.getCategoryInfo(transaction.category)
          : null,
      })),
      summary: {
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        creditTotal: transactions
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0),
        debitTotal: transactions
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0),
        categorySummary: this.getCategorySummary(transactions),
      },
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, filename, "application/json");
  }

  static getCategorySummary(
    transactions: Transaction[]
  ): Record<string, { count: number; total: number }> {
    const summary: Record<string, { count: number; total: number }> = {};

    transactions.forEach((transaction) => {
      const category = transaction.category || "other";
      const categoryInfo = CategorizationService.getCategoryInfo(category);
      const categoryName = categoryInfo?.name || "Otros";

      if (!summary[categoryName]) {
        summary[categoryName] = { count: 0, total: 0 };
      }

      summary[categoryName].count++;
      summary[categoryName].total += transaction.amount;
    });

    return summary;
  }

  static exportXLSX(transactions: Transaction[], filename: string): void {
    // For now, we'll create a rich CSV that can be opened in Excel
    // In a real implementation, you'd use a library like SheetJS
    const csvContent = this.createAdvancedCSV(transactions);
    this.downloadFile(
      csvContent,
      filename.replace(".xlsx", ".csv"),
      "text/csv;charset=utf-8;"
    );
  }

  private static createAdvancedCSV(transactions: Transaction[]): string {
    const categories = CategorizationService.getAllCategories();
    const categorySummary = this.getCategorySummary(transactions);

    // Main transactions sheet
    const mainHeaders = [
      "Fecha",
      "Descripción",
      "Categoría",
      "Subcategoría",
      "Importe",
      "Saldo",
      "Referencia",
    ];
    const mainRows = transactions.map((transaction) => [
      this.formatDate(transaction.date || transaction.post_date),
      transaction.description,
      CategorizationService.getCategoryInfo(transaction.category || "other")
        ?.name || "Otros",
      transaction.subcategory || "",
      transaction.amount.toString(),
      (transaction.balance || 0).toString(),
      transaction.reference || "",
    ]);

    // Summary section
    const summarySection = [
      "",
      "=== RESUMEN POR CATEGORÍAS ===",
      "Categoría,Cantidad de Transacciones,Total Importe",
      ...Object.entries(categorySummary).map(
        ([category, data]) => `${category},${data.count},${data.total}`
      ),
    ];

    const allContent = [
      mainHeaders.join(","),
      ...mainRows.map((row) =>
        row
          .map((cell) => {
            const value = cell.toString();
            if (
              value.includes(",") ||
              value.includes('"') ||
              value.includes("\n")
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
      ...summarySection,
    ].join("\n");

    return allContent;
  }

  static getAllFormats(): ExportFormat[] {
    return EXPORT_FORMATS;
  }

  static getFormat(id: string): ExportFormat | undefined {
    return EXPORT_FORMATS.find((format) => format.id === id);
  }

  // Unified export method to eliminate duplicate switch statements
  static exportTransactions(
    transactions: Transaction[],
    format: string,
    filename: string,
    meta?: any
  ): void {
    const formatInfo = this.getFormat(format);
    if (!formatInfo) {
      console.warn(`Unknown export format: ${format}, defaulting to CSV`);
      this.exportCSV(transactions, filename, true);
      return;
    }

    const finalFilename = filename.includes(".")
      ? filename
      : `${filename}.${formatInfo.extension}`;

    switch (format) {
      case "csv":
        this.exportCSV(transactions, finalFilename, true);
        break;
      case "qif":
        this.exportQIF(transactions, finalFilename, true);
        break;
      case "ofx":
        this.exportOFX(
          transactions,
          finalFilename,
          meta?.account_number || "UNKNOWN",
          meta?.bank_name || "UNKNOWN"
        );
        break;
      case "json":
        this.exportJSON(transactions, finalFilename, meta);
        break;
      case "xlsx":
        this.exportXLSX(transactions, finalFilename);
        break;
      default:
        this.exportCSV(transactions, finalFilename, true);
    }
  }
}
