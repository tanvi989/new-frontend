import React from "react";

interface PrescriptionViewerProps {
  open: boolean;
  onClose: () => void;
  prescription: any;
}

const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({
  open,
  onClose,
  prescription,
}) => {
  if (!open || !prescription) return null;

  // Determine file URL (handle various legacy structures)
  const fileUrl =
    prescription.prescription_file_url ||
    prescription.file_url ||
    prescription.file ||
    prescription.url ||
    prescription.link ||
    prescription.upload_url ||
    prescription.uploadUrl ||
    (prescription.data && prescription.data.file_url);

  const isPdf =
    typeof fileUrl === "string" &&
    fileUrl.trim().toLowerCase().endsWith(".pdf");

  // Helper to safely get values from either flat structure or nested manual schema
  const getValue = (key: string, nestedPath?: string, defaultValue: string = "0.00") => {
    // 1. Check direct key (e.g., sphOD)
    if (prescription[key] !== undefined && prescription[key] !== null) return prescription[key];

    // 2. Check nested in 'data' object (e.g. data.od.sph)
    if (nestedPath && prescription.data) {
      const parts = nestedPath.split('.');
      let current = prescription.data;
      for (const part of parts) {
        if (current === undefined || current === null) break;
        current = current[part];
      }
      if (current !== undefined && current !== null) return current;
    }

    // 3. Check directly in 'data' object (e.g., data.sphOD) for legacy backend structure
    if (prescription.data && prescription.data[key] !== undefined) return prescription.data[key];

    return defaultValue;
  };

  // Extract Values
  const sphOD = getValue("sphOD", "od.sph");
  const cylOD = getValue("cylOD", "od.cyl");
  const axisOD = getValue("axisOD", "od.axis", "-");

  const sphOS = getValue("sphOS", "os.sph");
  const cylOS = getValue("cylOS", "os.cyl");
  const axisOS = getValue("axisOS", "os.axis", "-");

  const pdType = getValue("pdType", "pdType", "Single");
  const pdOD = getValue("pdRight", "pdRight"); // Manual schema uses 'pdRight' in top level or 'od.pd'? No, schema has pdRight in root of properties
  // Wait, schema in ManualPrescription.tsx:
  // pdOD: savedValues.hasDualPD ? savedValues.pdRight : ...
  // But inside 'prescriptionDetails' object: 
  // pdRight: ..., pdLeft: ... 

  // Re-checking ManualPrescription payload:
  // prescriptionDetails: { ... pdRight: ..., pdLeft: ..., pdSingle: ... }
  // So it's data.pdRight
  const valPdRight = getValue("pdRight", "pdRight", "");
  const valPdLeft = getValue("pdLeft", "pdLeft", "");
  const valPdSingle = getValue("pdSingle", "pdSingle", "");
  const valTotalPD = getValue("totalPD", "totalPD", "");

  const addPower = getValue("addOD", "addPower", "None"); // saved as addPower in new schema, addOD in old?
  // Old ManualPrescription schema used addOD/addOS. New uses addPower valid for both?
  // ManualPrescription.tsx Line 220: addPower: savedValues.addPower

  const birthYear = getValue("birthYear", "birthYear", "");

  // Prism
  const prism = prescription.prism || (prescription.data && prescription.data.prism);

  const additionalInfo = prescription.additionalInfo || (prescription.data && prescription.data.additionalInfo);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[600px] p-6 transform transition-all scale-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-[#1F1F1F]">
            Prescription Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {fileUrl && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm font-bold text-[#1F1F1F] flex justify-between items-center">
                <span>Uploaded Prescription</span>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#E53935] font-semibold text-xs hover:underline"
                >
                  Open
                </a>
              </div>
              <div className="bg-white">
                {isPdf ? (
                  <iframe
                    src={fileUrl}
                    title="Prescription PDF"
                    className="w-full h-[360px] border-0"
                  />
                ) : (
                  <img
                    src={fileUrl}
                    alt="Prescription"
                    className="w-full max-h-[360px] object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 text-center py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div></div>
              <div>SPH</div>
              <div>CYL</div>
              <div>AXIS</div>
            </div>

            <div className="grid grid-cols-4 text-center py-3 border-b border-gray-100 items-center">
              <div className="font-bold text-[#1F1F1F] text-sm">Right (OD)</div>
              <div className="text-sm font-medium">
                {sphOD}
              </div>
              <div className="text-sm font-medium">
                {cylOD}
              </div>
              <div className="text-sm font-medium">
                {axisOD}
              </div>
            </div>

            <div className="grid grid-cols-4 text-center py-3 items-center">
              <div className="font-bold text-[#1F1F1F] text-sm">Left (OS)</div>
              <div className="text-sm font-medium">
                {sphOS}
              </div>
              <div className="text-sm font-medium">
                {cylOS}
              </div>
              <div className="text-sm font-medium">
                {axisOS}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase">
                PD Type
              </span>
              <span className="text-sm font-bold text-[#1F1F1F]">
                {pdType}
              </span>
            </div>
            {pdType === "Dual" ? (
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">
                  Values
                </span>
                <span className="text-sm font-bold text-[#1F1F1F]">
                  {valPdRight || ""} (R) / {valPdLeft || ""} (L)
                </span>
              </div>
            ) : (
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">
                  Total PD
                </span>
                <span className="text-sm font-bold text-[#1F1F1F]">
                  {valTotalPD || valPdSingle}
                </span>
              </div>
            )}
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase">
                Add Power
              </span>
              <span className="text-sm font-bold text-[#1F1F1F]">
                {addPower}
              </span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase">
                Birth Year
              </span>
              <span className="text-sm font-bold text-[#1F1F1F]">
                {birthYear}
              </span>
            </div>
          </div>

          {prism && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-[#1F1F1F] mb-2">
                Prism Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-bold">OD:</span>{" "}
                  {prism.od?.horizontal || 0}{" "}
                  {prism.od?.baseHorizontal},{" "}
                  {prism.od?.vertical || 0}{" "}
                  {prism.od?.baseVertical}
                </div>
                <div>
                  <span className="font-bold">OS:</span>{" "}
                  {prism.os?.horizontal || 0}{" "}
                  {prism.os?.baseHorizontal},{" "}
                  {prism.os?.vertical || 0}{" "}
                  {prism.os?.baseVertical}
                </div>
              </div>
            </div>
          )}

          {additionalInfo && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-xs font-bold text-yellow-700 uppercase mb-1">
                Additional Info
              </h3>
              <p className="text-sm text-yellow-900">
                {additionalInfo}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionViewer;
