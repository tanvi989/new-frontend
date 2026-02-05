
import React, { useState, useRef } from 'react';
import { addPrescription } from '../../api/retailerApis';
import { compressImage } from '../../utils/imageUtils';

interface UploadPrescriptionsPopupProps {
  open: boolean;
  onClose: () => void;
  selectedCart: any;
  refetch: () => void;
}

const UploadPrescriptionsPopup: React.FC<UploadPrescriptionsPopupProps> = ({
  open,
  onClose,
  selectedCart,
  refetch,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    
    // Compress image before upload
    let fileToUpload = file;
    try {
      console.log("🗜️ Compressing prescription image...");
      fileToUpload = await compressImage(file, 0.6, 1600);
      console.log(`✅ Compression complete: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (compError) {
      console.warn("⚠️ Compression failed, uploading original:", compError);
    }

    const customerID = localStorage.getItem('customerID');
    const formData = new FormData();
    formData.append('prescription_file', fileToUpload);

    try {
      const res: any = await addPrescription(
        customerID,
        null,
        'upload',
        formData,
        selectedCart?.cart_id
      );
      if (res?.data?.status) {
        refetch();
        onClose();
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[500px] p-6 flex flex-col items-center transform transition-all scale-100">
        <div className="w-full flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Upload Prescription</h2>
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

        <div
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#232320] hover:bg-gray-50 transition-all mb-6 bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-contain rounded-xl"
            />
          ) : (
            <>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span className="text-sm font-bold text-gray-500">
                Click to upload image
              </span>
              <span className="text-xs text-gray-400 mt-1">
                JPG, PNG supported
              </span>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="w-full bg-[#232320] text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Submit Prescription'}
        </button>
      </div>
    </div>
  );
};

export default UploadPrescriptionsPopup;
