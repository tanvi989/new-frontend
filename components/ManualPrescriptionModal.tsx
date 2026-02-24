import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ManualPrescriptionModalProps {
    open: boolean;
    onClose: () => void;
    prescription: any;
    onRemove?: () => void;
    cartId?: number;
    onSavePD?: (pd: { pdSingle?: string; pdRight?: string; pdLeft?: string }) => void | Promise<void>;
    /** When false, hide "Add PD" / "Edit PD" (e.g. on cart – PD is only added on select-prescription-source). Default true. */
    allowEditPd?: boolean;
}

// Get PD from prescription from all possible paths (so we don't show "Not provided" when it exists elsewhere)
function getPdFromPrescription(prescription: any): { pdSingle?: string; pdRight?: string; pdLeft?: string; isDual?: boolean } {
    if (!prescription) return {};
    const d = prescription.prescriptionDetails || prescription.data || prescription;
    const root = prescription as any;
   const pdRight  = root.pdRight  ?? root.pd_right_mm  ?? root.pd_right  ?? root.pdOD ?? root.right ??
                 d.pdRight     ?? d.pd_right_mm     ?? d.pd_right     ?? d.pdOD   ?? d.right     ?? undefined;
const pdLeft   = root.pdLeft   ?? root.pd_left_mm   ?? root.pd_left   ?? root.pdOS ?? root.left  ??
                 d.pdLeft      ?? d.pd_left_mm      ?? d.pd_left      ?? d.pdOS   ?? d.left      ?? undefined;
const pdSingle = root.pdSingle ?? root.pd_single_mm ?? root.pd_single ?? root.single ??
                 d.pdSingle    ?? d.pd_single_mm    ?? d.pd_single    ?? d.single  ?? d.totalPD  ??
                 (d.pdOD && d.pdOS ? `${d.pdOD}/${d.pdOS}` : undefined);
    const isDual = root.pdType === "Dual" || root.pdType === "dual" || !!(pdRight && pdLeft);
    return { pdSingle, pdRight, pdLeft, isDual };
}

const ManualPrescriptionModal: React.FC<ManualPrescriptionModalProps> = ({
    open,
    onClose,
    prescription,
    onRemove,
    cartId,
    onSavePD,
    allowEditPd = true,
}) => {
    const [editingPd, setEditingPd] = useState(false);
    const [pdSingle, setPdSingle] = useState("");
    const [pdRight, setPdRight] = useState("");
    const [pdLeft, setPdLeft] = useState("");
    const [pdType, setPdType] = useState<"single" | "dual">("single");
    const [savingPd, setSavingPd] = useState(false);

    const canEditPd = !!(cartId && onSavePD && allowEditPd);

    useEffect(() => {
        if (!open || !prescription) return;
        const pd = getPdFromPrescription(prescription);
        setPdSingle(pd.pdSingle ?? pd.pdRight ?? "");
        setPdRight(pd.pdRight ?? "");
        setPdLeft(pd.pdLeft ?? "");
        setPdType(pd.isDual ? "dual" : "single");
        setEditingPd(false);
    }, [open, prescription]);

    if (!open || !prescription) return null;

    // Merge top-level and nested data to ensure we capture all fields (image_url, PDs, etc.)
    const details = {
        ...prescription,
        ...(prescription.prescriptionDetails || prescription.data || {})
    };

    const currentPd = getPdFromPrescription(prescription);
    const hasAnyPd = !!(currentPd.pdSingle || currentPd.pdRight || currentPd.pdLeft);

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
                                    aUploaded Prescription
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

                            {/* PD Display for Upload - show from all possible paths; allow Add/Edit when cartId + onSavePD */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                    Pupillary Distance (PD)
                                </p>
                                {!editingPd ? (
                                    <>
                                        {currentPd.isDual && (currentPd.pdRight || currentPd.pdLeft) ? (
                                            <p className="text-base font-medium text-[#1F1F1F]">
                                                R: {currentPd.pdRight} / L: {currentPd.pdLeft}
                                            </p>
                                        ) : currentPd.pdSingle ? (
                                            <p className="text-base font-medium text-[#1F1F1F]">
                                                {currentPd.pdSingle}
                                            </p>
                                        ) : (
                                            <p className="text-base font-medium text-[#1F1F1F]">
                                                Not provided
                                            </p>
                                        )}
                                        {canEditPd && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingPd(true)}
                                                className="mt-2 text-sm text-[#025048] hover:text-[#013a34] font-medium underline"
                                            >
                                                {hasAnyPd ? "Edit PD" : "Add PD"}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-3 mt-2">
                                        <div className="flex gap-2 items-center">
                                            <label className="flex items-center gap-1">
                                                <input type="radio" checked={pdType === "single"} onChange={() => setPdType("single")} />
                                                <span className="text-sm">Single</span>
                                            </label>
                                            <label className="flex items-center gap-1">
                                                <input type="radio" checked={pdType === "dual"} onChange={() => setPdType("dual")} />
                                                <span className="text-sm">Dual (R/L)</span>
                                            </label>
                                        </div>
                                        {pdType === "single" ? (
                                            <input
                                                type="text"
                                                placeholder="e.g. 63"
                                                value={pdSingle}
                                                onChange={(e) => setPdSingle(e.target.value)}
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                            />
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="R"
                                                    value={pdRight}
                                                    onChange={(e) => setPdRight(e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="L"
                                                    value={pdLeft}
                                                    onChange={(e) => setPdLeft(e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                                                />
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={savingPd || (pdType === "single" ? !pdSingle.trim() : !pdRight.trim() || !pdLeft.trim())}
                                                onClick={async () => {
                                                    setSavingPd(true);
                                                    try {
                                                        if (pdType === "single") {
                                                            await onSavePD?.({ pdSingle: pdSingle.trim() });
                                                        } else {
                                                            await onSavePD?.({ pdRight: pdRight.trim(), pdLeft: pdLeft.trim() });
                                                        }
                                                        setEditingPd(false);
                                                    } finally {
                                                        setSavingPd(false);
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-[#025048] text-white text-sm font-medium rounded hover:bg-[#013a34] disabled:opacity-50"
                                            >
                                                {savingPd ? "Saving…" : "Save PD"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingPd(false)}
                                                className="px-3 py-1.5 border border-gray-300 text-sm rounded"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
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
                                {/* FIX: Show Reading Power for both eyes if they exist */}
                                {(details.readingPowerRight || details.readingPowerLeft || details.addPower) && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            Reading / Add Power
                                        </p>
                                        <div className="text-base font-medium text-[#1F1F1F]">
                                            {(details.readingPowerRight || details.readingPowerLeft) ? (
                                                <div className="flex gap-4">
                                                    {details.readingPowerRight && <span>R: {details.readingPowerRight}</span>}
                                                    {details.readingPowerLeft && <span>L: {details.readingPowerLeft}</span>}
                                                </div>
                                            ) : (
                                                <span>{details.addPower}</span>
                                            )}
                                        </div>
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
