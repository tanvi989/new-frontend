import React, { useState } from "react";
import KnowledgeVideoDialog from "../components/KnowledgeVideoDialog";

// Placeholder for the thumbnail since local asset is not available
const VIDEO_THUMBNAIL =
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";

const KnowledgeBase: React.FC = () => {
  const [openVideoDialog, setVideoDialog] = useState(false);

  const handleOpenVideoDialog = () => {
    setVideoDialog(true);
  };
  const handleCloseVideoDialog = () => {
    setVideoDialog(false);
  };

  // Mock data for videos
  const videos = [1, 2, 3, 4];

  return (
    <div className="min-h-screen bg-[#F3F0E7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-[22px] font-bold text-[#1F1F1F] mb-6">
          Knowledge Base Videos
        </h1>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <div
                key={index}
                className="group cursor-pointer flex flex-col gap-3"
                onClick={handleOpenVideoDialog}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group-hover:shadow-md transition-all">
                  <img
                    src={VIDEO_THUMBNAIL}
                    alt="Video Thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg
                        width="12"
                        height="14"
                        viewBox="0 0 12 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11 7L1 13L1 1L11 7Z"
                          fill="#1F1F1F"
                          stroke="#1F1F1F"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <h4 className="text-[#1F1F1F] font-bold text-base group-hover:text-[#009FE3] transition-colors">
                  Video Title {index + 1}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {openVideoDialog && (
          <KnowledgeVideoDialog
            open={openVideoDialog}
            close={handleCloseVideoDialog}
          />
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
