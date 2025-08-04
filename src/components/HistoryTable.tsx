import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from "@heroui/react";
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';

interface Conversion {
  id: string;
  created_at: string;
  original_file_name: string;
}

const HistoryTable: React.FC = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(history.length / rowsPerPage);

  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return history.slice(start, end);
  }, [page, history]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await apiService.getProcessingHistory();
        const historyData = (response.data as any)?.data;

        if (response.success && Array.isArray(historyData)) {
          setHistory(historyData as Conversion[]);
        } else {
          console.error('Error fetching history:', response.error || 'Received invalid data');
          setHistory([]); // Ensure history is an array in case of error
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Card className="bg-content1/60 backdrop-blur-md border border-divider">
      <CardHeader>
        <h2 className="text-2xl font-semibold">{t('historyPage.title')}</h2>
      </CardHeader>
      <CardBody>
        <Table 
          removeWrapper 
          aria-label="Conversion history table"
          bottomContent={
            totalPages > 1 && (
              <div className="flex w-full justify-center mt-4">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="secondary"
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                />
              </div>
            )
          }
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>{t('historyPage.filename').toUpperCase()}</TableColumn>
            <TableColumn>{t('historyPage.date').toUpperCase()}</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={loading}
            emptyContent={!loading && history.length === 0 ? t('historyPage.noHistory') : undefined}
          >
            {paginatedHistory.map((conversion, index) => (
              <TableRow key={conversion.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{conversion.original_file_name}</TableCell>
                <TableCell>{new Date(conversion.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default HistoryTable;
