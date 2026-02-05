import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQuestions, submitQuiz } from "../api/retailerApis";
import { QuizOption } from "../types";

interface CustomerStatusModalProps {
  open: boolean;
  onClose: () => void;
  handleFormSubmit: () => void;
  loading?: boolean;
}

const CustomerStatusModal: React.FC<CustomerStatusModalProps> = ({
  open,
  onClose,
  handleFormSubmit,
  loading: externalLoading,
}) => {
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Use react-query to fetch questions
  const { data: questions = [], isLoading: dataLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      try {
        const response = await getQuestions();
        if (response?.data?.status && Array.isArray(response.data.data)) {
          return response.data.data as QuizOption[];
        }
        return [] as QuizOption[];
      } catch (error) {
        console.error("Failed to fetch questions", error);
        return [] as QuizOption[];
      }
    },
    enabled: open, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Derive selected question from the fetched data
  const selectedQuestion =
    questions.find((item) => item.question)?.question || null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const handleQuizSubmit = async () => {
    if (!status || !selectedQuestion) return;

    setSubmitting(true);
    try {
      const customerId = localStorage.getItem("customerID");
      const res = await submitQuiz(
        status,
        selectedQuestion.question_id,
        customerId
      );
      if (res?.data?.status) {
        handleFormSubmit();
        onClose();
      }
    } catch (error) {
      console.error("Failed to submit quiz", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const isLoading = externalLoading || submitting;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-[600px] w-full p-6 transform transition-all scale-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Customer Status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100 p-1"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </button>
        </div>

        <div className="py-2">
          {dataLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#232320]"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[#1F1F1F] font-bold text-base mb-2">
                  {selectedQuestion?.text || "Loading Question..."}
                </p>
                <div className="relative">
                  <select
                    value={status}
                    onChange={handleChange}
                    className="w-full appearance-none bg-white border-2 border-gray-200 hover:border-gray-300 px-4 py-3 pr-8 rounded-lg focus:outline-none focus:ring-0 focus:border-[#F3CB0A] transition-all cursor-pointer text-gray-700 font-medium"
                  >
                    <option value="" disabled>
                      Select an answer
                    </option>
                    {questions.map((q, index) => (
                      <option key={q.option_id} value={q.option_id}>
                        {index + 1}) {q.text}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
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

              <div className="flex justify-center pt-4">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#232320]"></div>
                    Saving...
                  </div>
                ) : (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={!status}
                    className="bg-[#232320] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform active:scale-95"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerStatusModal;
