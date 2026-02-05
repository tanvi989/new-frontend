
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createEyeCheckup } from "../../../api/retailerApis";
import CustomerStatusModal from "../../CustomerStatusModal";
import { validateNumber } from "../../../helpers/validateForms";

const initialState = {
  sphereOD: "0.00",
  patientName: "",
  sphereOS: "0.00",
  cylinderOD: "0.00",
  cylinderOS: "0.00",
  addOD: "0.00",
  addOS: "0.00",
  axisOD: "",
  axisOS: "",
  additionalInfo: "",
  pupillaryOD: "",
  pupillaryOS: "",
  segmentOD: "",
  segmentOS: "",
};

const EyeCheckupForm: React.FC = () => {
  const [state, setState] = useState(initialState);
  const [openStatusPopUp, setOpenStatusPopUp] = useState(false);
  const [isSame, setIsSame] = useState(false);
  const [isSelf, setIsSelf] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  useEffect(() => {
      const customerID = localStorage.getItem("customerID");
      if (!customerID) {
          console.warn("No Customer ID found in local storage");
      }
  }, []);

  const updateState = (newState: Partial<typeof initialState>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, 
    fieldName: string, 
    sameField?: string
  ) => {
    const value = e.target.value;
    let isValid = true;

    // Number validation for specific fields
    if (['segmentOD', 'segmentOS', 'pupillaryOD', 'pupillaryOS', 'axisOD', 'axisOS'].includes(fieldName)) {
      isValid = validateNumber(value);
    }

    if (isValid) {
      updateState({ [fieldName]: value });
      if (isSame && sameField) {
        updateState({ [sameField]: value });
      }
      // Clear error if exists
      if (errors[fieldName] && value) {
          setErrors(prev => ({ ...prev, [fieldName]: false }));
      }
    }
  };

  const handleSameEyeSight = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSame(checked);
    if (checked) {
      updateState({
        sphereOS: state.sphereOD,
        cylinderOS: state.cylinderOD,
        addOS: state.addOD,
        axisOS: state.axisOD,
        pupillaryOS: state.pupillaryOD,
        segmentOS: state.segmentOD,
      });
    }
  };

  const generateOptions = (min: number, max: number, step: number) => {
    const options = [];
    for (let value = min; value <= max + 0.0001; value += step) {
      options.push(value.toFixed(2));
    }
    return options;
  };

  const isFormValid = () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    if (!isSelf && !state.patientName.trim()) {
        newErrors.patientName = true;
        isValid = false;
    }

    const requiredFields = [
        'sphereOD', 'sphereOS', 
        'pupillaryOD', 'pupillaryOS', 
        'segmentOD', 'segmentOS'
    ];

    requiredFields.forEach(field => {
        if (!state[field as keyof typeof initialState]) {
            newErrors[field] = true;
            isValid = false;
        }
    });

    if (parseFloat(state.cylinderOD) !== 0 && !state.axisOD) {
        newErrors.axisOD = true;
        isValid = false;
    }

    if (parseFloat(state.cylinderOS) !== 0 && !state.axisOS) {
        newErrors.axisOS = true;
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleFormSubmit = () => {
    setLoading(true);

    const customer_id = localStorage.getItem("customerID");
    
    const payload = {
      customer_id,
      patient_name: isSelf ? "Self" : state.patientName,
      right_sphere: state.sphereOD,
      left_sphere: state.sphereOS,
      right_cyliner: state.cylinderOD, 
      left_cylinder: state.cylinderOS,
      right_axis: state.axisOD,
      left_axis: state.axisOS,
      right_od: state.addOD || "0",
      left_od: state.addOS || "0",
      right_pd: state.pupillaryOD,
      left_pd: state.pupillaryOS,
      right_sh: state.segmentOD,
      left_sh: state.segmentOS,
      additional_information: state.additionalInfo,
    };

    createEyeCheckup(payload).then((response) => {
      if (response?.data?.status) {
        navigate('/offers', { state: { from: 'checkup' } });
      }
      setLoading(false);
    }).catch(err => {
        console.error("Failed to create checkup", err);
        setLoading(false);
    });
  };

  const onSaveClick = () => {
      if(isFormValid()) {
          setOpenStatusPopUp(true);
      }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden font-sans">
      {/* Form Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-6 w-full sm:w-auto">
             <label className="flex items-center gap-3 cursor-pointer">
                 <div className="relative inline-block w-11 h-6 transition duration-200 ease-in-out">
                     <input 
                        type="checkbox" 
                        className="absolute opacity-0 w-0 h-0"
                        checked={isSelf}
                        onChange={() => setIsSelf(!isSelf)}
                     />
                     <span className={`block w-full h-full rounded-full shadow-inner transition-colors duration-300 ${isSelf ? 'bg-[#232320]' : 'bg-gray-300'}`}></span>
                     <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-300 ${isSelf ? 'translate-x-5' : 'translate-x-0'}`}></span>
                 </div>
                 <span className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">Test for Self?</span>
             </label>

             <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-[#232320] focus:ring-[#232320]"
                    checked={isSame}
                    onChange={handleSameEyeSight}
                 />
                 <span className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">Same as Right Eye</span>
             </label>
         </div>
         
         <div className="hidden sm:flex gap-12 mr-8">
             <span className="text-[#009FE3] font-bold uppercase tracking-wider text-sm">Right Eye (OD)</span>
             <span className="text-[#009FE3] font-bold uppercase tracking-wider text-sm">Left Eye (OS)</span>
         </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-8">
          
          {!isSelf && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                 <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide md:col-span-1">Patient Name <span className="text-red-500">*</span></label>
                 <div className="md:col-span-2">
                     <input
                        type="text"
                        placeholder="Enter patient's name"
                        value={state.patientName}
                        onChange={(e) => handleInputChange(e, "patientName")}
                        className={`w-full bg-gray-50 border ${errors.patientName ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors`}
                     />
                     {errors.patientName && <p className="text-red-500 text-xs mt-1">This field is required</p>}
                 </div>
             </div>
          )}

          {/* Sphere */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide md:col-span-1">Sphere <span className="text-red-500">*</span></label>
              <div className="md:col-span-1 relative">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Right Eye (OD)</span>
                  <select
                    value={state.sphereOD}
                    onChange={(e) => handleInputChange(e, "sphereOD", "sphereOS")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] appearance-none"
                  >
                      <option value="">Select Power</option>
                      {generateOptions(-10.0, 10.0, 0.25).map(opt => (
                          <option key={`od-sphere-${opt}`} value={opt}>{opt}</option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 top-6 md:top-0">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
              <div className="md:col-span-1 relative">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Left Eye (OS)</span>
                  <select
                    value={state.sphereOS}
                    onChange={(e) => handleInputChange(e, "sphereOS", "sphereOD")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] appearance-none"
                    disabled={isSame}
                  >
                      <option value="">Select Power</option>
                      {generateOptions(-10.0, 10.0, 0.25).map(opt => (
                          <option key={`os-sphere-${opt}`} value={opt}>{opt}</option>
                      ))}
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 top-6 md:top-0">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
          </div>

          {/* Cylinder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide md:col-span-1">Cylinder</label>
              <div className="md:col-span-1 relative">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Right Eye (OD)</span>
                  <select
                    value={state.cylinderOD}
                    onChange={(e) => handleInputChange(e, "cylinderOD", "cylinderOS")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] appearance-none"
                  >
                      <option value="">Select Power</option>
                      {generateOptions(-6.0, 6.0, 0.25).map(opt => (
                          <option key={`od-cyl-${opt}`} value={opt}>{opt}</option>
                      ))}
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 top-6 md:top-0">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
              <div className="md:col-span-1 relative">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Left Eye (OS)</span>
                  <select
                    value={state.cylinderOS}
                    onChange={(e) => handleInputChange(e, "cylinderOS", "cylinderOD")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] appearance-none"
                    disabled={isSame}
                  >
                      <option value="">Select Power</option>
                      {generateOptions(-6.0, 6.0, 0.25).map(opt => (
                          <option key={`os-cyl-${opt}`} value={opt}>{opt}</option>
                      ))}
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 top-6 md:top-0">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
          </div>

          {/* Axis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide md:col-span-1">Axis</label>
              <div className="md:col-span-1">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Right Eye (OD)</span>
                  <input
                    type="number"
                    placeholder="0-360"
                    min="0"
                    max="360"
                    value={state.axisOD}
                    onChange={(e) => handleInputChange(e, "axisOD", "axisOS")}
                    className={`w-full bg-gray-50 border ${errors.axisOD ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors`}
                  />
                  {errors.axisOD && <p className="text-red-500 text-xs mt-1">Required when Cylinder is non-zero</p>}
              </div>
              <div className="md:col-span-1">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Left Eye (OS)</span>
                  <input
                    type="number"
                    placeholder="0-360"
                    min="0"
                    max="360"
                    value={state.axisOS}
                    onChange={(e) => handleInputChange(e, "axisOS", "axisOD")}
                    disabled={isSame}
                    className={`w-full bg-gray-50 border ${errors.axisOS ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors`}
                  />
                   {errors.axisOS && <p className="text-red-500 text-xs mt-1">Required when Cylinder is non-zero</p>}
              </div>
          </div>

          {/* Add */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide md:col-span-1">Add</label>
              <div className="md:col-span-1 relative">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Right Eye (OD)</span>
                  <select
                    value={state.addOD}
                    onChange={(e) => handleInputChange(e, "addOD", "addOS")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] appearance-none"
                  >
                      <option value="">Select Power</option>
                      {generateOptions(0.0, 5.0, 0.25).map(opt => (
                          <option key={`od-add-${opt}`} value={opt}>{opt}</option>
                      ))}
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 top-6 md:top-0">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
              <div className="md:col-span-1 relative">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Left Eye (OS)</span>
                  <select
                    value={state.addOS}
                    onChange={(e) => handleInputChange(e, "addOS", "addOD")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] appearance-none"
                    disabled={isSame}
                  >
                      <option value="">Select Power</option>
                      {generateOptions(0.0, 5.0, 0.25).map(opt => (
                          <option key={`os-add-${opt}`} value={opt}>{opt}</option>
                      ))}
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 top-6 md:top-0">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
          </div>

          {/* PD (Pupillary Distance) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide md:col-span-1">PD (Pupillary Distance) <span className="text-red-500">*</span></label>
              <div className="md:col-span-1">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Right Eye (OD)</span>
                  <input
                    type="number"
                    placeholder="mm"
                    value={state.pupillaryOD}
                    onChange={(e) => handleInputChange(e, "pupillaryOD", "pupillaryOS")}
                    className={`w-full bg-gray-50 border ${errors.pupillaryOD ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors`}
                  />
              </div>
              <div className="md:col-span-1">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Left Eye (OS)</span>
                  <input
                    type="number"
                    placeholder="mm"
                    value={state.pupillaryOS}
                    onChange={(e) => handleInputChange(e, "pupillaryOS", "pupillaryOD")}
                    disabled={isSame}
                    className={`w-full bg-gray-50 border ${errors.pupillaryOS ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors`}
                  />
              </div>
          </div>

          {/* Segment Height */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide md:col-span-1">Segment Height (mm) <span className="text-red-500">*</span></label>
              <div className="md:col-span-1">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Right Eye (OD)</span>
                  <input
                    type="number"
                    placeholder="mm"
                    value={state.segmentOD}
                    onChange={(e) => handleInputChange(e, "segmentOD", "segmentOS")}
                    className={`w-full bg-gray-50 border ${errors.segmentOD ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors`}
                  />
              </div>
              <div className="md:col-span-1">
                  <span className="md:hidden text-xs text-[#009FE3] font-bold mb-1 block">Left Eye (OS)</span>
                  <input
                    type="number"
                    placeholder="mm"
                    value={state.segmentOS}
                    onChange={(e) => handleInputChange(e, "segmentOS", "segmentOD")}
                    disabled={isSame}
                    className={`w-full bg-gray-50 border ${errors.segmentOS ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors`}
                  />
              </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
               <label className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide md:col-span-1 pt-3">Additional Info</label>
               <div className="md:col-span-2">
                   <textarea
                     rows={4}
                     value={state.additionalInfo}
                     onChange={(e) => handleInputChange(e, "additionalInfo")}
                     className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] transition-colors resize-none"
                     placeholder="Any other details..."
                   ></textarea>
               </div>
          </div>

          <div className="flex justify-center pt-6">
             <button 
                onClick={onSaveClick}
                className="bg-[#232320] text-white px-16 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl transform active:scale-95 min-w-[240px]"
             >
                 Save
             </button>
          </div>
      </div>

      <CustomerStatusModal
        open={openStatusPopUp}
        onClose={() => setOpenStatusPopUp(false)}
        handleFormSubmit={handleFormSubmit}
        loading={loading}
      />
    </div>
  );
};

export default EyeCheckupForm;
