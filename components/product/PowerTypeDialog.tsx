
import React, { useState, useEffect } from 'react';
import SelectLensDialog from './SelectLensDialog';
import { selectLens } from '../../api/retailerApis';
import { CartItem, Lens } from '../../types';

interface PowerTypeDialogProps {
  open: boolean;
  onClose: () => void;
  lenses: Lens[];
  selectedCart: CartItem;
  selectedProduct: any;
  refetch: () => void;
}

const PowerTypeDialog: React.FC<PowerTypeDialogProps> = ({
  open,
  onClose,
  lenses,
  selectedCart,
  selectedProduct,
  refetch,
}) => {
  const mainCategories = lenses ? [...new Set(lenses.map((obj) => obj.main_category))] : [];
  const [selectedType, setSelectedType] = useState<string>(mainCategories[0] || '');
  const [openLensesDialog, setOpenLensesDialog] = useState(false);

  useEffect(() => {
    if (mainCategories.length > 0 && !mainCategories.includes(selectedType)) {
      setSelectedType(mainCategories[0]);
    }
  }, [lenses]);

  const selectedLenses = lenses ? lenses.filter((lens) => lens.main_category === selectedType) : [];

  const handleSelectLenses = (id: number) => {
    if (selectedProduct?.skuid && selectedCart?.cart_id) {
      selectLens(selectedProduct.skuid, selectedCart.cart_id, id).then((res: any) => {
        if (res?.data?.status) {
          setOpenLensesDialog(false);
          refetch();
          onClose();
        }
      });
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 font-sans">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[600px] p-6 transform transition-all scale-100">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-[#1F1F1F]">Select Power Type</h2>
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

          <div className="py-2">
            <div className="grid grid-cols-1 gap-4 mb-8">
              {mainCategories?.map((category) => (
                <label
                  key={category as string}
                  className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all group ${
                    selectedType === category
                      ? 'border-[#232320] bg-[#F3F0E7]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="powerType"
                    value={category as string}
                    checked={selectedType === category}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="hidden"
                  />
                  
                   <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#232320] mr-4 shrink-0">
                        {selectedType === category && <div className="w-2.5 h-2.5 rounded-full bg-[#232320]"></div>}
                    </div>

                  <div className={`mr-4 transition-colors ${selectedType === category ? 'text-[#232320]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <svg
                      width="42"
                      height="30"
                      viewBox="0 0 42 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                       <path 
                         d="M15.3223 29.6911C13.7569 29.6911 12.2416 29.4417 10.8179 28.9499C9.43442 28.4719 8.13445 27.764 6.9535 26.8462C4.64982 25.0553 2.8101 22.4591 1.63355 19.3388C0.598339 16.592 0.170267 13.6149 0.428062 10.9549C0.55696 9.62587 0.849909 8.40924 1.29885 7.33836C1.76977 6.21476 2.40107 5.28159 3.17446 4.56487C4.44696 3.38596 6.59098 2.41104 9.54757 1.66758C12.1783 1.00616 15.3963 0.551666 18.8538 0.352801C25.8982 -0.0518888 32.8224 0.628576 36.9251 2.12831C39.4987 3.06916 40.8961 4.29935 41.0791 5.78443C41.3135 7.68812 40.8188 10.1086 39.6481 12.7846C38.4767 15.4626 36.7457 18.124 34.6427 20.4807C32.0526 23.3831 29.0997 25.6534 25.8656 27.2286C22.5106 28.8627 18.9633 29.6911 15.3223 29.6911ZM22.8182 1.33834C21.5208 1.33834 20.2131 1.37533 18.9168 1.44967C11.7311 1.86279 6.12519 3.32846 3.92111 5.37095C2.612 6.58392 1.75988 8.6048 1.52149 11.0611C1.27945 13.5567 1.68445 16.3587 2.6618 18.9509C3.76695 21.8819 5.484 24.3119 7.62802 25.9786C8.71376 26.8224 9.90753 27.4729 11.1767 27.9112C12.4847 28.3632 13.8796 28.5921 15.3223 28.5921C18.7952 28.5921 22.1806 27.801 25.3844 26.2408C28.4893 24.729 31.3283 22.5448 33.8228 19.7493C35.8496 17.4779 37.5158 14.9172 38.6414 12.3444C39.7177 9.88479 40.1959 7.60279 39.9883 5.91884C39.8616 4.89082 38.6718 3.93714 36.5472 3.16036C34.5735 2.43887 31.848 1.89978 28.6658 1.60166C26.7964 1.4266 24.8197 1.33834 22.8182 1.33834Z" 
                         fill="currentColor"
                       />
                    </svg>
                  </div>
                  
                  <span className={`flex-1 text-base font-bold uppercase tracking-wide ${selectedType === category ? 'text-[#232320]' : 'text-gray-500'}`}>
                      {category as string}
                  </span>

                  <div className="text-gray-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                    if (selectedType) {
                        onClose();
                        setOpenLensesDialog(true);
                    }
                }}
                disabled={!selectedType}
                className="bg-[#232320] text-white px-12 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                Select & Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      <SelectLensDialog
        open={openLensesDialog}
        selectedLenses={selectedLenses}
        onClose={() => setOpenLensesDialog(false)}
        handleSelectLenses={handleSelectLenses}
      />
    </>
  );
};

export default PowerTypeDialog;
