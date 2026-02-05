import React from "react";
import ReactPlayer from "react-player";

interface KnowledgeVideoDialogProps {
  open: boolean;
  close: () => void;
}

const KnowledgeVideoDialog: React.FC<KnowledgeVideoDialogProps> = ({
  open,
  close,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={close}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[680px] overflow-hidden transform transition-all scale-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Video Title</h2>
          <button
            onClick={close}
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

        {/* Video Container */}
        <div className="relative w-full aspect-video bg-black">
          <ReactPlayer
            url="https://youtube.com/watch?v=2RGu_tLeqk4"
            playing={open}
            controls={true}
            width="100%"
            height="100%"
            className="absolute top-0 left-0"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(KnowledgeVideoDialog);
