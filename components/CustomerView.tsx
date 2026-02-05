import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCustomerDetails } from "../api/retailerApis";
import { CustomerResponse } from "../types";

// Mock data for fallback if API fails or direct access
// const MOCK_DATA: CustomerResponse = {
//   customer_detail: [
//     {
//       id: 123,
//       first_name: "Jane",
//       last_name: "Doe",
//       phone_number: "+1 (555) 123-4567",
//       created: "2023-10-15T10:00:00Z",
//     },
//   ],
//   prescription_details: [
//     {
//       id: 1,
//       patient_name: "Jane Doe",
//       created: "2023-10-20T10:00:00Z",
//       right_sphere: "-1.50",
//       right_cylinder: "-0.50",
//       right_axis: "90",
//       right_od: "20/20",
//       right_pd: "32",
//       left_sphere: "-1.75",
//       left_cylinder: "-0.25",
//       left_axis: "85",
//       left_od: "20/20",
//       left_pd: "31.5",
//       remarks: "Use for reading and driving.",
//     },
//     {
//       id: 2,
//       patient_name: "Jane Doe",
//       created: "2022-05-10T10:00:00Z",
//       right_sphere: "-1.00",
//       right_cylinder: "-0.50",
//       right_axis: "90",
//       right_od: "20/20",
//       right_pd: "32",
//       left_sphere: "-1.25",
//       left_cylinder: "-0.25",
//       left_axis: "85",
//       left_od: "20/25",
//       left_pd: "31.5",
//       remarks: "Old prescription.",
//     },
//   ],
// };

const CustomerView: React.FC = () => {
  const [selectedPrescriptionIndex, setSelectedPrescriptionIndex] =
    useState<number>(0);
  const { state } = useLocation();
  const navigate = useNavigate();

  // If no state is provided (direct access), we'll use a default ID or fallback to mock
  const customerId = state?.customer_id || "mock-id";

  const { isLoading, data: apiData } = useQuery({
    queryKey: ["customerdetails", customerId],
    queryFn: async () => {
      try {
        const response = await getCustomerDetails({ customer_id: customerId });
        if (response.data?.status) {
          return response.data as CustomerResponse;
        }
        return response.data as CustomerResponse;
      } catch (e) {
        console.warn("Using mock data due to API error", e);
        return e as CustomerResponse;
      }
    },
    retry: false,
  });

  const data = apiData;


  if (!data || !data.customer_detail || data.customer_detail.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-64 h-64 bg-[#8CE0D3] rounded-full flex items-center justify-center mb-6 relative">
          {/* Clipboard Icon */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-32 h-40 flex flex-col items-center border-t-8 border-[#232320] relative">
            <div className="absolute -top-6 w-12 h-4 bg-[#F3CB0A] rounded-full border-2 border-[#232320]"></div>
            <div className="mt-4 w-full space-y-3">
              <div className="h-1 bg-gray-200 rounded w-full"></div>
              <div className="h-1 bg-gray-200 rounded w-3/4"></div>
              <div className="h-1 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="text-2xl font-serif font-bold mt-4 text-[#232320]">
              Rx
            </div>
          </div>
          {/* Hand/Pen (Simplified) */}
          <div className="absolute bottom-10 right-12 transform rotate-12">
            <div className="w-24 h-4 bg-[#232320] rounded-full"></div>
            <div className="w-16 h-16 bg-[#FFCC80] rounded-full absolute -right-4 -top-4 -z-10"></div>
          </div>
        </div>
        <p className="text-[#525252] text-base font-bold">
          No Prescription Found
        </p>
      </div>
    );
  }

  // Derive prescription details directly from data and selection
  const prescriptionDetails =
    data?.prescription_details?.[selectedPrescriptionIndex] || null;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(event.target.value, 10);
    setSelectedPrescriptionIndex(index);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F0E7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#232320]"></div>
      </div>
    );
  }

  const customer = data?.customer_detail?.[0];

  return (
    <div className="w-full bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px] font-bold text-[#1F1F1F] font-sans">
            View Customer
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-bold text-[#1F1F1F] hover:text-[#E94D37] underline decoration-1 underline-offset-4"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-white rounded-[12px] shadow-soft p-6 md:p-10 border border-gray-100">
          <form className="flex flex-col gap-6">
            {/* Customer Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  value={
                    customer
                      ? `${customer.first_name} ${customer.last_name}`
                      : ""
                  }
                  disabled
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="number"
                  className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
                >
                  Mobile
                </label>
                <input
                  id="number"
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  value={customer?.phone_number || ""}
                  disabled
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="date"
                className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
              >
                Last Check Date
              </label>
              <input
                id="date"
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                value={customer?.created ? formatDate(customer.created) : ""}
                disabled
              />
            </div>

            {/* Prescription Selector */}
            <div className="mt-4">
              <label
                htmlFor="prescription-select"
                className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide mb-2 block"
              >
                Select Prescription
              </label>
              <div className="relative">
                <select
                  id="prescription-select"
                  className="w-full appearance-none bg-white border-2 border-[#232320] hover:border-black px-4 py-3 pr-8 rounded-lg focus:outline-none focus:ring-0 text-[#1F1F1F] font-bold cursor-pointer transition-colors"
                  value={selectedPrescriptionIndex}
                  onChange={handleChange}
                >
                  {data?.prescription_details?.map((p, index) => (
                    <option key={p.id || index} value={index}>
                      {p.patient_name} - {formatShortDate(p.created)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#1F1F1F]">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Prescription Table Section */}
            <div className="mt-12">
              <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-[#1F1F1F]">
                  My Prescriptions
                </h2>
                <div className="h-1 w-16 bg-[#E94D37] mt-2 rounded-full"></div>
              </div>

              <div className="overflow-x-auto rounded-xl border-2 border-[#1F1F1F]">
                <table className="w-full border-collapse bg-white text-left text-sm">
                  <thead>
                    <tr className="bg-[#232320] text-white">
                      <th className="px-6 py-4 font-bold uppercase tracking-wider border-r border-gray-600"></th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-center border-r border-gray-600">
                        SPH
                      </th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-center border-r border-gray-600">
                        CYL
                      </th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-center border-r border-gray-600">
                        AXIS
                      </th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-center border-r border-gray-600">
                        OD
                      </th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">
                        PD
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    <tr className="divide-x divide-[#1F1F1F]">
                      <td className="px-6 py-4 font-bold text-[#1F1F1F] bg-[#F3F0E7]">
                        Right (OD)
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {prescriptionDetails?.right_sphere || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {prescriptionDetails?.right_cylinder || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {prescriptionDetails?.right_axis || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-[#009FE3]">
                        {prescriptionDetails?.right_od || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {prescriptionDetails?.right_pd || "-"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-[#1F1F1F]">
                      <td className="px-6 py-4 font-bold text-[#1F1F1F] bg-[#F3F0E7]">
                        Left (OS)
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {prescriptionDetails?.left_sphere || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {prescriptionDetails?.left_cylinder || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {prescriptionDetails?.left_axis || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-[#009FE3]">
                        {prescriptionDetails?.left_od || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {prescriptionDetails?.left_pd || "-"}
                      </td>
                    </tr>
                    <tr className="divide-x divide-[#1F1F1F]">
                      <td className="px-6 py-4 font-bold text-[#1F1F1F] bg-[#F3F0E7]">
                        Add (info)
                      </td>
                      <td
                        colSpan={5}
                        className="px-6 py-4 font-medium italic text-gray-600"
                      >
                        {prescriptionDetails?.remarks ||
                          "No additional remarks"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
