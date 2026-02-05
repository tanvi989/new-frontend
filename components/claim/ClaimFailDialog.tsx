import React from 'react';

interface ClaimFailDialogProps {
    open: boolean;
    onHide: () => void;
    setStatus?: (status: number) => void;
}

const ClaimFailDialog: React.FC<ClaimFailDialogProps> = ({ open, onHide, setStatus }) => {
    if (!open) return null;

    const handleClose = () => {
        if (setStatus) setStatus(0);
        onHide();
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 font-sans">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={handleClose}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[475px] p-6 transform transition-all scale-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="w-full flex justify-center items-center mb-4 relative">
                     <h2 className="text-xl font-bold text-[#1F1F1F]">Failed!</h2>
                     <button 
                        onClick={handleClose}
                        className="absolute right-0 text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </button>
                </div>

                {/* Error Icon */}
                <div className="mb-4 text-[#E94D37]">
                     <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                     </svg>
                </div>

                {/* Text */}
                <p className="text-[#5B5B5B] text-[22px] font-medium leading-tight mb-8">
                  Oops! <br /> You ran out of time or answered incorrectly.
                </p>

                {/* Button */}
                <div className="w-full md:w-3/4 mb-4">
                    <button 
                      onClick={handleClose}
                      className="w-full bg-[#232320] text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                      Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default React.memo(ClaimFailDialog);