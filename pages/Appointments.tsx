import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { getAppoitments, cancelAppoitment } from "../api/retailerApis";
import { Loader } from "../components/Loader";
import { Filter } from "../components/Filter";

const Appointments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(14);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const {
    isLoading,
    data: appointments,
    refetch,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      try {
        const response = await getAppoitments();
        if (response?.data?.success) {
          return response?.data?.data;
        }
        return [];
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    retry: false,
  });

  if (isLoading) return <Loader />;

  const handleCancel = async (id: number) => {
    try {
      const response = await cancelAppoitment({ id });
      if (response?.data?.status) {
        refetch();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Process rows with status logic
  const processedRows =
    appointments?.map((item: any) => {
      const startDateTime = moment(
        `${item.date_of_slot} ${item.start_slot_time}`
      );
      const endDateTime = moment(`${item.date_of_slot} ${item.end_slot_time}`);
      const now = moment();

      let status = item.status;
      let canCancel = false;

      if (startDateTime.isBefore(now)) {
        if (item.status) {
          status = "Expired";
        } else {
          status = "Cancelled";
        }
      } else if (now.isAfter(startDateTime) && now.isBefore(endDateTime)) {
        if (item.status) {
          status = "In Progress";
        } else {
          status = "Cancelled";
        }
      } else {
        if (item.status) {
          status = "Up - Coming";
          canCancel = true;
        } else {
          status = "Cancelled";
        }
      }

      return {
        ...item,
        computedStatus: status,
        canCancel,
        genderDisplay:
          item.gender === "M"
            ? "Male"
            : item.gender === "F"
            ? "Female"
            : "Other",
        formattedDate: item.date_of_slot,
        formattedStartTime: startDateTime.format("hh:mm A"),
        formattedEndTime: endDateTime.format("hh:mm A"),
      };
    }) || [];

  // Filter
  const filteredRows = processedRows.filter((row: any) => {
    const matchesSearch =
      (row.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (row.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (row.phone_number || "").includes(searchQuery) ||
      (row.service?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const rowDate = moment(row.date_of_slot);
    const matchesFrom = fromDate
      ? rowDate.isSameOrAfter(moment(fromDate), "day")
      : true;
    const matchesTo = toDate
      ? rowDate.isSameOrBefore(moment(toDate), "day")
      : true;

    return matchesSearch && matchesFrom && matchesTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px] font-bold text-[#1F1F1F]">
            Appointments Report
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-[300px] flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3">
              <div className="text-[#2B7DCD]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full py-2.5 pl-2 bg-transparent border-none focus:outline-none text-sm font-medium text-[#1F1F1F]"
              />
            </div>

            {/* Date Filter */}
            <Filter
              date={true}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[#1F1F1F] font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-center whitespace-nowrap">
                    S.No.
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap">Name</th>
                  <th className="px-6 py-4 whitespace-nowrap">Email</th>
                  <th className="px-6 py-4 whitespace-nowrap">Contact</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">Store</th>
                  <th className="px-6 py-4 whitespace-nowrap">Start Time</th>
                  <th className="px-6 py-4 whitespace-nowrap">End Time</th>
                  <th className="px-6 py-4 whitespace-nowrap">Gender</th>
                  <th className="px-6 py-4 whitespace-nowrap">Service</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">
                    Product Link
                  </th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row: any, index: number) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[#F3F0E7]/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-center font-medium text-gray-500">
                        {page * rowsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1F1F1F]">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.email}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {row.phone_number}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {row.formattedDate}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {row.store__store_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {row.formattedStartTime}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {row.formattedEndTime}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {row.genderDisplay}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.service}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase whitespace-nowrap ${
                            row.computedStatus === "Up - Coming"
                              ? "bg-blue-100 text-blue-700"
                              : row.computedStatus === "Expired"
                              ? "bg-gray-100 text-gray-600"
                              : row.computedStatus === "Cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {row.computedStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.productlink ? (
                          <a
                            href={`${
                              process.env.REACT_APP_EYEMYEYE_URL ||
                              "https://www.eyemyeye.com"
                            }${row.productlink}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2B7DCD] hover:underline font-bold text-xs"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.canCancel ? (
                          <button
                            onClick={() => handleCancel(row.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs uppercase hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No appointments found
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
                Showing {page * rowsPerPage + 1} to{" "}
                {Math.min((page + 1) * rowsPerPage, filteredRows.length)} of{" "}
                {filteredRows.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
