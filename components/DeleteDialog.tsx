import React from "react";
import { createPortal } from "react-dom";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType?: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  itemType = "item",
}) => {
  if (!open) return null;

  let dialogTitle = `Delete ${
    itemType.charAt(0).toUpperCase() + itemType.slice(1)
  }`;
  let deleteMessage = `Are you sure you want to delete this ${itemType}?`;

  if (itemType === "customer") {
    dialogTitle = "Delete Customer";
    deleteMessage = "Are you sure you want to delete this customer?";
  } else if (itemType === "product") {
    dialogTitle = "Remove Product";
    deleteMessage =
      "Are you sure you want to remove this product from your cart?";
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal - stopPropagation prevents backdrop from receiving clicks */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {/* Header / Close */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500 mt-2">
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
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {dialogTitle}
          </h3>
          <p className="text-sm text-gray-500 mb-6">{deleteMessage}</p>

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-[#232320] text-[#232320] font-bold rounded-lg hover:bg-gray-50 transition-colors uppercase text-xs tracking-wider"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConfirm();
              }}
              className="flex-1 px-4 py-2.5 bg-[#232320] border-2 border-[#232320] text-white font-bold rounded-lg hover:bg-black transition-colors uppercase text-xs tracking-wider shadow-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteDialog;
