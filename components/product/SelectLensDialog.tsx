
import React from 'react';
import { Lens } from '../../types';

interface SelectLensDialogProps {
  open: boolean;
  onClose: () => void;
  selectedLenses: Lens[];
  handleSelectLenses: (id: number) => void;
}

const SelectLensDialog: React.FC<SelectLensDialogProps> = ({
  open,
  onClose,
  selectedLenses,
  handleSelectLenses,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[800px] max-h-[90vh] flex flex-col transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 rounded-t-xl">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Select Your Lenses</h2>
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

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F9FAFB]">
          
          <div className="grid grid-cols-1 gap-6">
             {selectedLenses && selectedLenses.length > 0 ? (
                selectedLenses.map((lens) => (
                  <div 
                    key={lens.id} 
                    className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all"
                  >
                     <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#1F1F1F] mb-2">{lens.sub_category}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center gap-2">
                               <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                               Blue Light Blocker
                            </p>
                             <p className="flex items-center gap-2">
                               <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                               Anti Scratch Coating
                            </p>
                             <p className="flex items-center gap-2">
                               <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                               Both Side Anti Glare
                            </p>
                        </div>
                     </div>

                     <div className="flex flex-col items-end gap-4 min-w-[140px]">
                        <div className="text-right">
                           <p className="text-2xl font-bold text-[#1F1F1F]">₹{lens.selling_price || lens.price}</p>
                           {lens.selling_price && lens.selling_price !== lens.price && (
                               <p className="text-sm text-gray-400 line-through">₹{lens.price}</p>
                           )}
                        </div>
                        <button 
                           onClick={() => handleSelectLenses(lens.id)}
                           className="bg-[#232320] text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            Select
                        </button>
                     </div>
                  </div>
                ))
             ) : (
                 <div className="text-center py-12 text-gray-500">
                    <p>No lenses found for this category.</p>
                 </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SelectLensDialog;
