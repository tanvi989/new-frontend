import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CheckoutStepper from "../components/CheckoutStepper";
import { saveMyPrescription, uploadPrescriptionImage } from "../api/retailerApis";
import { getProductFlow } from "../utils/productFlowStorage";
import { compressImage } from "../utils/imageUtils";
import GetMyFitPopup from "../components/getMyFitPopup/GetMyFitPopup";
import { useCaptureData } from "../contexts/CaptureContext";
import PrescriptionHelpModal from "../components/PrescriptionHelpModal";

import { X, CheckCircle, Loader2 } from "lucide-react";

const AddPrescription: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { state: locationState } = useLocation();
    const flow = id ? getProductFlow(id) : null;
    const state = {
        ...flow,
        product: locationState?.product ?? flow?.product,
        ...locationState,
    };
    const navigate = useNavigate();

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false); // New loading state

    // PD State
    const [pdPreference, setPdPreference] = useState<string>(""); // "" | "know" | "generate"
    const [pdRight, setPdRight] = useState<string>("");
    const [pdLeft, setPdLeft] = useState<string>("");
    const [isGetMyFitOpen, setIsGetMyFitOpen] = useState(false);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [helpModalTab, setHelpModalTab] = useState("Pupillary Distance");

    const { capturedData } = useCaptureData();

    // Easy-to-tune presentation controls
    const cardPadding = "px-8 py-6";
    const titleTextClass = "text-sm md:text-base";
    const descTextClass = "text-xs md:text-sm";

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const openHelp = (tab: string) => {
        setHelpModalTab(tab);
        setHelpModalOpen(true);
    };

    const HelpButton = ({ onClick }: { onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
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
    );

    const pdOptions = Array.from({ length: 45 }, (_, i) => (20 + i * 0.5).toFixed(2));

    const handleSelection = (
        selectedMethod: "manual" | "upload" | "photo" | "later"
    ) => {
        if (selectedMethod === "manual") {
            navigate(`/product/${id}/manual-prescription`, { state });
        } else if (selectedMethod === "upload") {
            navigate(`/product/${id}/upload-prescription`, { state });
        } else if (selectedMethod === "photo") {
            setIsCameraOpen(true);
        } else {
            // For "later", we proceed to select lens directly
            navigate(`/product/${id}/select-lens`, {
                state: {
                    ...state,
                    prescriptionMethod: selectedMethod,
                },
            });
        }
    };

    // Camera Functions
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(
                "Unable to access camera. Please ensure you have granted permission."
            );
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL("image/png");
                setCapturedImage(imageDataUrl);
            }
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        // Ensure camera is running
        if (!stream) {
            startCamera();
        }
    };

    const confirmPhoto = async () => {
        if (capturedImage) {
            setIsUploading(true); // Start loading
            stopCamera();
            setIsCameraOpen(false);

            try {
                // Convert base64 to File object
                const base64Response = await fetch(capturedImage);
                const blob = await base64Response.blob();
                const timestamp = new Date().getTime();
                const file = new File([blob], `prescription_photo_${timestamp}.png`, { type: "image/png" });

                // Get user ID from token if logged in, otherwise use guest ID
                const token = localStorage.getItem('token');
                let userId: string | undefined;
                const guestId = localStorage.getItem('guest_id') || `guest_${Date.now()}`;

                if (token) {
                    try {
                        // Decode JWT to get user ID
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        userId = payload.user_id || payload.sub;
                        console.log("✓ Logged-in user detected:", userId);
                    } catch (e) {
                        console.warn("Failed to decode token, treating as guest");
                    }
                }

                if (!userId && !localStorage.getItem('guest_id')) {
                    localStorage.setItem('guest_id', guestId);
                }

                // Step 0: Compress image
                console.log("🗜️ Compressing captured photo...");
                const compressedFile = await compressImage(file, 0.6, 1600);
                console.log(`✅ Compression complete: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

                // Step 1: Upload image to GCS
                console.log("📤 Uploading compressed photo to GCS...");
                const uploadResponse = await uploadPrescriptionImage(
                    compressedFile,
                    userId,
                    userId ? undefined : guestId
                );

                let imageUrl: string | undefined;
                if (uploadResponse.data && uploadResponse.data.success) {
                    imageUrl = uploadResponse.data.url;
                    setUploadedImageUrl(imageUrl);
                    console.log("✓ Photo uploaded to GCS:", imageUrl);
                } else {
                    throw new Error("Failed to upload photo to GCS");
                }

                // Step 2: Save prescription with GCS URL
                console.log("💾 Saving prescription with GCS URL...");
                await saveMyPrescription(
                    "photo",
                    {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        uploadedAt: new Date().toISOString()
                    },
                    "Captured Prescription",
                    imageUrl,  // GCS CDN URL
                    userId ? undefined : guestId
                );

                console.log("✓ Prescription saved successfully");
                
                // Show preview with success message immediately
                setIsUploading(false);
                setShowPreview(true);

            } catch (error) {
                console.error("Failed to save prescription:", error);
                alert("Failed to save prescription. Please try again.");
                setIsUploading(false); // Stop loading on error
                return;
            } finally {
                setIsUploading(false); // Stop loading after completion
            }
        }
    };

    const proceedToNextStep = () => {
        if (pdPreference === "know" && (!pdRight || !pdLeft)) {
            alert("Please select both Right and Left PD values");
            return;
        }

        navigate(`/product/${id}/select-lens`, {
            state: {
                ...state,
                prescriptionMethod: "photo",
                prescriptionImage: capturedImage,
                prescriptionImageUrl: uploadedImageUrl,
                pdRight,
                pdLeft,
                pdPreference,
            },
        });
    };

    const closeCameraModal = () => {
        stopCamera();
        setIsCameraOpen(false);
        setCapturedImage(null);
        setError(null);
    };

    // Effect to start camera when modal opens
    useEffect(() => {
        if (isCameraOpen && !capturedImage) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [isCameraOpen, capturedImage]);

    // Add CSS animation for spin
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#F3F0E7] font-sans py-8 px-4 md:px-8 relative">
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
            <div className="md:hidden flex justify-between items-center py-2 px-4 bg-white -mx-4 -mt-8 mb-4">
                <h1 className="text-xl font-bold text-[#1F1F1F]">LEON</h1>
                <button onClick={() => navigate(-1)}>
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="max-w-[1000px] mx-auto mt-4 md:mt-6">
                {/* Desktop Title */}
                <div className="hidden md:block text-center mb-6">
                    <p className="text-xl md:text-2xl font-medium text-[#1F1F1F] uppercase tracking-[0.1em]">
                        ADD YOUR POWER
                    </p>
                </div>

                {/* Mobile Banner */}
                <div className="md:hidden text-center mb-6">
                    <p className="text-lg font-bold text-white bg-[#1F1F1F] py-3 uppercase tracking-wider">
                        ENTER PRESCRIPTION
                    </p>
                </div>

                {/* Mobile Sample Prescription Table */}
                <div className="md:hidden mx-auto mt-4 px-4">
                    <div className="mb-8 bg-[#F3F0E7] p-2">
                        <h3 className="text-center text-[#1F1F1F] text-lg mb-4 font-medium">Your prescription looks like</h3>
                        <div className="border border-[#D2CbbE] bg-[#F3F0E7] overflow-x-auto">
                            <table cellSpacing="0" cellPadding="0" className="w-full">
                                <thead>
                                    <tr>
                                        <th className="py-1.5 px-1 text-center font-bold text-[#1F1F1F] text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]"></th>
                                        <th className="py-1.5 px-1 text-center font-bold text-[#1F1F1F] text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]">SPH</th>
                                        <th className="py-1.5 px-1 text-center font-bold text-[#1F1F1F] text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]">CYL</th>
                                        <th className="py-1.5 px-1 text-center font-bold text-[#1F1F1F] text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]">Axis</th>
                                        <th className="py-1.5 px-1 text-center font-bold text-[#1F1F1F] text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]">ADD</th>
                                        <th className="py-1.5 px-1 text-center font-bold text-[#1F1F1F] text-xs border-b border-[#D2CbbE]">PD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="th py-1.5 px-1 text-center font-bold text-[#1F1F1F] text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]">OD</td>
                                        <td className="py-1.5 px-1 text-center text-gray-700 text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]">-4.00</td>
                                        <td className="py-1.5 px-1 text-center text-gray-700 text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]">-2.75</td>
                                        <td className="py-1.5 px-1 text-center text-gray-700 text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]">001</td>
                                        <td className="py-1.5 px-1 text-center text-gray-700 text-xs border-r border-[#D2CbbE] border-b border-[#D2CbbE]">0.00</td>
                                        <td className="py-1.5 px-1 text-center text-gray-700 text-xs align-middle" rowSpan={2}>66</td>
                                    </tr>
                                    <tr>
                                        <td className="th py-1.5 px-1 text-center font-bold text-[#1F1F1F] text-xs border-r border-[#D2CbbE]">OS</td>
                                        <td className="py-1.5 px-1 text-center text-gray-700 text-xs border-r border-[#D2CbbE]">-4.25</td>
                                        <td className="py-1.5 px-1 text-center text-gray-700 text-xs border-r border-[#D2CbbE]">-2.75</td>
                                        <td className="py-1.5 px-1 text-center text-gray-700 text-xs border-r border-[#D2CbbE]">009</td>
                                        <td className="py-1.5 px-1 text-center text-gray-700 text-xs border-r border-[#D2CbbE]">0.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-center">PD: 66mm (total distance between pupils)</p>
                    </div>
                </div>
                
                {/* Main Card Grid / Buttons Container */}
                <div className="max-w-[900px] mx-auto mt-8">
                    {/* Desktop Card Grid */}
                    <div className="hidden md:grid grid-cols-2 gap-6">
                        {/* Enter Prescription Manually */}
                        <button
                            onClick={() => handleSelection("manual")}
                            className={`bg-[#F3F0E7] border border-gray-500 rounded-[24px] ${cardPadding} transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px] group w-full`}
                        >
                            <div className="w-12 h-12 bg-[#184545] rounded-lg flex items-center justify-center mb-4 text-white">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </div>
                            <h3 className={`${titleTextClass} font-bold text-[#1F1F1F] mb-2`}>
                                Enter Manually
                            </h3>
                            <p className={`${descTextClass} text-gray-600 max-w-[400px]`}>
                                Key in your prescription details manually.
                            </p>
                        </button>

                        {/* Upload Prescription */}
                        <button
                            onClick={() => handleSelection("upload")}
                            className={`bg-[#F3F0E7] border border-gray-500 rounded-[24px] ${cardPadding} transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px] group w-full`}
                        >
                            <div className="w-12 h-12 bg-[#184545] rounded-lg flex items-center justify-center mb-4 text-white">
                                <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.5413 7.90885C10.5413 8.28793 10.4289 8.6585 10.2183 8.9737C10.0077 9.28889 9.70838 9.53456 9.35815 9.67962C9.00793 9.82469 8.62255 9.86265 8.25075 9.78869C7.87896 9.71474 7.53744 9.53219 7.26939 9.26414C7.00134 8.99609 6.81879 8.65457 6.74484 8.28278C6.67088 7.91098 6.70884 7.5256 6.85391 7.17538C6.99897 6.82515 7.24464 6.52581 7.55983 6.3152C7.87503 6.1046 8.24559 5.99219 8.62468 5.99219C9.13301 5.99219 9.62052 6.19412 9.97996 6.55357C10.3394 6.91301 10.5413 7.40052 10.5413 7.90885Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M12.4587 2.1582H8.62533C3.83366 2.1582 1.91699 4.07487 1.91699 8.86654V14.6165C1.91699 19.4082 3.83366 21.3249 8.62533 21.3249H14.3753C19.167 21.3249 21.0837 19.4082 21.0837 14.6165V9.82487" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M17.25 7.9082V2.1582L19.1667 4.07487" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M17.2497 2.1582L15.333 4.07487" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M2.55859 18.4021L7.28318 15.2301C7.66524 14.983 8.11558 14.863 8.56992 14.8871C9.02427 14.9111 9.45939 15.0781 9.81318 15.3642L10.1294 15.6421C10.5109 15.9537 10.9882 16.1238 11.4807 16.1238C11.9732 16.1238 12.4505 15.9537 12.8319 15.6421L16.8186 12.218C17.2 11.9065 17.6774 11.7363 18.1698 11.7363C18.6623 11.7363 19.1397 11.9065 19.5211 12.218L21.0832 13.5597" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </div>
                            <h3 className={`${titleTextClass} font-bold text-[#1F1F1F] mb-2`}>
                                Upload Prescription
                            </h3>
                            <p className={`${descTextClass} text-gray-600 max-w-[400px]`}>
                                Upload an Image or PDF of your Prescription for Quick Processing.
                            </p>
                        </button>

                        {/* Take Photo */}
                        <button
                            onClick={() => handleSelection("photo")}
                            className={`bg-[#F3F0E7] border border-gray-500 rounded-[24px] ${cardPadding} transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px] group w-full`}
                        >
                            <div className="w-12 h-12 bg-[#184545] rounded-lg flex items-center justify-center mb-4 text-white">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </div>
                            <h3 className={`${titleTextClass} font-bold text-[#1F1F1F] mb-2`}>
                                Take Photo
                            </h3>
                            <p className={`${descTextClass} text-gray-600 max-w-[400px]`}>
                                Take photo of your eye power prescription.
                            </p>
                        </button>

                        {/* Share Later */}
                        <div className="relative group">
                            <div
                                className={`bg-[#F3F0E7] border border-gray-500 rounded-[24px] ${cardPadding} transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer w-full group`}
                            >
                                <div
                                    className="absolute inset-0 z-0"
                                    onClick={() => handleSelection("later")}
                                />
                                <div className="relative z-10 pointer-events-none flex flex-col items-center">
                                    <div className="w-12 h-12 bg-[#184545] rounded-lg flex items-center justify-center mb-4 text-white">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <h3 className={`${titleTextClass} font-bold text-[#1F1F1F] mb-2`}>
                                        Share Later
                                    </h3>
                                    <p className={`${descTextClass} text-gray-600 max-w-[400px]`}>
                                        Share your prescription with us after placing your order.{" "}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowModal(true);
                                            }}
                                            className="underline hover:text-black cursor-pointer font-medium bg-transparent border-none p-0 inline text-inherit z-20 relative pointer-events-auto"
                                        >
                                            Know more
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="md:hidden flex flex-col gap-6 px-4">
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleSelection("upload")}
                                className="flex-1 bg-[#232320] text-white py-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span className="font-medium">Upload</span>
                            </button>
                            <button
                                onClick={() => handleSelection("photo")}
                                className="flex-1 bg-[#232320] text-white py-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                <span className="font-medium">Take Photo</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-gray-300 flex-1"></div>
                            <span className="text-gray-400 text-sm">OR</span>
                            <div className="h-px bg-gray-300 flex-1"></div>
                        </div>
                        <button
                            onClick={() => handleSelection("manual")}
                            className="w-full bg-[#232320] text-white py-4 rounded-lg font-medium"
                        >
                            Enter Prescription Manually
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-gray-300 flex-1"></div>
                            <span className="text-gray-400 text-sm">OR</span>
                            <div className="h-px bg-gray-300 flex-1"></div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => handleSelection("later")}
                                className="w-full bg-[#232320] text-white py-4 rounded-lg font-medium"
                            >
                                Share Prescription Later
                            </button>
                            <button onClick={() => setShowModal(true)} className="text-[#006D77] underline text-sm font-medium">
                                Know more
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Know More Modal */}
                {
                    showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>

                                <h3 className="text-lg font-bold text-[#1F1F1F] mb-4 pr-8">
                                    Share your prescription later
                                </h3>

                                <ul className="space-y-3 text-sm text-gray-700">
                                    <li className="flex gap-2 items-start">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-black flex-shrink-0"></span>
                                        <span>
                                            You can add your prescription within 30 days of placing your order.
                                        </span>
                                    </li>
                                    <li className="flex gap-2 items-start">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-black flex-shrink-0"></span>
                                        <span>
                                            Your chosen frame will be reserved with us for 30 days.
                                        </span>
                                    </li>
                                    <li className="flex gap-2 items-start">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-black flex-shrink-0"></span>
                                        <span>
                                            You get 100% money back guarantee in-case you do not proceed with sharing your prescription within the said time frame.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )
                }

                {/* Camera Modal */}
                {isCameraOpen && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-[#1F1F1F]">Take Photo</h3>
                                <button
                                    onClick={closeCameraModal}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-black relative flex items-center justify-center min-h-[400px]">
                                {error ? (
                                    <div className="text-white text-center p-8">
                                        <p className="mb-4 text-red-400">{error}</p>
                                        <button
                                            onClick={startCamera}
                                            className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : capturedImage ? (
                                    <img
                                        src={capturedImage}
                                        alt="Captured prescription"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}
                                <canvas ref={canvasRef} className="hidden" />
                            </div>

                            {/* Footer / Controls */}
                            <div className="p-6 border-t border-gray-100 bg-white flex justify-center gap-4">
                                {capturedImage ? (
                                    <>
                                        <button
                                            onClick={retakePhoto}
                                            className="px-8 py-3 border border-gray-300 rounded-full font-bold text-[#1F1F1F] hover:bg-gray-50 transition-colors"
                                        >
                                            Retake
                                        </button>
                                        <button
                                            onClick={confirmPhoto}
                                            className="px-8 py-3 bg-[#1F1F1F] text-white rounded-full font-bold hover:bg-black transition-colors flex items-center gap-2"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                "Use Photo"
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={capturePhoto}
                                        className="w-16 h-16 rounded-full border-4 border-[#1F1F1F] p-1 flex items-center justify-center hover:scale-105 transition-transform"
                                    >
                                        <div className="w-full h-full bg-[#1F1F1F] rounded-full"></div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Loading Modal */}
                {isUploading && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
                            <Loader2 className="w-12 h-12 text-[#1F1F1F] animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">Uploading Photo</h3>
                            <p className="text-gray-600 text-center">Please wait while we upload your prescription photo...</p>
                        </div>
                    </div>
                )}

                {/* Preview Modal */}
                {showPreview && capturedImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h3 className="text-xl font-bold text-[#1F1F1F] mb-4 text-center">
                                Photo Uploaded Successfully!
                            </h3>

                            <div className="mb-6 bg-gray-100 rounded-lg p-4 flex justify-center items-center overflow-hidden">
                                <img
                                    src={capturedImage}
                                    alt="Prescription preview"
                                    className="max-w-full max-h-48 object-contain"
                                />
                            </div>

                            {/* PD Section */}
                            <div className="mb-6 border-t border-gray-100 pt-6">
                                <div className="flex items-center mb-4">
                                    <h3 className="text-[#1F1F1F] font-bold text-base">
                                        Pupillary Distance (PD)
                                    </h3>
                                    <HelpButton
                                        onClick={() => openHelp("Pupillary Distance")}
                                    />
                                </div>

                                <div className="flex flex-col gap-4 mb-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="pdPreference"
                                            value="know"
                                            checked={pdPreference === 'know'}
                                            onChange={() => setPdPreference("know")}
                                            className="w-4 h-4 text-[#014D40] focus:ring-[#014D40] border-gray-300"
                                        />
                                        <span className="text-sm font-medium text-[#1F1F1F]">I know my PD value</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="pdPreference"
                                            value="generate"
                                            checked={pdPreference === 'generate'}
                                            onChange={() => {
                                                setPdPreference("generate");
                                                setIsGetMyFitOpen(true);
                                            }}
                                            className="w-4 h-4 text-[#014D40] focus:ring-[#014D40] border-gray-300"
                                        />
                                        <span className="text-sm font-medium text-[#1F1F1F]">Generate new PD value</span>
                                    </label>
                                </div>

                                {pdPreference === "know" && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wide">
                                                    Right Eye
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={pdRight}
                                                        onChange={(e) => setPdRight(e.target.value)}
                                                        className="w-full bg-[#F3F0E7] border border-gray-200 rounded-lg px-4 py-3 pr-8 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select PD</option>
                                                        {pdOptions.map((val) => (
                                                            <option key={val} value={val}>
                                                                {val}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wide">
                                                    Left Eye
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={pdLeft}
                                                        onChange={(e) => setPdLeft(e.target.value)}
                                                        className="w-full bg-[#F3F0E7] border border-gray-200 rounded-lg px-4 py-3 pr-8 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select PD</option>
                                                        {pdOptions.map((val) => (
                                                            <option key={val} value={val}>
                                                                {val}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={proceedToNextStep}
                                    className="w-full py-4 bg-[#1F1F1F] text-white rounded-full font-bold hover:bg-black transition-colors uppercase tracking-widest text-sm"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <GetMyFitPopup
                    open={isGetMyFitOpen}
                    onClose={() => {
                        setIsGetMyFitOpen(false);
                        if (capturedData?.measurements) {
                            const measurements = capturedData.measurements;
                            if (measurements.pd_right && measurements.pd_left) {
                                setPdRight(measurements.pd_right.toFixed(2));
                                setPdLeft(measurements.pd_left.toFixed(2));
                                setPdPreference("know");
                            }
                        } else {
                            if (pdPreference === "generate" && !pdRight && !pdLeft) {
                                setPdPreference("");
                            }
                        }
                    }}
                />

                <PrescriptionHelpModal
                    open={helpModalOpen}
                    onClose={() => setHelpModalOpen(false)}
                    initialTab={helpModalTab}
                />
            </div>
        </div>
    );
};

export default AddPrescription;