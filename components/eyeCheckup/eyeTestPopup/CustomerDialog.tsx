
import React, { useState, useEffect } from 'react';

interface Customer {
    name: string;
    mobile: string;
    checkDate: string;
    mode: string; // 'view' | 'edit'
}

interface CustomerDialogProps {
    open: boolean;
    onClose: () => void;
    customer: Customer;
    setNumber: (val: string) => void;
    setName: (val: string) => void;
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({ open, onClose, customer, setNumber, setName }) => {
    const { name, mobile, checkDate, mode } = customer;
    const [updatedDate, setUpdateDate] = useState(checkDate);
    const [updatedName, setUpdatedName] = useState(name);
    const [updatedNumber, setUpdatedNumber] = useState(mobile);

    useEffect(() => {
        setUpdateDate(checkDate);
        setUpdatedName(name);
        setUpdatedNumber(mobile);
    }, [customer]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (setName) setName(updatedName);
        if (setNumber) setNumber(updatedNumber);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 font-sans">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[474px] p-6 transform transition-all scale-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-[#1F1F1F]">View/Edit Customer</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                             <circle cx="12" cy="12" r="10"></circle>
                             <line x1="15" y1="9" x2="9" y2="15"></line>
                             <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </button>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter name"
                            value={updatedName}
                            disabled={mode === 'view'}
                            onChange={(e) => setUpdatedName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="number" className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">Mobile</label>
                        <input
                            id="number"
                            type="text"
                            placeholder="Enter mobile no."
                            value={updatedNumber}
                            disabled={mode === 'view'}
                            onChange={(e) => setUpdatedNumber(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="date" className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">Last Check Date</label>
                        <input
                            id="date"
                            type="text"
                            placeholder="Enter Checkup Date"
                            value={updatedDate}
                            disabled={mode === 'view'}
                            onChange={(e) => setUpdateDate(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        />
                    </div>

                    {mode === 'edit' && (
                        <div className="flex gap-4 mt-4">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 border-2 border-[#232320] text-[#232320] font-bold rounded-lg uppercase text-sm tracking-wider hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-3 bg-[#232320] text-white font-bold rounded-lg uppercase text-sm tracking-wider hover:bg-black transition-colors shadow-lg"
                            >
                                SUBMIT
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default CustomerDialog;
