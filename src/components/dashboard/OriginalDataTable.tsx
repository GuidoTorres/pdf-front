import React, { useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { DocumentWithStatus } from "../../stores/useDocumentStore";
import EmptyState from "../EmptyState";

interface OriginalDataTableProps {
  currentDocument: DocumentWithStatus | null;
}

interface OriginalStructure {
  originalHeaders: string[];
  columnMetadata?: {
    originalColumnNames: string[];
    normalizedColumnNames: string[];
    columnTypes: string[];
  };
  tables?: Array<{
    headers: string[];
    rows: any[][];
    tableId?: string;
    metadata?: any;
  }>;
}

interface ColumnMapping {
  tableId: string;
  columnMappings: Array<{
    originalName: string;
    normalizedName: string;
    standardType: string;
  }>;
}

// Function to infer column type from value for direct table format
const inferColumnType = (value: any): string => {
  if (typeof value === 'number') {
    return 'amount';
  }
  if (typeof value === 'string') {
    // Check if it looks like a date
    if (/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(value) || 
        /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return 'date';
    }
    // Check if it looks like a monetary amount
    if (/^-?\d+(\.\d{2})?$/.test(value) || /^[+\-]?\$?\d+(\,\d{3})*(\.\d{2})?$/.test(value)) {
      return 'amount';
    }
  }
  return 'text';
};

// Function to intelligently parse transaction lines into columns
const parseTransactionLine = (line: string): Record<string, string> => {
  if (!line || line.trim() === '') {
    return {};
  }

  const trimmedLine = line.trim();
  const parts = trimmedLine.split(/\s+/);
  
  // Common patterns for bank statements:
  // Pattern 1: DD/MM DESCRIPTION AMOUNT [BALANCE]
  // Pattern 2: DD/MM DESCRIPTION DEBIT CREDIT [BALANCE]
  
  const parsed: Record<string, string> = {};
  
  // Try to identify date at the beginning (DD/MM format)
  const datePattern = /^(\d{1,2}\/\d{1,2})/;
  const dateMatch = trimmedLine.match(datePattern);
  
  if (dateMatch) {
    parsed['Fecha'] = dateMatch[1];
    
    // Remove date from remaining text to parse description and amounts
    const remaining = trimmedLine.substring(dateMatch[0].length).trim();
    const remainingParts = remaining.split(/\s+/);
    
    // Extract numeric values (amounts) from the end
    const amounts: string[] = [];
    const descriptionParts: string[] = [];
    
    // Process parts from right to left to find amounts
    for (let i = remainingParts.length - 1; i >= 0; i--) {
      const part = remainingParts[i];
      // Check if it's a numeric value (including decimals and negative signs)
      if (/^-?\d+(\.\d{2})?$/.test(part)) {
        amounts.unshift(part);
      } else {
        // Everything else is part of description
        descriptionParts.unshift(part);
      }
    }
    
    // Build description from non-numeric parts
    if (descriptionParts.length > 0) {
      parsed['Concepto'] = descriptionParts.join(' ');
    }
    
    // Assign amounts based on how many we found
    if (amounts.length >= 1) {
      // If we have 2+ amounts, likely: amount + balance
      if (amounts.length >= 2) {
        parsed['Importe'] = amounts[0];
        parsed['Saldo'] = amounts[1];
      } else {
        // Single amount
        parsed['Importe'] = amounts[0];
      }
    }
    
    // If we have 3 amounts, might be: debit, credit, balance
    if (amounts.length >= 3) {
      parsed['Debe'] = amounts[0];
      parsed['Haber'] = amounts[1];
      parsed['Saldo'] = amounts[2];
      // Remove the generic 'Importe' in favor of specific debit/credit
      delete parsed['Importe'];
    }
  } else {
    // Fallback: if no clear date pattern, try to extract what we can
    const numericPattern = /\d+(\.\d{2})?/g;
    const amounts = trimmedLine.match(numericPattern) || [];
    const textParts = trimmedLine.replace(/\d+(\.\d{2})?/g, '').split(/\s+/).filter(p => p.trim());
    
    if (textParts.length > 0) {
      parsed['Concepto'] = textParts.join(' ').trim();
    }
    
    if (amounts.length > 0) {
      parsed['Importe'] = amounts[amounts.length - 1]; // Last amount is usually the main one
      
      if (amounts.length > 1) {
        parsed['Saldo'] = amounts[amounts.length - 1];
        parsed['Importe'] = amounts[amounts.length - 2];
      }
    }
  }
  
  return parsed;
};

const OriginalDataTable: React.FC<OriginalDataTableProps> = ({
  currentDocument,
}) => {
  const { t } = useTranslation();

  const originalData = useMemo(() => {
    if (!currentDocument) return null;

    // Debug logging
    console.log('🔍 OriginalDataTable - currentDocument:', {
      id: currentDocument.id,
      hasOriginalTable: !!currentDocument.originalTable,
      hasOriginalTransactions: !!currentDocument.originalTransactions,
      hasOriginalStructure: !!currentDocument.original_structure,
      originalTable: currentDocument.originalTable,
      allKeys: Object.keys(currentDocument)
    });

    let originalStructure: OriginalStructure | null = null;
    let columnMappings: ColumnMapping[] | null = null;

    // Priority 1: Check for new originalTable format (from GROQ dual format)
    if (currentDocument.originalTable && 
        currentDocument.originalTable.headers && 
        currentDocument.originalTable.rows) {
      console.log('✅ Using originalTable format from GROQ dual extraction');
      return {
        directTable: currentDocument.originalTable,
        structure: null,
        mappings: null
      };
    }

    // Priority 2: Legacy originalTransactions format (from Python processor)
    if (currentDocument.originalTransactions && currentDocument.originalTransactions.length > 0) {
      console.log('⚠️ Using legacy originalTransactions format');
      return {
        structure: { originalHeaders: [], tables: [] }, // Minimal structure for compatibility
        mappings: columnMappings,
        originalTransactions: currentDocument.originalTransactions
      };
    }

    // Priority 3: Fallback - Parse original_structure (oldest legacy format)
    if (currentDocument.original_structure) {
      try {
        originalStructure = JSON.parse(currentDocument.original_structure as string);
        console.log('⚠️ Using legacy original_structure format');
      } catch (e) {
        console.error("Failed to parse original_structure:", e);
      }
    }

    // Parse column_mappings
    if (currentDocument.column_mappings) {
      try {
        columnMappings = JSON.parse(currentDocument.column_mappings as string);
      } catch (e) {
        console.error("Failed to parse column_mappings:", e);
      }
    }

    return {
      structure: originalStructure,
      mappings: columnMappings,
    };
  }, [currentDocument]);

  // MOVE tableData useMemo here to execute all hooks before any early returns
  const tableData = useMemo(() => {
    if (!currentDocument || !originalData) return { headers: [], rows: [] };
    
    const { directTable, structure } = originalData;

    // Priority 1: Handle new directTable format from GROQ dual extraction
    if (directTable?.headers && directTable?.rows) {
      console.log('✅ Using direct table format from GROQ:', {
        headers: directTable.headers,
        rowCount: directTable.rows.length,
        sampleRow: directTable.rows[0]
      });
      
      // Ensure each row has the correct number of cells
      const normalizedRows = directTable.rows.map(row => {
        if (row.length === directTable.headers.length) {
          return row;
        }
        // Pad with empty strings or truncate to match header count
        const normalizedRow = [...row];
        while (normalizedRow.length < directTable.headers.length) {
          normalizedRow.push('');
        }
        return normalizedRow.slice(0, directTable.headers.length);
      });
      
      return {
        headers: directTable.headers,
        rows: normalizedRows
      };
    }

    // Priority 2: Handle legacy originalTransactions format from Python processor
    if (originalData?.originalTransactions && originalData.originalTransactions.length > 0) {
      console.log('🔍 OriginalDataTable - Found originalTransactions but they contain raw PDF lines, not transaction columns');
      console.log('🔄 Checking if processed transactions contain original_data instead...');
      
      // Check if current document transactions have original_data
      if (currentDocument?.transactions && currentDocument.transactions.length > 0) {
        const transactionsWithOriginalData = currentDocument.transactions.filter(tx => 
          tx.original_data && Object.keys(tx.original_data).length > 0
        );
        
        if (transactionsWithOriginalData.length > 0) {
          console.log('✅ Found transactions with original_data, using those instead');
          console.log('🔧 Parsing original lines into columns to recreate table structure');
          
          // Parse original lines to recreate table structure
          const parsedTransactions = transactionsWithOriginalData.map(transaction => {
            const originalLine = transaction.original_data.original_line || transaction.original_data.line_content || '';
            return parseTransactionLine(originalLine);
          });
          
          // Get unique columns from all parsed transactions
          const allColumns = new Set<string>();
          parsedTransactions.forEach(parsed => {
            Object.keys(parsed).forEach(col => allColumns.add(col));
          });
          
          const headers = Array.from(allColumns);
          const rows = parsedTransactions.map(parsed => {
            // Ensure each row has exactly the right number of cells
            const row = headers.map(header => parsed[header] || '');
            return row;
          });
          
          console.log('📊 Parsed table structure:', {
            headers: headers,
            rowCount: rows.length,
            sampleRow: rows[0],
            sampleParsed: parsedTransactions[0]
          });
          
          // Final validation: ensure every row has the correct number of cells
          const validatedRows = rows.map(row => {
            if (row.length === headers.length) {
              return row;
            }
            const normalizedRow = [...row];
            while (normalizedRow.length < headers.length) {
              normalizedRow.push('');
            }
            return normalizedRow.slice(0, headers.length);
          });
          
          return { headers, rows: validatedRows };
        }
      }
      
      // Fallback: Show raw PDF lines from originalTransactions (not recommended but for debugging)
      console.log('🟡 Fallback: Showing raw PDF lines from originalTransactions');
      const headers = ['PDF Line Content', 'Line Number'];
      const rows = originalData.originalTransactions.map(line => {
        const row = [
          line._line_content || line._original_line || '',
          `${line._line_index ?? 'N/A'}`
        ];
        // Ensure row has exactly 2 cells to match 2 headers
        while (row.length < headers.length) {
          row.push('');
        }
        return row.slice(0, headers.length);
      });
      
      return { headers, rows };
    }

    // Fallback: Legacy structure format
    if (!structure?.originalHeaders || !currentDocument.transactions) {
      return { headers: [], rows: [] };
    }

    const headers = structure.originalHeaders;
    
    // Convert transactions back to original format using column mappings
    const rows = currentDocument.transactions.map((transaction, index) => {
      const row: any[] = new Array(headers.length).fill("");
      
      headers.forEach((header, headerIndex) => {
        const normalizedName = structure?.columnMetadata?.normalizedColumnNames?.[headerIndex];
        
        // Map transaction fields back to original columns
        switch (normalizedName) {
          case "date":
            row[headerIndex] = transaction.date || transaction.post_date || transaction.value_date || "";
            break;
          case "description":
            row[headerIndex] = transaction.description || "";
            break;
          case "amount":
            row[headerIndex] = transaction.amount || 0;
            break;
          case "balance":
            row[headerIndex] = transaction.balance || "";
            break;
          case "type":
            row[headerIndex] = transaction.type || "";
            break;
          case "reference":
            row[headerIndex] = transaction.reference || "";
            break;
          case "post_date":
            row[headerIndex] = transaction.post_date || "";
            break;
          case "value_date":
            row[headerIndex] = transaction.value_date || "";
            break;
          case "category":
            row[headerIndex] = transaction.category || "";
            break;
          case "subcategory":
            row[headerIndex] = transaction.subcategory || "";
            break;
          default:
            // Try to find matching field by column name
            const fieldValue = (transaction as any)[normalizedName || ""];
            row[headerIndex] = fieldValue !== undefined ? fieldValue : "";
        }
      });
      
      // Final validation: ensure row has exactly the right number of cells
      while (row.length < headers.length) {
        row.push('');
      }
      return row.slice(0, headers.length);
    });

    return { headers, rows };
  }, [currentDocument, originalData]);

  // Early returns AFTER all hooks have been executed
  if (!currentDocument || currentDocument.status !== "completed") {
    return (
      <EmptyState
        icon="lucide:table"
        title={t("dashboard.originalData.noData")}
        description={t("dashboard.originalData.selectCompleted")}
      />
    );
  }

  if (!originalData?.directTable && !originalData?.structure && !originalData?.originalTransactions) {
    return (
      <EmptyState
        icon="lucide:file-x"
        title={t("dashboard.originalData.noOriginalData")}
        description={t("dashboard.originalData.originalDataNotAvailable")}
      />
    );
  }

  const { directTable, structure, mappings } = originalData;

  // Get the type indicator for each column
  const getColumnTypeChip = (columnName: string, columnIndex: number) => {
    // For direct table format, infer type from first non-empty value
    let columnType = "text";
    if (structure?.columnMetadata?.columnTypes?.[columnIndex]) {
      columnType = structure.columnMetadata.columnTypes[columnIndex];
    } else if (directTable?.rows && directTable.rows.length > 0) {
      // Infer type from first non-empty value in this column
      for (const row of directTable.rows) {
        if (row[columnIndex] !== null && row[columnIndex] !== undefined && row[columnIndex] !== '') {
          columnType = inferColumnType(row[columnIndex]);
          break;
        }
      }
    }
    
    const normalizedName = structure?.columnMetadata?.normalizedColumnNames?.[columnIndex];
    
    const typeColors: Record<string, any> = {
      date: "primary",
      currency: "success", 
      amount: "success",
      balance: "success",
      text: "default",
      description: "default",
      reference: "secondary",
      number: "warning",
      type: "secondary",
    };

    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{columnName}</span>
        <Chip size="sm" color={typeColors[columnType] || "default"} variant="flat">
          {columnType}
        </Chip>
        {normalizedName && normalizedName !== columnName && (
          <span className="text-xs text-default-500">→ {normalizedName}</span>
        )}
      </div>
    );
  };

  const formatCellValue = (value: any, columnIndex: number) => {
    // For direct table format, try to infer type from value, otherwise default to text
    const columnType = structure?.columnMetadata?.columnTypes?.[columnIndex] || 
                      (directTable ? inferColumnType(value) : "text");
    
    if (value === null || value === undefined || value === "") {
      return <span className="text-default-400">—</span>;
    }
    
    switch (columnType) {
      case "currency":
      case "amount":
      case "balance":
        if (typeof value === "number" && !isNaN(value)) {
          return (
            <span className={`font-mono ${value >= 0 ? "text-success" : "text-danger"}`}>
              {value >= 0 ? "+" : ""}{value.toFixed(2)}
            </span>
          );
        }
        // Try to parse as number if it's a string
        if (typeof value === "string") {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            return (
              <span className={`font-mono ${numValue >= 0 ? "text-success" : "text-danger"}`}>
                {numValue >= 0 ? "+" : ""}{numValue.toFixed(2)}
              </span>
            );
          }
        }
        return <span className="font-mono">{value}</span>;
      
      case "date":
        if (value) {
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              return <span className="font-mono">{value}</span>;
            }
            return <span className="font-mono">{date.toLocaleDateString()}</span>;
          } catch {
            return <span className="font-mono">{value}</span>;
          }
        }
        return <span className="text-default-400">—</span>;
      
      default:
        return <span className="max-w-xs truncate" title={String(value)}>{String(value)}</span>;
    }
  };

  if (tableData.headers.length === 0) {
    return (
      <EmptyState
        icon="lucide:table"
        title={t("dashboard.originalData.noTableData")}
        description={t("dashboard.originalData.noTableDataDesc")}
      />
    );
  }

  // Final safety check: ensure all rows have correct cell count before rendering
  const safeTableData = {
    headers: tableData.headers,
    rows: tableData.rows.map(row => {
      if (row.length === tableData.headers.length) {
        return row;
      }
      console.warn('Row/column count mismatch detected, normalizing:', {
        expectedColumns: tableData.headers.length,
        actualCells: row.length,
        row: row
      });
      const normalizedRow = [...row];
      while (normalizedRow.length < tableData.headers.length) {
        normalizedRow.push('');
      }
      return normalizedRow.slice(0, tableData.headers.length);
    })
  };

  return (
    <div className="space-y-4">
      {/* Original Data Table */}
      <Table 
        aria-label={t("dashboard.originalData.tableAriaLabel")}
        className="min-h-96"
        classNames={{
          wrapper: "max-h-[600px] overflow-auto",
          table: "min-w-full",
          thead: "sticky top-0 z-10 bg-content2",
          tbody: "text-sm",
        }}
      >
        <TableHeader>
          {safeTableData.headers.map((header, index) => (
            <TableColumn 
              key={index}
              className="text-left bg-content2 border-b border-divider"
            >
              {getColumnTypeChip(header, index)}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {safeTableData.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-default-50">
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>
                  {formatCellValue(cell, cellIndex)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Mapping Info */}
      {mappings && mappings.length > 0 && (
        <Card className="bg-content2/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="lucide:arrow-right" className="text-lg text-default-600" />
              <h4 className="text-sm font-medium">{t("dashboard.originalData.columnMappings")}</h4>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {mappings[0]?.columnMappings?.map((mapping, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-primary">{mapping.originalName}</span>
                  <Icon icon="lucide:arrow-right" className="w-3 h-3 text-default-400" />
                  <span className="text-default-600">{mapping.normalizedName}</span>
                  <Chip size="sm" variant="flat" color="default">
                    {mapping.standardType}
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default OriginalDataTable;