import React from "react";
import { X } from "lucide-react";

interface ManualPrescriptionModalProps {
    open: boolean;
    onClose: () => void;
    prescription: any;
    onRemove?: () => void;
}

const ManualPrescriptionModal: React.FC<ManualPrescriptionModalProps> = ({
    open,
    onClose,
    prescription,
    onRemove,
}) => {
    if (!open || !prescription) return null;

    // Merge top-level and nested data to ensure we capture all fields (image_url, PDs, etc.)
    const details = {
        ...prescription,
        ...(prescription.prescriptionDetails || prescription.data || {})
    };

    const isPdf = details.image_url?.toLowerCase().endsWith('.pdf') || details.fileType === 'application/pdf';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1F1F1F]">
                        Prescription Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Check if it's an uploaded prescription */}
                    {details.type === "upload" || details.image_url ? (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">
                                    Uploaded Prescription
                                </h3>
                                {details.image_url && (
                                    <div className="mb-4">
                                        {isPdf ? (
                                            <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
                                                <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-900 mb-2">{details.fileName || "Prescription.pdf"}</p>
                                            </div>
                                        ) : (
                                            <img
                                                src={details.image_url}
                                                alt="Prescription"
                                                className="max-w-full max-h-48 object-contain rounded-lg border border-gray-200"
                                            />
                                        )}

                                        <a
                                            href={details.image_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#025048] underline text-sm mt-2 inline-block font-medium"
                                        >
                                            {isPdf ? "View Full PDF" : "View Full Size Image"}
                                        </a>
                                    </div>
                                )}
                                {details.fileName && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        File: {details.fileName}
                                    </p>
                                )}
                            </div>

                            {/* PD Display for Upload */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                    Pupillary Distance (PD)
                                </p>
                                {details.pdType === "Dual" || (details.pdRight && details.pdLeft) || (details.right && details.left) ? (
                                    <p className="text-base font-medium text-[#1F1F1F]">
                                        R: {details.pdRight || details.right} / L: {details.pdLeft || details.left}
                                    </p>
                                ) : (
                                    <p className="text-base font-medium text-[#1F1F1F]">
                                        {details.pdSingle || details.single || "Not provided"}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Manual Prescription Layout */
                        <>
                            {/* Prescription For */}
                            {details.prescriptionFor && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                                        Prescription For
                                    </h3>
                                    <p className="text-base font-medium text-[#1F1F1F]">
                                        {details.prescriptionFor === "self" ? "Self" : details.patientName || "Other"}
                                    </p>
                                </div>
                            )}

                            {/* Right Eye (OD) */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-base font-bold text-[#1F1F1F] mb-4">
                                    Right Eye (OD)
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            SPH
                                        </p>
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            {details.od?.sph || "0.00"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            CYL
                                        </p>
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            {details.od?.cyl || "0.00"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            Axis
                                        </p>
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            {details.od?.axis || "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* Prism for OD */}
                                {details.od?.prism && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                                            Prism
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {details.od.prism.horizontal && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Horizontal</p>
                                                    <p className="text-sm font-medium text-[#1F1F1F]">
                                                        {details.od.prism.horizontal} {details.od.prism.baseHorizontal}
                                                    </p>
                                                </div>
                                            )}
                                            {details.od.prism.vertical && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Vertical</p>
                                                    <p className="text-sm font-medium text-[#1F1F1F]">
                                                        {details.od.prism.vertical} {details.od.prism.baseVertical}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Left Eye (OS) */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-base font-bold text-[#1F1F1F] mb-4">
                                    Left Eye (OS)
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            SPH
                                        </p>
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            {details.os?.sph || "0.00"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            CYL
                                        </p>
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            {details.os?.cyl || "0.00"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            Axis
                                        </p>
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            {details.os?.axis || "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* Prism for OS */}
                                {details.os?.prism && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                                            Prism
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {details.os.prism.horizontal && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Horizontal</p>
                                                    <p className="text-sm font-medium text-[#1F1F1F]">
                                                        {details.os.prism.horizontal} {details.os.prism.baseHorizontal}
                                                    </p>
                                                </div>
                                            )}
                                            {details.os.prism.vertical && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Vertical</p>
                                                    <p className="text-sm font-medium text-[#1F1F1F]">
                                                        {details.os.prism.vertical} {details.os.prism.baseVertical}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ADD Power, PD, Birth Year */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* ADD Power */}
                                {details.addPower && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            ADD Power
                                        </p>
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            {details.addPower}
                                        </p>
                                    </div>
                                )}

                                {/* PD */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                        Pupillary Distance
                                    </p>
                                    {details.pdType === "Dual" ? (
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            R: {details.pdRight} / L: {details.pdLeft}
                                        </p>
                                    ) : (
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            {details.pdSingle}
                                        </p>
                                    )}
                                </div>

                                {/* Birth Year */}
                                {details.birthYear && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            Birth Year
                                        </p>
                                        <p className="text-base font-medium text-[#1F1F1F]">
                                            {details.birthYear}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Additional Info */}
                            {prescription.additionalInfo && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                                        Additional Information
                                    </h3>
                                    <p className="text-base text-[#1F1F1F]">
                                        {prescription.additionalInfo}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                    {onRemove && (
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to remove this prescription?")) {
                                    onRemove();
                                    onClose();
                                }
                            }}
                            className="px-6 py-2 bg-[#E53935] text-white rounded-lg font-bold hover:bg-[#D32F2F] transition-colors"
                        >
                            Remove Prescription
                        </button>
                    )}
                    <div className={onRemove ? "ml-auto" : ""}>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-[#025048] text-white rounded-lg font-bold hover:bg-[#013b35] transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualPrescriptionModal;
