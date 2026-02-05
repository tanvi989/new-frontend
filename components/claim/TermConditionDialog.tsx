import React, { useState } from 'react';

interface TermConditionDialogProps {
    open: boolean;
    onHide: () => void;
    setStatus: (status: number) => void;
    onCloseTCPopup?: () => void;
    setQnaPopup?: (val: boolean) => void;
}

const TermConditionDialog: React.FC<TermConditionDialogProps> = ({ open, onHide, setStatus }) => {
    const [isChecked, setIsChecked] = useState(false);

    if (!open) return null;

    const handleAgree = () => {
        if (isChecked) {
            setStatus(2); // Move to QnA state
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 font-sans">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={onHide}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[475px] p-6 transform transition-all scale-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#1F1F1F]">Claim Terms and Condition</h2>
                    <button 
                        onClick={onHide}
                        className="text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                             <circle cx="12" cy="12" r="10"></circle>
                             <line x1="15" y1="9" x2="9" y2="15"></line>
                             <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto mb-4 text-left text-[#5B5B5B] text-sm leading-relaxed border-t border-b border-gray-100 py-4 max-h-[60vh] pr-2 custom-scrollbar">
                    <ol className="list-decimal list-outside pl-4 space-y-2 marker:font-bold marker:text-[#232320]">
                        <li>You would be required to answer a qualifying question correctly, within the given time period, to be eligible to claim the cash Back.</li>
                        <li>If you do not respond within the given time period, or answer any question incorrectly, you will not be eligible for the cash Back.</li>
                        <li>The cashback will be claimed in single attempt.</li>
                        <li>Cashback (Amazon/Paytm Pay Gift Card) will be sent to registered email id after 10 days of product delivery.</li>
                        <li>The company shall not be held responsible for any loss, damage, or inconvenience arising from the customer's inability to meet the offer conditions or any technical issues beyond the company's control.</li>
                        <li>This offer is exclusively for the intended recipient and is non-transferable.</li>
                        <li>In-case you cancel/return the order, the successfully earned cashback will not be given.</li>
                        <li>Click on proceed now button to start the claim process.</li>
                    </ol>
                </div>

                {/* Checkbox */}
                <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-0.5">
                            <input 
                                type="checkbox" 
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-[#232320] checked:bg-[#232320]"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                            />
                            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <span className="text-xs text-[#5B5B5B] select-none group-hover:text-[#232320] transition-colors leading-tight">
                            I have read, understood & accepted all terms and conditions of the 100% cashback offer and conditions mentioned above.
                        </span>
                    </label>
                </div>

                {/* Actions */}
                <div className="w-full">
                    <button 
                        onClick={handleAgree} 
                        disabled={!isChecked}
                        className="w-full bg-[#232320] text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Proceed Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(TermConditionDialog);