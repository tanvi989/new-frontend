import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';

interface LogEntry {
  source: string;
  content: string;
  timestamp: string;
}

interface LogsResponse {
  logs: LogEntry[];
  message?: string;
  note?: string;
  error?: string;
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get<LogsResponse>('/logs');
        
        if (response.data) {
          if (response.data.error) {
            setError(response.data.error);
          } else {
            setLogs(response.data.logs || []);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Auto-refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200 max-w-2xl">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Logs</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Logs</h1>
          <p className="text-gray-600">
            View real-time logs and errors from your application. Auto-refreshes every 30 seconds.
          </p>
        </div>

        {/* Info Messages */}
        {logs.length > 0 && logs[0].source === "Application Logs" && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-blue-800 font-semibold mb-2">ℹ️ Information</h3>
            <p className="text-blue-700 text-sm">
              For real-time logs, check the backend console output. This page shows recent log history.
            </p>
          </div>
        )}

        {/* Logs Display */}
        <div className="space-y-6">
          {logs.map((log, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Log Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{log.source}</h3>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
              </div>

              {/* Log Content */}
              <div className="p-6">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                  {log.content}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* No Logs */}
        {logs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Logs Available</h3>
            <p className="text-gray-500">
              There are no logs to display. Check if the backend is running and has logs enabled.
            </p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-[#232320] text-white px-6 py-3 rounded-lg font-semibold hover:bg-black transition-colors"
          >
            🔄 Refresh Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logs;
