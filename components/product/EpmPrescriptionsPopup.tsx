
import React, { useState } from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import * as Yup from "yup";
import { addPrescription } from "../../api/retailerApis";
import SelectField from "../SelectField";
import InputField from "../InputField";
import { CartItem } from "../../types";

interface EpmPrescriptionsPopupProps {
    open: boolean;
    onClose: () => void;
    selectedCart: CartItem | null;
    refetch: () => void;
}

const EpmPrescriptionsPopup: React.FC<EpmPrescriptionsPopupProps> = ({ open, onClose, selectedCart, refetch }) => {
  const [isSame, setIsSame] = useState(false);

  const initialValues = {
    sphOD: "0.00",
    cylOD: "0.00",
    axisOD: "",
    additionalInfo: "",
    sphOS: "0.00",
    cylOS: "0.00",
    axisOS: "",
    pdLeft: "",
    pdRight: "",
    additionLeft: "",
    additionRight: "",
  };

  const validationSchema = Yup.object().shape({
    axisOD: Yup.number()
      .typeError("Must be a number")
      .transform((value, originalValue) => isNaN(originalValue) ? undefined : value)
      .nullable(),
    additionRight: Yup.number()
      .typeError("Must be a number")
      .transform((value, originalValue) => isNaN(originalValue) ? undefined : value)
      .nullable(),
    axisOS: Yup.number()
      .typeError("Must be a number")
      .transform((value, originalValue) => isNaN(originalValue) ? undefined : value)
      .nullable(),
    pdLeft: Yup.number()
      .typeError("Must be a number")
      .transform((value, originalValue) => isNaN(originalValue) ? undefined : value)
      .required("Required"),
    pdRight: Yup.number()
      .typeError("Must be a number")
      .transform((value, originalValue) => isNaN(originalValue) ? undefined : value)
      .required("Required"),
    additionLeft: Yup.number()
      .typeError("Must be a number")
      .transform((value, originalValue) => isNaN(originalValue) ? undefined : value)
      .nullable()
  });

  const handleSubmit = (values: typeof initialValues) => {
    const customerID = localStorage.getItem('customerID');
    if (customerID) {
        addPrescription(customerID, null, 'manual', values, selectedCart?.cart_id).then((response: any) => {
            if(response?.data?.status) {
                refetch();
                onClose();
            }
        }).catch(err => {
            console.error("Failed to add prescription", err);
        });
    }
  };

  const handleSameEyeSight = (formik: FormikProps<any>) => {
    const checked = !isSame;
    setIsSame(checked);
    if(checked) {
      formik.setFieldValue('sphOS', formik.values.sphOD);
      formik.setFieldValue('cylOS', formik.values.cylOD);
      formik.setFieldValue('axisOS', formik.values.axisOD);
      formik.setFieldValue('additionLeft', formik.values.additionRight);
      formik.setFieldValue('pdLeft', formik.values.pdRight);
    }
  };

  if (!open) return null;

  return (
     <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 font-sans">
        <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
        ></div>
        
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[818px] p-6 transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-[#1F1F1F]">Enter Power Manually</h2>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                </button>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {(formik) => (
                  <Form className="flex flex-col gap-6">
                    <div className="flex justify-end">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={isSame}
                                onChange={() => handleSameEyeSight(formik)}
                                className="w-5 h-5 rounded border-gray-300 text-[#232320] focus:ring-[#232320] accent-[#232320]"
                            />
                            <span className="text-sm font-bold text-[#1F1F1F]">Same for both eyes</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8">
                             <label className="block text-sm font-bold text-[#1F1F1F] uppercase tracking-wide mb-4 text-center md:text-left border-b md:border-0 border-gray-200 pb-2 md:pb-0">
                                Right Eye (OD)
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                <SelectField
                                    formik={formik}
                                    sameFieldName={'sphOS'}
                                    isSame={isSame}
                                    name="sphOD"
                                    label="SPH"
                                    step={0.25}
                                    startValue={-10}
                                    endValue={10}
                                />
                                <SelectField
                                    formik={formik}
                                    sameFieldName={'cylOS'}
                                    isSame={isSame}
                                    name="cylOD"
                                    label="CYL"
                                    step={0.25}
                                    startValue={-6}
                                    endValue={6}
                                />
                                <div>
                                    <InputField
                                        name="axisOD"
                                        label="Axis"
                                        isSame={isSame}
                                        sameFieldName='axisOS'
                                        formik={formik}
                                        placeholder="0-180"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-4">
                             <label className="block text-sm font-bold text-[#1F1F1F] uppercase tracking-wide mb-4 text-center md:text-left border-b md:border-0 border-gray-200 pb-2 md:pb-0">
                                Addition (Near) Right
                            </label>
                            <InputField
                                name="additionRight"
                                label=""
                                isSame={isSame}
                                sameFieldName='additionLeft'
                                formik={formik}
                                placeholder="Add"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8">
                             <label className="block text-sm font-bold text-[#1F1F1F] uppercase tracking-wide mb-4 text-center md:text-left border-b md:border-0 border-gray-200 pb-2 md:pb-0">
                                Left Eye (OS)
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                <SelectField
                                    formik={formik}
                                    name="sphOS"
                                    label="SPH"
                                    step={0.25}
                                    startValue={-10}
                                    endValue={10}
                                    disabled={isSame}
                                />
                                <SelectField
                                    formik={formik}
                                    name="cylOS"
                                    label="CYL"
                                    step={0.25}
                                    startValue={-6}
                                    endValue={6}
                                    disabled={isSame}
                                />
                                <div>
                                    <InputField
                                        name="axisOS"
                                        label="Axis"
                                        disabled={isSame}
                                        formik={formik}
                                        placeholder="0-180"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-4">
                             <label className="block text-sm font-bold text-[#1F1F1F] uppercase tracking-wide mb-4 text-center md:text-left border-b md:border-0 border-gray-200 pb-2 md:pb-0">
                                Addition (Near) Left
                            </label>
                            <InputField
                                name="additionLeft"
                                label=""
                                disabled={isSame}
                                formik={formik}
                                placeholder="Add"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8">
                            <label className="block text-sm font-bold text-[#1F1F1F] uppercase tracking-wide mb-4 text-center md:text-left border-b md:border-0 border-gray-200 pb-2 md:pb-0">
                                Pupillary Distance (PD)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    name="pdRight"
                                    label="Right Eye"
                                    isSame={isSame}
                                    sameFieldName='pdLeft'
                                    formik={formik}
                                    placeholder="mm"
                                />
                                <InputField
                                    name="pdLeft"
                                    label="Left Eye"
                                    disabled={isSame}
                                    formik={formik}
                                    placeholder="mm"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-bold text-[#1F1F1F] uppercase tracking-wide mb-2">
                            Additional Information
                        </label>
                        <Field
                            as="textarea"
                            name="additionalInfo"
                            rows={4}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1F1F1F] font-medium focus:outline-none focus:border-[#232320] resize-none"
                        />
                    </div>

                    <div className="flex justify-center pt-4 pb-2">
                        <button 
                            type="submit"
                            className="bg-[#232320] text-white px-16 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl transform active:scale-95 min-w-[200px]"
                        >
                            SUBMIT
                        </button>
                    </div>

                  </Form>
              )}
            </Formik>
        </div>
     </div>
  );
};

export default EpmPrescriptionsPopup;
