import React, { useState } from "react";
import { updateInventory } from "../../api/retailerApis";

interface ShelfDialogProps {
  open: boolean;
  onClose: () => void;
  skuid: string;
  refetch: () => void;
}

const ShelfDialog: React.FC<ShelfDialogProps> = ({ open, onClose, skuid, refetch }) => {
  const [quantity, setQuantity] = useState("");
  const [selectedValue, setSelectedValue] = useState("in");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!quantity || isNaN(Number(quantity))) return;

    setIsSubmitting(true);
    const payload = {
      skuid: skuid,
      stock_qty: quantity,
      status: selectedValue,
    };

    try {
      const response = await updateInventory(payload);
      if (response?.data?.status) {
        onClose();
        refetch();
        // Reset fields
        setQuantity("");
        setSelectedValue("in");
      }
    } catch (error) {
      console.error("Inventory update failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[474px] p-6 transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Shelf In/Out</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
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

        <div className="flex flex-col gap-6">
          {/* Radio Options */}
          <div>
            <label className="block text-sm font-bold text-[#1F1F1F] uppercase tracking-wide mb-3">
              Product Sku Options:
            </label>
            <div className="flex gap-4">
              <label
                className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedValue === "in"
                    ? "border-[#232320] bg-[#F3F0E7]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#232320] mr-2">
                  {selectedValue === "in" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#232320]"></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="shelfStatus"
                  value="in"
                  checked={selectedValue === "in"}
                  onChange={handleRadioChange}
                  className="hidden"
                />
                <span className="font-bold text-[#1F1F1F] text-sm">Shelf In</span>
              </label>

              <label
                className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedValue === "out"
                    ? "border-[#232320] bg-[#F3F0E7]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#232320] mr-2">
                  {selectedValue === "out" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#232320]"></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="shelfStatus"
                  value="out"
                  checked={selectedValue === "out"}
                  onChange={handleRadioChange}
                  className="hidden"
                />
                <span className="font-bold text-[#1F1F1F] text-sm">Shelf Out</span>
              </label>
            </div>
          </div>

          {/* Quantity Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="quantity"
              className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide"
            >
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors"
              autoComplete="off"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-[#232320] text-[#232320] font-bold rounded-lg uppercase text-sm tracking-wider hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!quantity || isSubmitting}
              className="flex-1 py-3 bg-[#232320] text-white font-bold rounded-lg uppercase text-sm tracking-wider hover:bg-black transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "SUBMIT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelfDialog;