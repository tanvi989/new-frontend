import React, { useState, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import CheckoutStepper from "../components/CheckoutStepper";
import { saveMyPrescription, uploadPrescriptionImage, addPrescription } from "../api/retailerApis";
import PrescriptionHelpModal from "../components/PrescriptionHelpModal";
import { getProductFlow } from "../utils/productFlowStorage";
import { compressImage } from "../utils/imageUtils";

const UploadPrescription: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { state: locationState } = useLocation();
    const flow = id ? getProductFlow(id) : null;
    const state = { ...flow, product: locationState?.product ?? flow?.product, ...locationState };
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);

    // PD (Pupillary Distance) state
    const [pdSingle, setPdSingle] = useState<string>("");
    const [pdRight, setPdRight] = useState<string>("");
    const [pdLeft, setPdLeft] = useState<string>("");
    const [hasDualPD, setHasDualPD] = useState<boolean>(false);
    const [helpModalOpen, setHelpModalOpen] = useState(false);

    const handleFileSelect = (file: File) => {
        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "application/pdf"];
        if (!validTypes.includes(file.type)) {
            alert("Please upload a valid image (JPEG, PNG, GIF) or PDF file");
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            alert("File size must be less than 10MB");
            return;
        }
        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null); // PDF files won't have preview
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };



    const [searchParams] = useSearchParams();
    const cartItemId = searchParams.get("cart_id");

    const handleSaveAndContinue = async () => {
        if (!selectedFile) {
            fileInputRef.current?.click();
            return;
        }

        // Validate PD
        if (!hasDualPD && !pdSingle) {
            alert("Please enter your Pupillary Distance (PD)");
            return;
        }
        if (hasDualPD && (!pdRight || !pdLeft)) {
            alert("Please enter both Right and Left PD values");
            return;
        }

        try {
            setLoading(true);

            // Check if user is logged in
            const token = localStorage.getItem('token');
            const isLoggedIn = !!token;

            // Get or create guest ID
            const guestId = localStorage.getItem('guest_id') || `guest_${Date.now()}`;
            if (!localStorage.getItem('guest_id')) {
                localStorage.setItem('guest_id', guestId);
            }

            // Step 1: Upload image to GCS
            console.log("📤 Preparing prescription image...");
            let fileToUpload = selectedFile;
            
            // Compress if it's an image
            if (selectedFile.type.startsWith("image/")) {
                try {
                    console.log("🗜️ Compressing image...");
                    fileToUpload = await compressImage(selectedFile, 0.6, 1600); // 60% quality, max 1600px width
                    console.log(`✅ Compression complete: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB -> ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
                } catch (compError) {
                    console.warn("⚠️ Compression failed, uploading original:", compError);
                }
            }

            console.log("📤 Uploading prescription image to GCS...");
            let imageUrl: string | undefined;

            try {
                const uploadResponse = await uploadPrescriptionImage(
                    fileToUpload,
                    undefined,
                    guestId
                );

                console.log("📥 Upload response:", uploadResponse);

                if (uploadResponse.data && uploadResponse.data.success) {
                    imageUrl = uploadResponse.data.url;
                    console.log("✓ Image uploaded to GCS:", imageUrl);
                } else {
                    const errorMsg = uploadResponse.data?.detail || uploadResponse.data?.message || "Failed to upload image to GCS";
                    console.error("❌ GCS upload failed:", errorMsg);
                    throw new Error(errorMsg);
                }
            } catch (uploadError: any) {
                console.error("❌ GCS upload error:", uploadError);

                // Extract error message from various possible error formats
                let errorMessage = "Failed to upload prescription image. Please try again.";

                if (uploadError.response?.data?.detail) {
                    // Handle both string and object detail
                    const detail = uploadError.response.data.detail;
                    errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
                } else if (uploadError.response?.data?.message) {
                    errorMessage = uploadError.response.data.message;
                } else if (uploadError.message) {
                    errorMessage = uploadError.message;
                }

                console.error("📋 Error details:", {
                    status: uploadError.response?.status,
                    statusText: uploadError.response?.statusText,
                    data: uploadError.response?.data
                });

                alert(errorMessage);
                setLoading(false);
                return;
            }

            // CRITICAL: Validate imageUrl before saving
            if (!imageUrl || imageUrl === 'undefined' || imageUrl.trim() === '') {
                console.error("❌ CRITICAL ERROR: imageUrl is invalid!", imageUrl);
                alert("Failed to upload image to cloud storage. Please try again.");
                setLoading(false);
                return;
            }

            // Step 2: Prepare prescription data
            const pdData = hasDualPD
                ? { right: pdRight, left: pdLeft }
                : { single: pdSingle };

            // Generate unique ID
            const uniqueId = `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Standardized payload structure matching ManualPrescription
            const prescriptionPayload = {
                _id: uniqueId,
                id: uniqueId, // duplicate for compatibility
                userId: localStorage.getItem('user_id'),
                guestId: localStorage.getItem('guest_id'),
                createdAt: new Date().toISOString(),
                associatedProduct: {
                    cartId: cartItemId,
                    productSku: id,
                    productName: state?.product?.name || "Product",
                    uniqueId: uniqueId
                },
                prescriptionDetails: {
                    type: "upload",
                    name: "Uploaded Prescription",
                    image_url: imageUrl,
                    pdType: hasDualPD ? "Dual" : "Single",
                    pdSingle: hasDualPD ? null : pdSingle,
                    pdRight: hasDualPD ? pdRight : null,
                    pdLeft: hasDualPD ? pdLeft : null,
                    fileName: selectedFile.name,
                    fileSize: selectedFile.size,
                    fileType: selectedFile.type
                },
                additionalInfo: "Uploaded via Prescription Upload Page"
            };

            // Step 3: Save to backend for logged-in users
            if (isLoggedIn) {
                try {
                    // LINK TO CART: Always try to link to cart if cartItemId is present
                    // This ensures the prescription shows up in the order
                    if (cartItemId) {
                        try {
                            const customerID = localStorage.getItem('customerID') || localStorage.getItem('user_id');
                            await addPrescription(
                                customerID,
                                "upload",
                                "upload",
                                prescriptionPayload.prescriptionDetails,
                                cartItemId
                            );
                            console.log("✓ Linked prescription to cart item:", cartItemId);
                        } catch (linkError) {
                            console.error("❌ Failed to link prescription to cart item:", linkError);
                            // Continue anyway as we still save to profile and localStorage
                        }
                    }

                    // If updating from cart, try to find and update existing prescription
                    if (cartItemId) {
                        // First, try to get existing prescriptions to find the one to update
                        const { getMyPrescriptions, updateMyPrescription } = await import('../api/retailerApis');
                        try {
                            const existingPrescriptions = await getMyPrescriptions();
                            const prescriptions = existingPrescriptions?.data?.data || [];
                            const existingPrescription = prescriptions.find((p: any) => {
                                const pCartId = p?.data?.associatedProduct?.cartId || p?.associatedProduct?.cartId;
                                return pCartId && String(pCartId) === String(cartItemId);
                            });
                            
                            if (existingPrescription && (existingPrescription.id || existingPrescription._id)) {
                                // For now, we'll create a new prescription and the old one can be cleaned up later
                                // The backend update API may not support full prescription updates
                                // So we create a new one which will be the latest
                                await saveMyPrescription(
                                    "upload",
                                    {
                                        ...pdData,
                                        fileName: selectedFile.name,
                                        associatedProduct: prescriptionPayload.associatedProduct
                                    },
                                    "Uploaded Prescription",
                                    imageUrl,
                                    undefined
                                );
                                console.log("✓ Created new prescription in backend (replacing old for cartId):", cartItemId);
                            } else {
                                // Create new prescription
                                await saveMyPrescription(
                                    "upload",
                                    {
                                        ...pdData,
                                        fileName: selectedFile.name,
                                        associatedProduct: prescriptionPayload.associatedProduct
                                    },
                                    "Uploaded Prescription",
                                    imageUrl,
                                    undefined
                                );
                                console.log("✓ Created new prescription in backend for cartId:", cartItemId);
                            }
                        } catch (updateError) {
                            console.warn("Could not update existing prescription, creating new one:", updateError);
                            // Fallback to creating new prescription
                            await saveMyPrescription(
                                "upload",
                                {
                                    ...pdData,
                                    fileName: selectedFile.name,
                                    associatedProduct: prescriptionPayload.associatedProduct
                                },
                                "Uploaded Prescription",
                                imageUrl,
                                undefined
                            );
                            console.log("✓ Prescription saved to backend");
                        }
                    } else {
                        // Create new prescription (product page flow)
                        await saveMyPrescription(
                            "upload",
                            {
                                ...pdData,
                                fileName: selectedFile.name,
                                associatedProduct: prescriptionPayload.associatedProduct
                            },
                            "Uploaded Prescription",
                            imageUrl,
                            undefined
                        );
                        console.log("✓ Prescription saved to backend");
                    }
                    // Invalidate prescriptions query to refresh the data
                    queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
                } catch (error) {
                    console.error("❌ Failed to save to backend:", error);
                }
            }

            // Step 4: Save to localStorage for all users
            const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
            
            if (cartItemId) {
                // Replace existing prescription for this cart item
                const existingIndex = savedPrescriptions.findIndex((p: any) => 
                    p?.associatedProduct?.cartId && String(p.associatedProduct.cartId) === String(cartItemId)
                );
                
                if (existingIndex >= 0) {
                    // Replace existing prescription
                    savedPrescriptions[existingIndex] = prescriptionPayload;
                    console.log("✓ Replaced existing prescription in localStorage for cartId:", cartItemId);
                } else {
                    // Add new prescription
                    savedPrescriptions.push(prescriptionPayload);
                    console.log("✓ Added new prescription to localStorage for cartId:", cartItemId);
                }
            } else {
                // Add new prescription (product page flow)
                savedPrescriptions.push(prescriptionPayload);
                console.log("✓ Added new prescription to localStorage");
            }
            
            localStorage.setItem('prescriptions', JSON.stringify(savedPrescriptions));

            // Step 5: Also save to session storage with product SKU for product page flow
            if (!cartItemId && id) {
                const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
                sessionPrescriptions[id] = prescriptionPayload;
                sessionStorage.setItem('productPrescriptions', JSON.stringify(sessionPrescriptions));
                console.log("✓ Prescription saved to SessionStorage with product SKU:", id);
            } else if (cartItemId && id) {
                // Also update session storage when coming from cart
                const sessionPrescriptions = JSON.parse(sessionStorage.getItem('productPrescriptions') || '{}');
                sessionPrescriptions[id] = prescriptionPayload;
                sessionStorage.setItem('productPrescriptions', JSON.stringify(sessionPrescriptions));
                console.log("✓ Updated SessionStorage with product SKU:", id);
            }

            setLoading(false);

            // HANDLE NAVIGATION based on source
            if (cartItemId) {
                // Return to cart flow
                sessionStorage.setItem("fromPrescription", "true");
                navigate("/cart");
                return;
            }

            // Original flow (during product selection)
            // Prepare PD data for checkout
            const checkoutPdData = hasDualPD
                ? {
                    pdType: "Dual",
                    pdRight: pdRight,
                    pdLeft: pdLeft,
                    totalPD: ""
                }
                : {
                    pdType: "Single",
                    pdSingle: pdSingle,
                    totalPD: pdSingle
                };

            // Navigate to next step
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
                    prescriptionMethod: "upload",
                    prescriptionFile: selectedFile,
                    prescriptionPreview: previewUrl,
                    prescriptionData: {
                        ...checkoutPdData
                    }
                },
            });

        } catch (error: any) {
            console.error("Failed to save prescription:", error);
            setLoading(false);
            alert(`Failed to save prescription: ${error.message || 'Unknown error'}`);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F0E7] font-sans relative md:py-8 md:px-8">
            {/* Desktop Stepper */}
            <div className="hidden md:block">
                <CheckoutStepper
                    currentStep={3}
                    selections={{
                        2: "Bifocal/Progressive Eyeglasses",
                    }}
                />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-medium text-[#1F1F1F]">Upload Prescription</h1>
                <button onClick={() => navigate(-1)} className="p-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div className="max-w-[800px] mx-auto mt-4 md:mt-6 px-4 md:px-0">
                {/* Desktop Title */}
                <div className="hidden md:block text-center mb-12">
                    <p className="text-xl md:text-2xl font-medium text-[#1F1F1F] uppercase tracking-[0.1em]">
                        UPLOAD PRESCRIPTION
                    </p>
                </div>

                <div className="max-w-[700px] mx-auto">
                    {/* Upload Area */}
                    <div
                        className={`transition-all duration-300 ${selectedFile
                            ? "p-12 rounded-2xl" // No border or background during preview
                            : isDragging
                                ? "p-12 border-2 border-dashed border-[#184545] bg-[#184545]/5 rounded-2xl"
                                : "p-8 md:p-12 border border-dashed border-[#B8D8E0] md:border-2 md:border-gray-300 bg-[#EBF7FA] md:bg-white rounded-[4px] md:rounded-2xl"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {selectedFile ? (

                            // File Selected Preview
                            <div className="text-center">
                                {previewUrl ? (
                                    <div className="mb-6">
                                        <img
                                            src={previewUrl}
                                            alt="Prescription preview"
                                            className="max-w-full max-h-[500px] mx-auto rounded-lg shadow-sm"
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                                            <svg
                                                width="40"
                                                height="40"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="#184545"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                <polyline points="10 9 9 9 8 9"></polyline>
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                <p className="text-base font-semibold text-[#1F1F1F] mb-2">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                                <button
                                    onClick={handleRemoveFile}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                                >
                                    Remove File
                                </button>
                            </div>
                        ) : (
                            // Upload Prompt
                            <div className="text-center">
                                {/* Mobile-only Icon */}
                                <div className="md:hidden flex justify-center mb-6">
                                    <div className="relative w-12 h-12 flex items-center justify-center border border-[#E94D37] rounded-full">
                                        <div className="absolute -top-1 -left-1 w-full h-full border border-t-[#E94D37] border-l-[#E94D37] border-transparent rounded-full opacity-40"></div>
                                        <div className="absolute -bottom-1 -right-1 w-full h-full border border-b-[#E94D37] border-r-[#E94D37] border-transparent rounded-full opacity-40"></div>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E94D37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="16 16 12 12 8 16"></polyline>
                                            <line x1="12" y1="12" x2="12" y2="21"></line>
                                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                                            <polyline points="16 16 12 12 8 16"></polyline>
                                        </svg>
                                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E94D37" strokeWidth="1">
                                                <path d="M12 2C12 2 15 5 15 8C15 11 12 14 12 14C12 14 9 11 9 8C9 5 12 2 12 2Z"></path>
                                                <circle cx="12" cy="8" r="1.5" fill="#E94D37"></circle>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop-only Icon */}
                                <div
                                    onClick={handleBrowseClick}
                                    className="hidden md:flex w-16 h-16 bg-[#E8F4F8] rounded-full items-center justify-center mx-auto mb-6 cursor-pointer hover:bg-[#D1E8F0] transition-colors"
                                >
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#009FE3"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </div>

                                <p className="text-base text-[#1F1F1F] mb-2 px-2">
                                    <span className="font-semibold block md:inline text-[#6B7280] md:text-[#1F1F1F]">Drag and Drop File or</span>{" "}
                                    <button
                                        onClick={handleBrowseClick}
                                        className="text-[#E94D37] md:text-[#009FE3] font-semibold underline hover:opacity-80 transition-colors"
                                    >
                                        Browse
                                    </button>
                                </p>

                                <div className="text-center px-4">
                                    <p className="text-xs md:text-sm text-gray-500 md:text-gray-600 mb-1">
                                        Supported formates: JPEG, PNG & PDF.
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-500 md:text-gray-600">
                                        File Upload: Max 10MB for images and PDFs.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />

                    {/* PD Section - Only show when file is selected */}
                    {selectedFile && (
                        <div className="mt-8">
                            <div className="flex items-center mb-4">
                                <h3 className="text-[#1F1F1F] font-bold text-base">
                                    Pupillary Distance (PD)
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setHelpModalOpen(true)}
                                    className="ml-2 w-5 h-5 rounded-full bg-[#E94D37] flex items-center justify-center hover:bg-[#bf3e2b] transition-colors"
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="6" cy="6" r="4"></circle>
                                        <line x1="6" y1="8" x2="6" y2="8" strokeLinecap="round"></line>
                                        <path d="M6 5.5a1 1 0 0 0 1-1 1.5 1.5 0 0 0-3 0 1 1 0 0 0 1 1z"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="w-full max-w-[320px] mb-4">
                                {!hasDualPD ? (
                                    <div className="relative">
                                        <select
                                            value={pdSingle}
                                            onChange={(e) => setPdSingle(e.target.value)}
                                            className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 pr-8 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="">Select PD</option>
                                            {Array.from({ length: 45 }, (_, i) => 40 + i).map((val) => (
                                                <option key={val} value={val}>
                                                    {val}
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
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">
                                                Right Eye
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={pdRight}
                                                    onChange={(e) => setPdRight(e.target.value)}
                                                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 pr-8 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors appearance-none cursor-pointer"
                                                >
                                                    <option value="">Right</option>
                                                    {Array.from({ length: 45 }, (_, i) => 20 + i * 0.5).map((val) => (
                                                        <option key={val} value={val.toFixed(1)}>
                                                            {val.toFixed(1)}
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
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">
                                                Left Eye
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={pdLeft}
                                                    onChange={(e) => setPdLeft(e.target.value)}
                                                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 pr-8 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors appearance-none cursor-pointer"
                                                >
                                                    <option value="">Left</option>
                                                    {Array.from({ length: 45 }, (_, i) => 20 + i * 0.5).map((val) => (
                                                        <option key={val} value={val.toFixed(1)}>
                                                            {val.toFixed(1)}
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
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 select-none">
                                    <input
                                        type="checkbox"
                                        checked={hasDualPD}
                                        onChange={(e) => {
                                            setHasDualPD(e.target.checked);
                                            if (!e.target.checked) {
                                                setPdRight("");
                                                setPdLeft("");
                                            } else {
                                                setPdSingle("");
                                            }
                                        }}
                                        className="w-5 h-5 rounded border-gray-300 text-[#015490] focus:ring-[#015490] cursor-pointer"
                                    />
                                    <span className="text-sm text-[#1F1F1F] font-medium">
                                        I have 2 PD numbers
                                    </span>
                                </label>
                            </div>

                            {/* Save and Continue Button */}
                            <div className="hidden md:flex justify-center mb-32 md:mb-0">
                                <button
                                    onClick={handleSaveAndContinue}
                                    disabled={loading}
                                    className="bg-[#014D40] text-white px-16 py-4 rounded-full font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#013d33] transition-all shadow-lg hover:shadow-xl active:scale-95 min-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "UPLOADING..." : "SAVE AND CONTINUE"}
                                </button>
                            </div>

                        </div>
                    )}

                    {/* Save and Continue Button - Only show when file is selected but before PD section renders */}
                    {!selectedFile && (
                        <div className="mt-8 mb-24 text-center hidden md:block">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-12 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 bg-[#184545] text-white hover:bg-[#0f2f2f] shadow-md hover:shadow-lg"
                            >
                                Save and Continue
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="md:hidden h-24"></div> {/* Bottom spacer for sticky footer */}


            {/* Mobile Footer Sticky Button */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
                <button
                    onClick={handleSaveAndContinue}
                    disabled={loading}
                    className="w-full bg-black text-white py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                >
                    {loading ? "UPLOADING..." : "SAVE AND CONTINUE"}
                </button>
            </div>

            {/* Help Modal */}
            <PrescriptionHelpModal
                open={helpModalOpen}
                onClose={() => setHelpModalOpen(false)}
                initialTab="Pupillary Distance"
            />
        </div>

    );
};

export default UploadPrescription;