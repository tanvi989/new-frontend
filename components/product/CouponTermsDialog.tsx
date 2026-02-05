import React from "react";
import { X } from "lucide-react";

interface CouponTermsDialogProps {
    open: boolean;
    onClose: () => void;
    onAgree: () => void;
    couponCode: string;
}

const CouponTermsDialog: React.FC<CouponTermsDialogProps> = ({
    open,
    onClose,
    onAgree,
    couponCode,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-[600px] w-full p-8 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-[#1F1F1F]">
                        Terms & Condition
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-8"></div>

                {/* Content */}
                <div className="space-y-4 mb-10 text-lg">
                    <div className="font-medium text-[#1F1F1F]">
                        Launch Offer
                    </div>
                    <div className="text-[#1F1F1F]">
                        Flat 50% on Min Order Value £150
                    </div>
                    <div className="text-[#1F1F1F]">
                        Valid for first 1000 users only
                    </div>
                </div>

                {/* Action Area */}
                <div className="flex justify-center">
                    <button
                        onClick={onAgree}
                        className="bg-[#232320] text-white py-3 px-12 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-[0.98]"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponTermsDialog;
