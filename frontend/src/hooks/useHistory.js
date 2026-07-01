import { useState, useCallback } from 'react';
import historyService from '@/services/history.service';
import toast from 'react-hot-toast';

export function useHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchHistory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyService.getHistory(params);
      setHistory(data.history || data.logs || data || []);
      if (data.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({
          page: params.page || 1,
          totalPages: data.totalPages || 1,
          total: data.total || (data.history || data.logs || data || []).length,
        });
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch history';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteHistoryItem = useCallback(async (id) => {
    try {
      await historyService.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => (item._id || item.id) !== id));
      toast.success('History item deleted');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete history item';
      toast.error(msg);
      throw err;
    }
  }, []);

  return {
    history,
    loading,
    error,
    pagination,
    fetchHistory,
    deleteHistoryItem,
  };
}
