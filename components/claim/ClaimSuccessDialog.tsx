import React from 'react';

interface ClaimSuccessDialogProps {
    open: boolean;
    onHide: () => void;
    setStatus?: (status: number) => void;
}

const ClaimSuccessDialog: React.FC<ClaimSuccessDialogProps> = ({ open, onHide }) => {
    if (!open) return null;

    const handleClose = () => {
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
                     <h2 className="text-xl font-bold text-[#1F1F1F]">Success!</h2>
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

                {/* Success Icon (Green Check) */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>

                {/* Text */}
                <p className="text-[#5B5B5B] text-[22px] font-medium leading-tight mb-8">
                    You have claimed 100% Paytm/Amazon Gift Card.
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

export default React.memo(ClaimSuccessDialog);