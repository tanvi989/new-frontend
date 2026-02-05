import React from "react";
import { useNavigate } from "react-router-dom";
import CheckoutStepper from "../CheckoutStepper";
import ProductDetailsFooter from "../ProductDetailsFooter";

interface ConfirmPrescriptionProps {
    savedValues: any;
    onEdit: () => void;
    onConfirm: () => void;
    prescriptionFor: "self" | "other";
    setPrescriptionFor: (val: "self" | "other") => void;
    otherName: string;
    setOtherName: (val: string) => void;
    product: any;
    getPrescriptionTypeLabel: () => string;
}

const ConfirmPrescription: React.FC<ConfirmPrescriptionProps> = ({
    savedValues,
    onEdit,
    onConfirm,
    prescriptionFor,
    setPrescriptionFor,
    otherName,
    setOtherName,
    product,
    getPrescriptionTypeLabel,
}) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F3F0E7] font-sans py-8 px-4 md:px-8 pb-32">
            {/* Desktop Stepper */}
            <div className="hidden md:block">
                <CheckoutStepper
                    currentStep={3}
                    selections={{
                        2: "Bifocal/Progressive Eyeglasses",
                        3: "Bifocal/Progressive Eyeglasses",
                    }}
                />
            </div>

            <div className="max-w-[800px] mx-auto">
                <div className="flex justify-between border-b border-black mb-8 px-4 md:px-0">
                    <h1 className="text-[18px] md:text-[28px] font-bold text-[#1F1F1F] uppercase tracking-widest">
                        CONFIRM YOUR PRESCRIPTION
                    </h1>

                    <button
                        onClick={() => navigate(-1)}
                        className="absolute right-4 md:right-6 flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/10 transition"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="bg-[#Fdfbf7] rounded-xl shadow-sm p-8 md:p-12 border border-[#E5E0D8]">
                    <p className="text-sm text-[#525252] mb-6 font-medium leading-relaxed">
                        Make sure your prescription matches the information below. Pay close
                        attention to the plus (+) or minus (-)
                    </p>

                    <p className="text-sm font-bold text-[#1F1F1F] mb-10">
                        To edit, click the value.
                    </p>

                    <div className="space-y-8 text-sm font-bold text-[#525252]">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span>Prescription type:</span>
                            <span className="text-[#E94D37] uppercase font-bold tracking-wide">
                                {getPrescriptionTypeLabel()}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                            <span>PD-Pupillary Distance:</span>
                            <span
                                className="text-[#E94D37] cursor-pointer hover:underline font-bold text-lg"
                                onClick={onEdit}
                                title="Click to edit"
                            >
                                {savedValues.hasDualPD
                                    ? `${savedValues.pdRight} (R) / ${savedValues.pdLeft} (L)`
                                    : savedValues.pdSingle}
                            </span>
                        </div>

                        {/* OD / OS Grid */}
                        <div className="overflow-x-auto">
                            <div className="grid grid-cols-4 gap-y-6 gap-x-4 mt-8 max-w-xl items-center text-sm md:text-base min-w-[300px]">
                                <div></div>
                                <div className="text-[#1F1F1F] text-center uppercase tracking-wider text-xs font-bold">
                                    SPH
                                </div>
                                <div className="text-[#1F1F1F] text-center uppercase tracking-wider text-xs font-bold">
                                    CYL
                                </div>
                                <div className="text-[#1F1F1F] text-center uppercase tracking-wider text-xs font-bold">
                                    AXIS
                                </div>

                                <div className="text-[#1F1F1F]">Right-OD:</div>
                                <div
                                    className="text-[#E94D37] cursor-pointer hover:underline text-center font-bold"
                                    onClick={onEdit}
                                >
                                    {savedValues.sphOD}
                                </div>
                                <div
                                    className="text-[#E94D37] cursor-pointer hover:underline text-center font-bold"
                                    onClick={onEdit}
                                >
                                    {savedValues.cylOD || "0.00"}
                                </div>
                                <div
                                    className="text-[#E94D37] cursor-pointer hover:underline text-center font-bold"
                                    onClick={onEdit}
                                >
                                    {savedValues.axisOD || "0"}
                                </div>

                                <div className="text-[#1F1F1F]">Left-OS:</div>
                                <div
                                    className="text-[#E94D37] cursor-pointer hover:underline text-center font-bold"
                                    onClick={onEdit}
                                >
                                    {savedValues.sphOS}
                                </div>
                                <div
                                    className="text-[#E94D37] cursor-pointer hover:underline text-center font-bold"
                                    onClick={onEdit}
                                >
                                    {savedValues.cylOS || "0.00"}
                                </div>
                                <div
                                    className="text-[#E94D37] cursor-pointer hover:underline text-center font-bold"
                                    onClick={onEdit}
                                >
                                    {savedValues.axisOS || "0"}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center mt-8 pt-4">
                            <span>Birth Year:</span>
                            <span
                                className="text-[#E94D37] cursor-pointer hover:underline"
                                onClick={onEdit}
                            >
                                {savedValues.birthYear}
                            </span>
                        </div>

                        {savedValues.addPower && (
                            <div className="flex flex-wrap gap-2 items-center">
                                <span>Additional power:</span>
                                <span
                                    className="text-[#E94D37] cursor-pointer hover:underline"
                                    onClick={onEdit}
                                >
                                    {savedValues.addPower}
                                </span>
                            </div>
                        )}

                        {/* Prism Confirmation */}
                        {savedValues.addPrism && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[#1F1F1F]">Prism Values:</span>
                                </div>
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                    {(savedValues.prismODHorizontal ||
                                        savedValues.prismODVertical) && (
                                            <div className="flex gap-4 items-center">
                                                <span className="w-20 text-[#1F1F1F] font-bold">
                                                    Right (OD):
                                                </span>
                                                {savedValues.prismODHorizontal && (
                                                    <span className="text-[#E94D37] font-bold bg-[#E94D37]/10 px-2 py-1 rounded">
                                                        {savedValues.prismODHorizontal}{" "}
                                                        <span className="text-xs uppercase">
                                                            {savedValues.prismODBaseHorizontal}
                                                        </span>
                                                    </span>
                                                )}
                                                {savedValues.prismODVertical && (
                                                    <span className="text-[#E94D37] font-bold bg-[#E94D37]/10 px-2 py-1 rounded">
                                                        {savedValues.prismODVertical}{" "}
                                                        <span className="text-xs uppercase">
                                                            {savedValues.prismODBaseVertical}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    {(savedValues.prismOSHorizontal ||
                                        savedValues.prismOSVertical) && (
                                            <div className="flex gap-4 items-center">
                                                <span className="w-20 text-[#1F1F1F] font-bold">
                                                    Left (OS):
                                                </span>
                                                {savedValues.prismOSHorizontal && (
                                                    <span className="text-[#E94D37] font-bold bg-[#E94D37]/10 px-2 py-1 rounded">
                                                        {savedValues.prismOSHorizontal}{" "}
                                                        <span className="text-xs uppercase">
                                                            {savedValues.prismOSBaseHorizontal}
                                                        </span>
                                                    </span>
                                                )}
                                                {savedValues.prismOSVertical && (
                                                    <span className="text-[#E94D37] font-bold bg-[#E94D37]/10 px-2 py-1 rounded">
                                                        {savedValues.prismOSVertical}{" "}
                                                        <span className="text-xs uppercase">
                                                            {savedValues.prismOSBaseVertical}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}

                        <div className="mt-10 pt-8 border-t border-gray-200">
                            <p className="mb-6 font-bold text-[#1F1F1F] text-base">
                                This Prescription is for ?
                            </p>
                            <div className="flex gap-8">
                                <label className="flex items-center gap-3 cursor-pointer group select-none">
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${prescriptionFor === "self"
                                            ? "border-[#E94D37]"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        {prescriptionFor === "self" && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#E94D37]"></div>
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        name="presFor"
                                        checked={prescriptionFor === "self"}
                                        onChange={() => setPrescriptionFor("self")}
                                        className="hidden"
                                    />
                                    <span className="text-[#1F1F1F] font-medium group-hover:text-black">
                                        For my Self
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group select-none">
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${prescriptionFor === "other"
                                            ? "border-[#E94D37]"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        {prescriptionFor === "other" && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#E94D37]"></div>
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        name="presFor"
                                        checked={prescriptionFor === "other"}
                                        onChange={() => setPrescriptionFor("other")}
                                        className="hidden"
                                    />
                                    <span className="text-[#1F1F1F] font-medium group-hover:text-black">
                                        Someone Else
                                    </span>
                                </label>
                            </div>

                            {/* Name Input for Someone Else */}
                            {prescriptionFor === "other" && (
                                <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <input
                                        type="text"
                                        placeholder="Enter Name"
                                        value={otherName}
                                        onChange={(e) => setOtherName(e.target.value)}
                                        className="w-full bg-[#Fdfbf7] border border-gray-300 rounded-lg px-4 py-3 text-[#1F1F1F] focus:outline-none focus:border-[#E94D37] transition-colors placeholder:text-gray-400"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mt-10 mb-12">
                    <button
                        onClick={onConfirm}
                        className="bg-[#014D40] text-white px-16 py-4 rounded-full font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#013d33] transition-all shadow-lg hover:shadow-xl active:scale-95 min-w-[280px]"
                    >
                        SAVE AND CONTINUE
                    </button>
                </div>
            </div>

            <div className="md:hidden">
                <ProductDetailsFooter
                    product={product}
                    selectedColor={product.colors ? product.colors[0] : undefined}
                    prescriptionData={{
                        prescriptionType: getPrescriptionTypeLabel(),
                        pd: savedValues.hasDualPD
                            ? `${savedValues.pdRight}/${savedValues.pdLeft}`
                            : savedValues.pdSingle,
                        birthYear: savedValues.birthYear,
                        od: {
                            sph: savedValues.sphOD,
                            cyl: savedValues.cylOD,
                            axis: savedValues.axisOD,
                        },
                        os: {
                            sph: savedValues.sphOS,
                            cyl: savedValues.cylOS,
                            axis: savedValues.axisOS,
                        },
                        addPower: savedValues.addPower,
                    }}
                />
            </div>
        </div>
    );
};

export default ConfirmPrescription;
