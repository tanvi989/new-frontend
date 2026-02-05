import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { eyeCheckup } from '../../../api/retailerApis';
import { Loader } from '../../Loader';
import TableFillterWrap from './TableFillterWrap';

interface CheckupRow {
  id: number;
  patient_name: string;
  phone_number: string;
  created: string;
}

const EyeCheckupTable: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch data
  const { isLoading, data: rows = [] } = useQuery({
    queryKey: ['checkups'],
    queryFn: async () => {
        try {
            const response = await eyeCheckup();
            if (response.data?.status && Array.isArray(response.data.customers)) {
                return response.data.customers as CheckupRow[];
            }
            return [];
        } catch (e) {
            console.error(e);
            return [];
        }
    },
    retry: false
  });

  // Filter
  const filteredRows = rows.filter((row) => 
      (row.patient_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (row.phone_number || '').includes(searchQuery)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const currentRows = filteredRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleSearch = (query: string) => {
      setSearchQuery(query);
      setPage(0);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="w-full bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden font-sans">
        {/* Header & Filter */}
        <TableFillterWrap onSearch={handleSearch} />

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-[#1F1F1F] text-xs uppercase font-bold tracking-wider">
                    <tr>
                        <th className="px-6 py-4 border-b border-gray-100">S.No.</th>
                        <th className="px-6 py-4 border-b border-gray-100">Name</th>
                        <th className="px-6 py-4 border-b border-gray-100">Mobile</th>
                        <th className="px-6 py-4 border-b border-gray-100 text-center">Last Check Date</th>
                        <th className="px-6 py-4 border-b border-gray-100 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {currentRows.length > 0 ? (
                        currentRows.map((row, index) => (
                            <tr key={row.id} className="hover:bg-[#F3F0E7]/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                    {page * rowsPerPage + index + 1}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-[#1F1F1F]">
                                    {row.patient_name}
                                </td>
                                <td className="px-6 py-4 text-sm text-[#525252] font-medium">
                                    {row.phone_number}
                                </td>
                                <td className="px-6 py-4 text-sm text-[#525252] text-center font-medium">
                                    {moment(row.created).format('DD-MM-YYYY')}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => navigate('/customer-view', { state: { customer_id: row.id } })}
                                        className="p-2 text-gray-400 hover:text-[#009FE3] transition-colors rounded-full hover:bg-[#009FE3]/10"
                                        title="View Details"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                         <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                    </svg>
                                    <p className="text-sm font-medium">No records found</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        {filteredRows.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="text-xs text-gray-500 font-medium">
                    Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredRows.length)} of {filteredRows.length} entries
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <span className="text-xs font-bold text-[#1F1F1F] px-2">
                        Page {page + 1} of {Math.max(1, totalPages)}
                    </span>
                     <button 
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default EyeCheckupTable;