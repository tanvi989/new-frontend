import React, { useState, useEffect } from "react";
import TermConditionDialog from "./TermConditionDialog";
import QnADialog from "./QnADialog";

interface StartGameDialogProps {
    open: boolean;
    onHide: () => void;
    setStartGamePopup?: (val: boolean) => void;
    setForm?: any;
    order_id?: string;
}

const StartGameDialog: React.FC<StartGameDialogProps> = ({ open, onHide, setStartGamePopup }) => {
    const [status, setStatus] = useState(0);
    
    // Ensure order_id is available
    const order_id = localStorage.getItem("orderId") || "";

    useEffect(() => {
        if(open) setStatus(0);
    }, [open]);

    const handleClose = () => {
        onHide();
        if(setStartGamePopup) setStartGamePopup(false);
    };

    if (!open) return null;

    return (
        <>
            {status === 0 && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 font-sans">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                        onClick={handleClose}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[475px] p-6 transform transition-all scale-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                        
                        {/* Header */}
                        <div className="w-full flex justify-center items-center mb-4 relative">
                             <h2 className="text-xl font-bold text-[#1F1F1F]">Verification Completed</h2>
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

                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>

                        {/* Message */}
                        <p className="text-[#008000] text-[22px] font-medium leading-tight mb-8">
                          Congratulation!! <br />
                          You are Eligible to play the game
                        </p>

                        {/* Action */}
                        <div className="w-full md:w-3/4 mb-4">
                            <button 
                              onClick={() => setStatus(1)}
                              className="w-full bg-[#232320] text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                            >
                              Start the Game
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {status === 1 && (
                <TermConditionDialog 
                    open={true} 
                    onHide={handleClose} 
                    setStatus={setStatus} 
                />
            )}

            {status === 2 && (
                <QnADialog 
                    open={true} 
                    onHide={handleClose} 
                    order_id={order_id} 
                    setStatus={() => setStatus(0)} 
                />
            )}
        </>
    );
}

export default React.memo(StartGameDialog);