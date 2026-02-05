import React, { useEffect, useState } from "react";
import AccountSidebar from "../components/AccountSidebar";
import PrescriptionViewer from "../components/PrescriptionViewer";
// import DeleteDialog from "../components/DeleteDialog"; // Commented out as file existance isn't 100% verified yet? No, I viewed it.
import DeleteDialog from "../components/DeleteDialog";
import { getMyPrescriptions, deletePrescription } from "../api/retailerApis";


const MyPrescription: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        let allPrescriptions: any[] = [];

        // Get prescriptions from localStorage
        const localPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        console.log("📦 LocalStorage prescriptions:", localPrescriptions.length);

        // Try to get prescriptions from backend (for logged-in users)
        const token = localStorage.getItem('token');
        if (token) {
          try {
            console.log("🔑 User is logged in, fetching from backend...");
            const response = await getMyPrescriptions();
            console.log("📡 Backend API response:", response.data);

            if (response.data && response.data.success) {
              const backendPrescriptions = response.data.data || [];
              console.log("✅ Backend prescriptions:", backendPrescriptions.length);

              // Use backend prescriptions as primary source for logged-in users
              // Backend prescriptions don't have 'id' field, they use 'created_at' as unique identifier
              allPrescriptions = [...backendPrescriptions];

              // Add localStorage prescriptions that aren't in backend (by comparing created_at and type)
              localPrescriptions.forEach((localPres: any) => {
                const isDuplicate = allPrescriptions.some(backendPres =>
                  backendPres.created_at === localPres.created_at &&
                  backendPres.type === localPres.type
                );
                if (!isDuplicate) {
                  allPrescriptions.push(localPres);
                }
              });

              console.log("📋 Total prescriptions after merge:", allPrescriptions.length);
            } else {
              console.warn("⚠️ Backend response not successful, using localStorage only");
              allPrescriptions = [...localPrescriptions];
            }
          } catch (error) {
            console.error("❌ Failed to fetch backend prescriptions:", error);
            // Continue with localStorage prescriptions only
            allPrescriptions = [...localPrescriptions];
          }
        } else {
          console.log("🔓 User not logged in, using localStorage only");
          allPrescriptions = [...localPrescriptions];
        }

        console.log("🎯 Final prescriptions to display:", allPrescriptions.length);
        setPrescriptions(allPrescriptions);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!prescriptionToDelete) return;

    try {
      // 1. Delete from Backend if ID exists
      // Check for _id or id. Backend usually returns _id.
      const idToDelete = prescriptionToDelete._id || prescriptionToDelete.id;

      // Attempt to delete from backend if we have an ID
      if (idToDelete) {
        try {
          await deletePrescription(idToDelete);
          console.log("✅ Deleted from backend");
        } catch (err) {
          console.warn("⚠️ Failed to delete from backend or item not found there", err);
          // We continue to delete locally even if backend fails (might be local-only item)
        }
      }

      // 2. Delete from LocalStorage
      // Match by created_at and type to be safe
      const storedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      const updatedLocal = storedPrescriptions.filter((p: any) =>
        !(p.created_at === prescriptionToDelete.created_at && p.type === prescriptionToDelete.type)
      );
      localStorage.setItem('prescriptions', JSON.stringify(updatedLocal));

      // 3. Update State
      setPrescriptions(prev => prev.filter(p => p !== prescriptionToDelete));

      setDeleteDialogOpen(false);
      setPrescriptionToDelete(null);

    } catch (error) {
      console.error("Error deleting prescription:", error);
      alert("Failed to delete prescription");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans pb-12">
      {/* Hero Banner */}
      <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
        <img
          src="recent banner.jpg"
          alt="Banner"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-cyan-400/20 to-purple-500/20 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-0 z-10">
          <div
            className="bg-white px-12 py-4 relative shadow-lg"
            style={{
              clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
              paddingLeft: "4rem",
              paddingRight: "4rem",
            }}
          >
            <h1 className="text-xl md:text-2xl font-bold text-[#1F1F1F] uppercase tracking-widest text-center whitespace-nowrap">
              My Prescription
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <div className="w-full lg:w-auto shadow-md rounded-lg overflow-hidden bg-white">
            <AccountSidebar activeItem="MY PRESCRIPTION" />
          </div>

          <div className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[500px] w-full">
            {loading ? (
              <div className="flex items-center justify-center w-full h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E94D37]"></div>
              </div>
            ) : prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
                {prescriptions.map((pres, idx) => {
                  // Debug logging for each prescription
                  console.log(`🖼️ Prescription ${idx + 1}:`, {
                    type: pres.type,
                    name: pres.name,
                    image_url: pres.image_url,
                    image: pres.image,
                    has_image_url: !!pres.image_url,
                    has_image: !!pres.image,
                    data: pres.data
                  });

                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-gray-300 transition-all bg-[#Fdfbf7] cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#E94D37]/10 flex items-center justify-center text-[#E94D37]">
                          <i
                            className={`fa-solid ${pres.type === "upload"
                              ? "fa-file-arrow-up"
                              : pres.type === "photo"
                                ? "fa-camera"
                                : "fa-pen-to-square"
                              }`}
                          ></i>
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {new Date(pres.created_at).toLocaleDateString()}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrescriptionToDelete(pres);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Delete Prescription"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <h3 className="font-bold text-[#1F1F1F] text-lg mb-2">
                        {pres.name || "My Prescription"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 capitalize">
                        Type: {pres.type}
                      </p>

                      {/* Display uploaded prescription image */}
                      {(pres.type === "upload" || pres.type === "photo") && (
                        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
                          {(pres.image_url || pres.image) ? (
                            <>
                              <img
                                src={pres.image_url || pres.image}
                                alt="Prescription"
                                className="w-full h-48 object-contain p-2"
                                onError={(e) => {
                                  console.error(`❌ Failed to load image for prescription ${idx + 1}:`, pres.image_url || pres.image);
                                  e.currentTarget.style.display = 'none';
                                  const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (errorDiv) errorDiv.style.display = 'flex';
                                }}
                                onLoad={() => {
                                  console.log(`✅ Successfully loaded image for prescription ${idx + 1}`);
                                }}
                              />
                              <div
                                className="hidden w-full h-48 items-center justify-center bg-gray-100 text-gray-500 text-sm p-4 text-center"
                                style={{ display: 'none' }}
                              >
                                <div>
                                  <p className="font-bold mb-2">Image failed to load</p>
                                  <p className="text-xs break-all">{pres.image_url || pres.image}</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-48 flex items-center justify-center bg-yellow-50 text-yellow-800 text-sm p-4 text-center">
                              <div>
                                <p className="font-bold mb-2">⚠️ No Image URL Found</p>
                                <p className="text-xs">image_url: {String(pres.image_url || 'undefined')}</p>
                                <p className="text-xs">image: {String(pres.image || 'undefined')}</p>
                                <p className="text-xs mt-2">Full data: {JSON.stringify(pres).substring(0, 100)}...</p>
                              </div>
                            </div>
                          )}
                          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                              {(pres.data?.fileName || pres.file_name) && <><strong>File:</strong> {pres.data?.fileName || pres.file_name}<br /></>}
                              {(pres.data?.fileSize || pres.file_size) && <><strong>Size:</strong> {((pres.data?.fileSize || pres.file_size) / 1024).toFixed(2)} KB<br /></>}
                              {(pres.image_url || pres.image) && <><strong>URL:</strong> <span className="text-xs break-all">{(pres.image_url || pres.image).substring(0, 50)}...</span></>}
                            </p>
                          </div>
                        </div>
                      )}

                      {pres.type === "manual" && (
                        <div className="text-xs text-gray-500 space-y-1 bg-white p-3 rounded border border-gray-100">
                          <p>
                            <strong>Right:</strong> SPH:{" "}
                            {pres.data?.od?.sph || pres.data?.rightEye?.sph || "0.00"}
                          </p>
                          <p>
                            <strong>Left:</strong> SPH: {pres.data?.os?.sph || pres.data?.leftEye?.sph || "0.00"}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrescription(pres);
                          setViewerOpen(true);
                        }}
                        className="mt-4 w-full bg-[#232320] text-white py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors"
                      >
                        View Details
                      </button>

                      {/* Display PD for uploaded and photo prescriptions */}
                      {(pres.type === "upload" || pres.type === "photo") && pres.data?.pd && (
                        <div className="text-xs text-gray-500 space-y-1 bg-white p-3 rounded border border-gray-100">
                          {pres.data.pd.single && (
                            <p><strong>PD:</strong> {pres.data.pd.single}</p>
                          )}
                          {pres.data.pd.right && pres.data.pd.left && (
                            <>
                              <p><strong>PD Right:</strong> {pres.data.pd.right}</p>
                              <p><strong>PD Left:</strong> {pres.data.pd.left}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-64 h-64 bg-[#8CE0D3] rounded-full flex items-center justify-center mb-6 relative">
                  {/* Clipboard Icon */}
                  <div className="bg-white p-6 rounded-lg shadow-lg w-32 h-40 flex flex-col items-center border-t-8 border-[#232320] relative">
                    <div className="absolute -top-6 w-12 h-4 bg-[#F3CB0A] rounded-full border-2 border-[#232320]"></div>
                    <div className="mt-4 w-full space-y-3">
                      <div className="h-1 bg-gray-200 rounded w-full"></div>
                      <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-1 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="text-2xl font-serif font-bold mt-4 text-[#232320]">
                      Rx
                    </div>
                  </div>
                  {/* Hand/Pen (Simplified) */}
                  <div className="absolute bottom-10 right-12 transform rotate-12">
                    <div className="w-24 h-4 bg-[#232320] rounded-full"></div>
                    <div className="w-16 h-16 bg-[#FFCC80] rounded-full absolute -right-4 -top-4 -z-10"></div>
                  </div>
                </div>
                <p className="text-[#525252] text-base font-bold">
                  No Prescription Uploaded
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PrescriptionViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        prescription={selectedPrescription}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="prescription"
      />
    </div>
  );
};

export default MyPrescription;
