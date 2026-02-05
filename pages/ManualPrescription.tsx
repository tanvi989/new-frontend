import React, { useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Formik, Form, FormikProps } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import CheckoutStepper from "../components/CheckoutStepper";
import SelectField from "../components/SelectField";
import InputField from "../components/InputField";
import PrescriptionHelpModal from "../components/PrescriptionHelpModal";
import GetMyFitPopup from "../components/getMyFitPopup/GetMyFitPopup";
import { useCaptureData } from "../contexts/CaptureContext";
import ProductDetailsFooter from "../components/ProductDetailsFooter";
import Toast from "../components/Toast";
import { X } from "lucide-react";
import ConfirmPrescription from "../components/prescription/ConfirmPrescription";
import { saveMyPrescription } from "../api/retailerApis";
import { getProductFlow } from "../utils/productFlowStorage";

// Component defined outside to prevent re-rendering focus loss
const PrismRadio = ({
  name,
  value,
  label,
  formik,
  isdisabled,
}: {
  name: string;
  value: string;
  label: string;
  formik: any;
  isdisabled?: boolean;
}) => {
  const isChecked = formik.values[name] === value;
  return (
    <label className="flex items-center gap-2 cursor-pointer group select-none">
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isChecked
          ? "border-[#E94D37]"
          : "border-gray-300 group-hover:border-gray-400"
          }`}
      >
        {isChecked && <div className="w-2 h-2 rounded-full bg-[#E94D37]"></div>}
      </div>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        onChange={() => formik.setFieldValue(name, value)}
        className="hidden"
        disabled={isdisabled}
      />
      <span className="text-sm font-medium text-[#1F1F1F]">{label}</span>
    </label>
  );
};

const defaultInitialValues = {
  sphOD: "0.00",
  cylOD: "0.00",
  axisOD: "",

  sphOS: "0.00",
  cylOS: "0.00",
  axisOS: "",

  addPower: "",

  birthYear: "2000",

  // New Preference State - initially empty
  pdPreference: "", // "" | "know" | "generate"

  // New Reading Power Fields
  readingPowerRight: "",
  readingPowerLeft: "",

  hasDualPD: false,
  pdSingle: "",
  pdRight: "",
  pdLeft: "",

  addPrism: false,

  // Prism Fields
  prismODHorizontal: "",
  prismODBaseHorizontal: "",
  prismODVertical: "",
  prismODBaseVertical: "",

  prismOSHorizontal: "",
  prismOSBaseHorizontal: "",
  prismOSVertical: "",
  prismOSBaseVertical: "",

  additionalInfo: "",
};

const ManualPrescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state: locationState } = useLocation();
  const flow = id ? getProductFlow(id) : null;
  const state = { ...flow, product: locationState?.product ?? flow?.product, ...locationState };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();

  // Check if coming from cart
  const cartId = searchParams.get("cart_id");
  const isFromCart = !!cartId;

  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpModalTab, setHelpModalTab] = useState("Pupillary Distance");
  const [isGetMyFitOpen, setIsGetMyFitOpen] = useState(false);
  const { capturedData } = useCaptureData();

  // Confirmation State
  const [showConfirm, setShowConfirm] = useState(false);
  const [savedValues, setSavedValues] = useState<
    typeof defaultInitialValues | null
  >(null);
  const [prescriptionFor, setPrescriptionFor] = useState<"self" | "other">(
    "self"
  );
  const [otherName, setOtherName] = useState("");

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const currentYear = new Date().getFullYear();

  const initialValues = savedValues || defaultInitialValues;

  const validationSchema = Yup.object().shape({
    // Only Reading Power fields are required initially
    readingPowerRight: Yup.string().required("Reading power (Right) is required"),
    readingPowerLeft: Yup.string().required("Reading power (Left) is required"),

    axisOD: Yup.string().when("cylOD", {
      is: (val: string) => val !== "" && parseFloat(val) !== 0,
      then: (schema) => schema.required("Required"),
      otherwise: (schema) => schema.nullable(),
    }),
    axisOS: Yup.string().when("cylOS", {
      is: (val: string) => val !== "" && parseFloat(val) !== 0,
      then: (schema) => schema.required("Required"),
      otherwise: (schema) => schema.nullable(),
    }),

    // Conditional Validation for PD - only required if preference is 'know'
    pdRight: Yup.string().when("pdPreference", {
      is: "know",
      then: (schema) => schema.required("Right PD value is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    pdLeft: Yup.string().when("pdPreference", {
      is: "know",
      then: (schema) => schema.required("Left PD value is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  });


  const handleFormSubmit = (values: typeof initialValues) => {
    // Only validate PD section if preference is 'know'
    if (values.pdPreference === "know") {
      if (!values.pdRight || !values.pdLeft) {
        setToast({ message: "Please enter both Right and Left PD values", type: "warning" });
        return;
      }
    }

    // Check required fields: Reading Power
    if (!values.readingPowerRight || !values.readingPowerLeft) {
      setToast({ message: "Please enter Reading/Additional Power for both eyes", type: "warning" });
      return;
    }

    // Check axis if cylinder is provided
    const needsAxisOD = values.cylOD && parseFloat(values.cylOD) !== 0;
    const needsAxisOS = values.cylOS && parseFloat(values.cylOS) !== 0;

    if (needsAxisOD && !values.axisOD) {
      setToast({ message: "Please enter Axis for Right Eye (OD)", type: "warning" });
      return;
    }

    if (needsAxisOS && !values.axisOS) {
      setToast({ message: "Please enter Axis for Left Eye (OS)", type: "warning" });
      return;
    }

    setSavedValues(values);
    setShowConfirm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSave = async () => {
    // Generate a unique ID for this specific prescription/product pairing
    const uniqueId = `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cartItemId = searchParams.get("cart_id");
    console.log("📝 [ManualPrescription] Saving prescription with cartId:", cartItemId);

    // Construct the payload matching the schema
    const payload = {
      _id: uniqueId,
      userId: localStorage.getItem('user_id'),
      guestId: localStorage.getItem('guest_id'),
      createdAt: new Date().toISOString(),

      associatedProduct: {
        cartId: cartItemId,
        productSku: state?.product?.skuid || id,
        productName: state?.product?.name || "Unknown Product",
        uniqueId: uniqueId
      },

      prescriptionDetails: {
        type: "manual",
        name: "My Manual Prescription",
        prescriptionFor: prescriptionFor,
        patientName: prescriptionFor === "other" ? otherName : undefined,
        birthYear: savedValues.birthYear,
        addPower: savedValues.readingPowerRight, // Use reading power as ADD

        // Add new reading powers
        readingPowerRight: savedValues.readingPowerRight,
        readingPowerLeft: savedValues.readingPowerLeft,

        od: {
          sph: savedValues.sphOD,
          cyl: savedValues.cylOD || "0.00",
          axis: savedValues.axisOD,
          prism: savedValues.addPrism ? {
            horizontal: savedValues.prismODHorizontal,
            baseHorizontal: savedValues.prismODBaseHorizontal,
            vertical: savedValues.prismODVertical,
            baseVertical: savedValues.prismODBaseVertical,
          } : undefined
        },

        os: {
          sph: savedValues.sphOS,
          cyl: savedValues.cylOS || "0.00",
          axis: savedValues.axisOS,
          prism: savedValues.addPrism ? {
            horizontal: savedValues.prismOSHorizontal,
            baseHorizontal: savedValues.prismOSBaseHorizontal,
            vertical: savedValues.prismOSVertical,
            baseVertical: savedValues.prismOSBaseVertical,
          } : undefined
        },

        pdType: "Dual", // Always dual now since we have right/left
        pdSingle: null,
        pdRight: savedValues.pdRight || null,
        pdLeft: savedValues.pdLeft || null,

        // Include preference
        pdPreference: savedValues.pdPreference
      },

      additionalInfo: savedValues.additionalInfo,
    };

    try {
      const token = localStorage.getItem('token');
      const isLoggedIn = !!token;
      const guestId = localStorage.getItem('guest_id') || undefined;

      // Save to backend/database for both logged-in users and guests
      const savePayload = {
        ...payload.prescriptionDetails,
        associatedProduct: payload.associatedProduct
      };
      try {
        await saveMyPrescription(
          "manual",
          savePayload,
          "Manual Prescription",
          undefined,
          isLoggedIn ? undefined : guestId
        );
        if (isLoggedIn) {
          queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
        }
      } catch (apiErr) {
        console.warn("Prescription API save failed (local storage will still be updated):", apiErr);
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');

      if (cartItemId) {
        const existingIndex = savedPrescriptions.findIndex((p: any) =>
          p?.associatedProduct?.cartId && String(p.associatedProduct.cartId) === String(cartItemId)
        );

        if (existingIndex >= 0) {
          savedPrescriptions[existingIndex] = payload;
        } else {
          savedPrescriptions.push(payload);
        }
      } else {
        savedPrescriptions.push(payload);
      }

      localStorage.setItem('prescriptions', JSON.stringify(savedPrescriptions));

      const productSku = state?.product?.skuid || id;
      if (productSku) {
        const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
        sessionPrescriptions[productSku] = payload;
        sessionStorage.setItem('productPrescriptions', JSON.stringify(sessionPrescriptions));
      }

    } catch (error) {
      console.error("❌ Error saving manual prescription:", error);
    }

    if (isFromCart) {
      sessionStorage.setItem("fromPrescription", "true");
      navigate("/cart");
    } else {
      const compatibilityPayload = {
        sphOD: savedValues.sphOD,
        cylOD: savedValues.cylOD,
        axisOD: savedValues.axisOD,
        addOD: savedValues.readingPowerRight, // Use reading power as ADD
        pdOD: savedValues.pdRight || "",

        sphOS: savedValues.sphOS,
        cylOS: savedValues.cylOS,
        axisOS: savedValues.axisOS,
        addOS: savedValues.readingPowerLeft, // Use reading power as ADD
        pdOS: savedValues.pdLeft || "",

        birthYear: savedValues.birthYear,
        pdType: "Dual",
        totalPD: "",
        prism: savedValues.addPrism ? payload.prescriptionDetails.od.prism : null,
        additionalInfo: savedValues.additionalInfo,
        prescriptionFor: prescriptionFor,

        // Add new fields to compatibility payload
        readingPowerRight: savedValues.readingPowerRight,
        readingPowerLeft: savedValues.readingPowerLeft,
        pdPreference: savedValues.pdPreference
      };

      navigate(`/product/${id}/select-lens`, {
        state: {
          ...state,
          product: state?.product || {
            id: id,
            skuid: id,
            name: state?.product?.name || "Product",
            price: state?.product?.price || "0",
            image: state?.product?.image || "",
            colors: state?.product?.colors || [],
          },
          prescriptionData: compatibilityPayload,
          fullPrescriptionPayload: payload,
          prescriptionMethod: "manual",
        },
      });
    }
  };

  const openHelp = (tab: string) => {
    setHelpModalTab(tab);
    setHelpModalOpen(true);
  };

  const getPrescriptionTypeLabel = () => {
    const tier = state?.prescriptionTier;
    if (tier === "advanced") return "PREMIUM PROGRESSIVE EYEGLASSES";
    if (tier === "standard") return "STANDARD PROGRESSIVE EYEGLASSES";
    return "BIFOCAL/PROGRESSIVE EYEGLASSES";
  };

  const HelpButton = ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-[#E94D37] hover:text-[#bf3e2b] transition-colors ml-2"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </button>
  );

  const product = state?.product || {
    name: "Unknown",
    price: "0",
    image: "",
    colors: [],
  };

  if (showConfirm && savedValues) {
    return (
      <ConfirmPrescription
        savedValues={savedValues}
        onEdit={() => setShowConfirm(false)}
        onConfirm={handleFinalSave}
        prescriptionFor={prescriptionFor}
        setPrescriptionFor={setPrescriptionFor}
        otherName={otherName}
        setOtherName={setOtherName}
        product={product}
        getPrescriptionTypeLabel={getPrescriptionTypeLabel}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F3F0E7] font-sans py-8 px-4 md:px-8 pb-32">
      <div className="hidden md:block">
        <CheckoutStepper
          currentStep={3}
          selections={{
            2: "Bifocal/Progressive Eyeglasses",
            3: "Bifocal/Progressive Eyeglasses",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto mt-0">
        <div className="text-center mb-6">
          <h1 className="hidden md:block text-[24px] md:text-[28px] font-semibold text-[#1F1F1F] uppercase tracking-widest">
            ADD YOUR PRESCRIPTION
          </h1>

          <div className="md:hidden flex items-center justify-between border-b border-black w-full pb-2">
            <h1 className="text-[20px] font-semibold text-[#1F1F1F] tracking-tight">
              Enter Your Prescription
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/10 transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="md:hidden text-center flex flex-col space-y-4 mb-4 text-sm text-gray-600">
          <p>Select your prescription values</p>
          <p>A plus (+) means difficulty seeing near, and a minus (-) means difficulty seeing far.</p>
        </div>

        <div className="bg-gray-50 rounded-xl shadow-sm p-6 md:p-8 border border-[#E5E0D8]">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize
          >
            {(formik: FormikProps<typeof initialValues>) => {
              const isRightOSPrescriptionComplete =
                parseFloat(formik.values.sphOD) !== 0 &&
                parseFloat(formik.values.cylOD) !== 0 &&
                formik.values.axisOD !== "";


              const isLeftOSPrescriptionComplete =
                parseFloat(formik.values.sphOS) !== 0 &&
                parseFloat(formik.values.cylOS) !== 0 &&
                formik.values.axisOS !== "";


              return (
                <Form id="manual-prescription-form" className="flex flex-col gap-8">
                  <div>
                    <div className="flex items-center mb-3">
                      <h3 className="text-[#1F1F1F] font-bold text-base">
                        Right Eye (OD)
                      </h3>
                      <HelpButton onClick={() => openHelp("OD/OS")} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <SelectField
                        name="sphOD"
                        label="SPH"
                        startValue={-12}
                        endValue={12}
                        step={0.25}
                        formik={formik}
                        className="bg-[#F3F0E7] border-gray-200"
                      />
                      <SelectField
                        name="cylOD"
                        label="CYL"
                        startValue={-6}
                        endValue={6}
                        step={0.25}
                        formik={formik}
                        className="bg-[#F3F0E7] border-gray-200"

                      />
                      <InputField
                        name="axisOD"
                        label="Axis"
                        placeholder="0"
                        type="number"
                        min="0"
                        max="180"
                        className="bg-[#F3F0E7] border-gray-200"
                        disabled={!formik.values.cylOD || parseFloat(formik.values.cylOD) === 0}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <h3 className="text-[#1F1F1F] font-bold text-base">
                        Left Eye (OS)
                      </h3>
                      <HelpButton onClick={() => openHelp("OD/OS")} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <SelectField
                        name="sphOS"
                        label="SPH"
                        startValue={-12}
                        endValue={12}
                        step={0.25}
                        formik={formik}
                        className="bg-[#F3F0E7] border-gray-200"
                      />
                      <SelectField
                        name="cylOS"
                        label="CYL"
                        startValue={-6}
                        endValue={6}
                        step={0.25}
                        formik={formik}
                        className="bg-[#F3F0E7] border-gray-200"
                      />
                      <InputField
                        name="axisOS"
                        label="Axis"
                        placeholder="0"
                        type="number"
                        min="0"
                        max="180"
                        className="bg-[#F3F0E7] border-gray-200"
                        disabled={!formik.values.cylOS || parseFloat(formik.values.cylOS) === 0}
                      />
                    </div>
                  </div>

                  {/* Reading / Additional Power Section - Replaces ADD */}
                  <div>
                    <div className="flex items-center mb-3">
                      <h3 className="text-[#1F1F1F] font-bold text-base">
                        Reading / Add Power
                      </h3>
                      <HelpButton onClick={() => openHelp("ADD")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField
                        name="readingPowerRight"
                        label="Right Eye"
                        startValue={0.00}
                        endValue={3.50}
                        step={0.25}
                        formik={formik}
                        required
                        className="bg-[#F3F0E7] border-gray-200"
                        placeholder="Select"
                      />
                      <SelectField
                        name="readingPowerLeft"
                        label="Left Eye"
                        startValue={0.00}
                        endValue={3.50}
                        step={0.25}
                        formik={formik}
                        required
                        className="bg-[#F3F0E7] border-gray-200"
                        placeholder="Select"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <h3 className="text-[#1F1F1F] font-bold text-base">
                        Birth Year
                      </h3>
                      <HelpButton onClick={() => openHelp("Birth Year")} />
                    </div>
                    <div className="w-full">
                      <div className="relative">
                        <select
                          name="birthYear"
                          value={formik.values.birthYear}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full bg-[#F3F0E7] border border-gray-200 rounded-lg px-4 py-3 pr-8 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors appearance-none cursor-pointer ${formik.touched.birthYear && formik.errors.birthYear
                            ? "border-red-500"
                            : ""
                            }`}
                        >
                          <option value="" disabled>
                            Select Year
                          </option>
                          {Array.from(
                            { length: currentYear - 1900 + 1 },
                            (_, i) => currentYear - i
                          ).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                      {formik.touched.birthYear && formik.errors.birthYear ? (
                        <span className="text-red-500 text-xs mt-1 font-medium">
                          {formik.errors.birthYear as string}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* --- PD SECTION START --- */}
                  <div>
                    <div className="flex items-center mb-3">
                      <h3 className="text-[#1F1F1F] font-bold text-base">
                        Pupillary Distance (PD) Option
                      </h3>
                      <HelpButton
                        onClick={() => openHelp("Pupillary Distance")}
                      />
                    </div>

                    <div className="flex items-center gap-6 mb-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pdPreference"
                          value="know"
                          checked={formik.values.pdPreference === 'know'}
                          onChange={() => {
                            formik.setFieldValue("pdPreference", "know");
                            formik.setFieldTouched("pdPreference", true);
                          }}
                          className="w-4 h-4 text-[#014D40] focus:ring-[#014D40] border-gray-300"
                        />
                        <span className="text-sm font-medium text-[#1F1F1F]">I know my PD value</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pdPreference"
                          value="generate"
                          checked={formik.values.pdPreference === 'generate'}
                          onChange={() => {
                            formik.setFieldValue("pdPreference", "generate");
                            formik.setFieldTouched("pdPreference", true);
                            // Open GetMyFitModal when "Generate new PD value" is selected
                            setIsGetMyFitOpen(true);
                          }}
                          className="w-4 h-4 text-[#014D40] focus:ring-[#014D40] border-gray-300"
                        />
                        <span className="text-sm font-medium text-[#1F1F1F]">Generate new PD value</span>
                      </label>
                    </div>

                    {/* Show PD Input if 'know' is selected */}
                    {formik.values.pdPreference === "know" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                          <SelectField
                            name="pdRight"
                            label="Right Eye"
                            startValue={20}
                            endValue={42}
                            step={0.5}
                            formik={formik}
                            required={formik.values.pdPreference === 'know'}
                            className="bg-[#F3F0E7] border-gray-200"
                            placeholder="Select"
                          />
                          <SelectField
                            name="pdLeft"
                            label="Left Eye"
                            startValue={20}
                            endValue={42}
                            step={0.5}
                            formik={formik}
                            required={formik.values.pdPreference === 'know'}
                            className="bg-[#F3F0E7] border-gray-200"
                            placeholder="Select"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* --- PD SECTION END --- */}


                  {formik.values.addPrism && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300 py-6 border-t border-gray-200">
                      <div className="flex items-center mb-6 gap-2">
                        <h3 className="text-[#1F1F1F] font-bold text-base uppercase tracking-wider">
                          Add Prism Value
                        </h3>
                        <HelpButton onClick={() => openHelp("PRISM")} />
                      </div>

                      {/* Right Eye OD */}
                      <div className="mb-8">
                        <h4 className="text-sm font-bold text-[#1F1F1F] mb-3 uppercase tracking-wide">
                          Right Eye - OD
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Horizontal */}
                          <div className="bg-white/50 p-0 rounded-none">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                              Horizontal
                            </label>
                            <div className="flex gap-6 items-center">
                              <div className="w-28">
                                <SelectField
                                  name="prismODHorizontal"
                                  startValue={0.5}
                                  endValue={5}
                                  step={0.25}
                                  formik={formik}
                                  className="bg-[#F3F0E7] border-gray-200"
                                  placeholder="0.00"
                                  disabled={!isRightOSPrescriptionComplete}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-[#525252] uppercase">
                                  Base Direction
                                </label>
                                <div className="flex gap-6">
                                  <PrismRadio
                                    name="prismODBaseHorizontal"
                                    value="In"
                                    label="In"

                                    formik={formik}
                                    isdisabled={!isRightOSPrescriptionComplete}
                                  />
                                  <PrismRadio
                                    name="prismODBaseHorizontal"
                                    value="Out"
                                    label="Out"
                                    formik={formik}
                                    isdisabled={!isRightOSPrescriptionComplete}
                                  />
                                </div>
                                {formik.errors.prismODBaseHorizontal &&
                                  formik.touched.prismODBaseHorizontal && (
                                    <div className="text-red-500 text-xs font-medium">
                                      {
                                        formik.errors
                                          .prismODBaseHorizontal as string
                                      }
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Vertical */}
                          <div className="bg-white/50 p-0 rounded-none">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                              Vertical
                            </label>
                            <div className="flex gap-6 items-center">
                              <div className="w-28">
                                <SelectField
                                  name="prismODVertical"
                                  startValue={0.5}
                                  endValue={5}
                                  step={0.25}
                                  formik={formik}
                                  className="bg-[#F3F0E7] border-gray-200"
                                  placeholder="0.00"
                                  disabled={!isRightOSPrescriptionComplete}
                                />
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-[#525252] uppercase">
                                  Base Direction
                                </label>
                                <div className="flex gap-6">
                                  <PrismRadio
                                    name="prismODBaseVertical"
                                    value="Up"
                                    label="Up"
                                    formik={formik}
                                    isdisabled={!isRightOSPrescriptionComplete}
                                  />
                                  <PrismRadio
                                    name="prismODBaseVertical"
                                    value="Down"
                                    label="Down"
                                    formik={formik}
                                    isdisabled={!isRightOSPrescriptionComplete}
                                  />
                                </div>
                                {formik.errors.prismODBaseVertical &&
                                  formik.touched.prismODBaseVertical && (
                                    <div className="text-red-500 text-xs font-medium">
                                      {
                                        formik.errors
                                          .prismODBaseVertical as string
                                      }
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Left Eye OS */}
                      <div>
                        <h4 className="text-sm font-bold text-[#1F1F1F] mb-3 uppercase tracking-wide">
                          Left Eye - OS
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Horizontal */}
                          <div className="bg-white/50 p-0 rounded-none">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                              Horizontal
                            </label>
                            <div className="flex gap-6 items-center">
                              <div className="w-28">
                                <SelectField
                                  name="prismOSHorizontal"
                                  startValue={0.5}
                                  endValue={5}
                                  step={0.25}
                                  formik={formik}
                                  className="bg-[#F3F0E7] border-gray-200"
                                  placeholder="0.00"
                                  disabled={!isLeftOSPrescriptionComplete}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-[#525252] uppercase">
                                  Base Direction
                                </label>
                                <div className="flex gap-6">
                                  <PrismRadio
                                    name="prismOSBaseHorizontal"
                                    value="In"
                                    label="In"
                                    formik={formik}
                                    isdisabled={!isLeftOSPrescriptionComplete}
                                  />
                                  <PrismRadio
                                    name="prismOSBaseHorizontal"
                                    value="Out"
                                    label="Out"
                                    formik={formik}
                                    isdisabled={!isLeftOSPrescriptionComplete}
                                  />
                                </div>
                                {formik.errors.prismOSBaseHorizontal &&
                                  formik.touched.prismOSBaseHorizontal && (
                                    <div className="text-red-500 text-xs font-medium">
                                      {
                                        formik.errors
                                          .prismOSBaseHorizontal as string
                                      }
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Vertical */}
                          <div className="bg-white/50 p-0 rounded-none">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                              Vertical
                            </label>
                            <div className="flex gap-6 items-center">
                              <div className="w-28">
                                <SelectField
                                  name="prismOSVertical"
                                  startValue={0.5}
                                  endValue={5}
                                  step={0.25}
                                  formik={formik}
                                  className="bg-[#F3F0E7] border-gray-200"
                                  placeholder="0.00"
                                  disabled={!isLeftOSPrescriptionComplete}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-[#525252] uppercase">
                                  Base Direction
                                </label>
                                <div className="flex gap-6">
                                  <PrismRadio
                                    name="prismOSBaseVertical"
                                    value="Up"
                                    label="Up"
                                    formik={formik}
                                    isdisabled={!isLeftOSPrescriptionComplete}
                                  />
                                  <PrismRadio
                                    name="prismOSBaseVertical"
                                    value="Down"
                                    label="Down"
                                    formik={formik}
                                    isdisabled={!isLeftOSPrescriptionComplete}
                                  />
                                </div>
                                {formik.errors.prismOSBaseVertical &&
                                  formik.touched.prismOSBaseVertical && (
                                    <div className="text-red-500 text-xs font-medium">
                                      {
                                        formik.errors
                                          .prismOSBaseVertical as string
                                      }
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Removed the hasDualPD checkbox since we always use dual now */}

                  <div className="flex flex-wrap justify-between gap-4 pt-2 border-t border-gray-100 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 select-none">
                      <input
                        type="checkbox"
                        name="addPrism"
                        checked={formik.values.addPrism}
                        onChange={formik.handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-[#015490] focus:ring-[#015490]"
                      />
                      <span className="text-sm text-[#1F1F1F] font-medium">
                        Add Prism
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-center mt-6 mb-6">
                    <button
                      type="submit"
                      className="bg-[#014D40] text-white px-16 py-4 rounded-full font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#013d33] transition-all shadow-lg hover:shadow-xl active:scale-95 min-w-[240px] hidden md:block"
                    >
                      NEXT
                    </button>
                  </div>

                  <GetMyFitPopup
                    open={isGetMyFitOpen}
                    onClose={() => {
                      setIsGetMyFitOpen(false);

                      // Check if measurements were captured
                      if (capturedData?.measurements) {
                        const measurements = capturedData.measurements;
                        // Populate PD values from captured measurements
                        if (measurements.pd_right && measurements.pd_left) {
                          formik.setFieldValue("pdRight", measurements.pd_right.toFixed(2));
                          formik.setFieldValue("pdLeft", measurements.pd_left.toFixed(2));
                          formik.setFieldValue("pdPreference", "know");
                        }
                        // Keep preference as "generate" since measurement was completed
                      } else {
                        // If user closes modal without completing and had selected "generate", reset to empty
                        if (
                          formik.values.pdPreference === "generate" &&
                          !formik.values.pdRight &&
                          !formik.values.pdLeft
                        ) {
                          formik.setFieldValue("pdPreference", "");
                        }
                      }
                    }}
                  />
                </Form>
              )
            }}
          </Formik>
        </div>

        <div className="md:hidden flex flex-col justify-center items-center text-red-600 mt-12 mb-8 space-y-2 text-sm font-medium">
          <p>Don't know your Pupillary Distance (PD)?</p>
          <button onClick={() => openHelp("Pupillary Distance")} className="underline">Find your PD</button>
        </div>
      </div>

      {/* Sticky Bottom Action Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F3F0E7] border-t border-black/10 z-50 p-4">
        <div className="max-w-4xl mx-auto flex justify-center">
          <button
            type="submit"
            form="manual-prescription-form"
            className="bg-[#014D40] text-white w-full py-4 rounded-full font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#013d33] transition-all shadow-lg active:scale-95"
          >
            SAVE
          </button>
        </div>
      </div>

      <PrescriptionHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        initialTab={helpModalTab}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ManualPrescription;