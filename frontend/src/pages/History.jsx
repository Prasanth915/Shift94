import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import historyService from '../services/history.service.js';

export const History = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await historyService.getHistory({
        page,
        limit,
        platform: platform || undefined,
        status: status || undefined,
        search: search || undefined,
      });
      setLogs(response.data.logs);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      toast.error('Failed to retrieve publish logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, platform, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleRetry = async (logId) => {
    setRetryLoading(logId);
    toast.loading('Retrying publish attempt...', { id: 'retry-toast' });
    try {
      await historyService.retry(logId);
      toast.success('Retry completed successfully!', { id: 'retry-toast' });
      fetchHistory();
    } catch (err) {
      toast.error(err.message || 'Retry failed.', { id: 'retry-toast' });
    } finally {
      setRetryLoading(null);
    }
  };

  const getStatusBadgeVariant = (s) => {
    const mapping = {
      PENDING: 'pending',
      PUBLISHING: 'publishing',
      PUBLISHED: 'success',
      FAILED: 'error',
    };
    return mapping[s] || 'info';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50 font-display">Publish History</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor and manage the distribution logs of your project showcases.
          </p>
        </div>

        {/* Filters Panel */}
        <Card className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <Input
                label="Search by Project Title"
                placeholder="Type title and press enter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-full md:w-48">
              <Select
                label="Platform"
                value={platform}
                onChange={(e) => {
                  setPage(1);
                  setPlatform(e.target.value);
                }}
                options={[
                  { label: 'All Platforms', value: '' },
                  { label: 'LinkedIn', value: 'LINKEDIN' },
                  { label: 'GitHub', value: 'GITHUB' },
                ]}
              />
            </div>

            <div className="w-full md:w-48">
              <Select
                label="Status"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                options={[
                  { label: 'All Statuses', value: '' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Publishing', value: 'PUBLISHING' },
                  { label: 'Published', value: 'PUBLISHED' },
                  { label: 'Failed', value: 'FAILED' },
                ]}
              />
            </div>

            <Button type="submit" variant="secondary" className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </form>
        </Card>

        {/* Table / List Panel */}
        <Card className="overflow-hidden p-0 border-zinc-800">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              No publishing history found matching the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs font-semibold text-zinc-400">
                    <th className="p-4">Project</th>
                    <th className="p-4">Platform</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/10 transition duration-100">
                      <td className="p-4">
                        <div className="font-medium text-white">{log.project?.title}</div>
                        {log.platform === 'GITHUB' && log.apiResponse && (
                          <div className="text-[10px] text-zinc-500 mt-1 space-y-0.5">
                            <div>Repo: <span className="text-zinc-400 font-mono">{log.apiResponse.repository || (log.project?.githubUrl ? log.project.githubUrl.replace('https://github.com/', '') : 'N/A')}</span></div>
                            {log.apiResponse.releaseName && (
                              <div>Release: <span className="text-zinc-400">{log.apiResponse.releaseName} ({log.apiResponse.tagName || ''})</span></div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">{log.platform}</td>
                      <td className="p-4">
                        <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>
                      </td>
                      <td className="p-4 text-zinc-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right flex justify-end items-center gap-2">
                        {log.externalUrl && (
                          <a
                            href={log.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-zinc-400 hover:text-white transition gap-1"
                          >
                            View Post <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {log.status === 'FAILED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(log.id)}
                            loading={retryLoading === log.id}
                          >
                            Retry
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;
