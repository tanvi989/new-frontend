
import React, { useState } from 'react';
import CustomerDialog from './CustomerDialog';

const EyeTestPopup: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [customerData, setCustomerData] = useState({
        name: 'Guest User',
        mobile: '',
        checkDate: new Date().toISOString().split('T')[0],
        mode: 'edit'
    });

    const handleSetNumber = (num: string) => {
        setCustomerData(prev => ({ ...prev, mobile: num }));
    };

    const handleSetName = (name: string) => {
        setCustomerData(prev => ({ ...prev, name: name }));
    };

    return (
        <>
            <button 
                onClick={() => setOpen(true)}
                className="bg-[#232320] text-white px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-black transition-colors shadow-md flex items-center gap-2"
            >
                <span>Check Status</span>
            </button>

            <CustomerDialog 
                open={open}
                onClose={() => setOpen(false)}
                customer={customerData}
                setNumber={handleSetNumber}
                setName={handleSetName}
            />
        </>
    );
};

export default EyeTestPopup;
