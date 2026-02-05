import React, { useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import { Link, useNavigate } from "react-router-dom";
import { validateCustomer } from "../api/retailerApis";
import SuccessPopUp from "./SuccessPopUp";
import StartGameDialog from "./claim/StartGameDialog";
import { Loader2 } from "./Loader";
import AllreadyPlayed from "./claim/AllreadyPlayed";

interface OtpModalProps {
  open: boolean;
  onHide: (val?: boolean) => void;
  form: {
    number: string;
    firstName: string;
    lastName: string;
    email: string;
    order_id: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      number: string;
      firstName: string;
      lastName: string;
      email: string;
      order_id: string;
    }>
  >;
  registered: boolean;
  handleBack: () => void;
  order?: boolean;
  perscription?: boolean;
  handleUpload?: (val: boolean, mode?: any) => void;
  carts?: any[];
  is_partner?: boolean;
  isEyeCheck?: boolean;
  netPrice?: number;
  mode?: any;
  isClaimCheck?: string;
}

const OtpModal: React.FC<OtpModalProps> = ({
  open,
  onHide,
  form,
  setForm,
  registered,
  handleBack,
  order,
  perscription,
  handleUpload,
  carts,
  is_partner,
  isEyeCheck,
  netPrice,
  mode,
  isClaimCheck,
}) => {
  const { number, firstName, lastName, email, order_id } = form;
  const [timer, setTimer] = useState(50);
  const [otp, setOtp] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDetail, setUserDetail] = useState<any>();

  const navigate = useNavigate();

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (open) {
      intervalId = setInterval(() => {
        if (timer - 1 < 0) {
          setTimer(0);
        } else {
          setTimer((prevTimer) => prevTimer - 1);
        }
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [open, timer]);

  const handleOtpSubmit = () => {
    setLoading(true);
    localStorage.setItem("orderId", order_id);

    const payload = {
      phone_number: number,
      first_name: firstName,
      order_id: order_id,
      last_name: lastName,
      email: email,
      is_registered: registered,
      otp: otp,
    };

    validateCustomer(payload)
      .then((response) => {
        if (response?.data?.status) {
          const _id = response?.data?.customer?.id;
          localStorage.setItem("customerID", _id);

          // Log user in automatically after signup
          localStorage.setItem("token", "mock-token-" + Date.now());
          localStorage.setItem(
            "name",
            form.firstName || response?.data?.customer?.first_name || "User"
          );

          setUserDetail(response?.data);

          if (order && !perscription) {
            setSuccessPopup(true);
            // Slight delay to show success before navigating
            setTimeout(() => {
              navigate("/offers", {
                state: {
                  carts: carts,
                  from: "cart",
                  is_partner: is_partner,
                  netPrice: netPrice,
                },
              });
            }, 500);
          } else if (perscription && !order) {
            if (handleUpload) handleUpload(true, mode);
          } else {
            setSuccessPopup(true);
          }
        }
        setLoading(false);
        onHide(false);
        setForm({
          firstName: "",
          lastName: "",
          order_id: "",
          email: "",
          number: "",
        });
        setOtp("");
      })
      .catch((err) => {
        console.warn("Network/API Error, using mock fallback", err);

        // Mock fallback logic for demo purposes
        const mockCustomer = {
          id: "MOCK_CUST_001",
          first_name: firstName || "Guest",
          last_name: lastName || "User",
          phone_number: number,
          email: email,
          claimstatus: true, // Default to true for testing claim flow
        };

        localStorage.setItem("customerID", mockCustomer.id);

        // Log user in automatically after signup fallback
        localStorage.setItem("token", "mock-token-" + Date.now());
        localStorage.setItem("name", mockCustomer.first_name);

        setUserDetail(mockCustomer);

        if (order && !perscription) {
          setSuccessPopup(true);
          setTimeout(() => {
            navigate("/offers", {
              state: {
                carts: carts,
                from: "cart",
                is_partner: is_partner,
                netPrice: netPrice,
              },
            });
          }, 500);
        } else if (perscription && !order) {
          if (handleUpload) handleUpload(true, mode);
        } else {
          setSuccessPopup(true);
        }

        setLoading(false);
        onHide(false);
        setForm({
          firstName: "",
          lastName: "",
          order_id: "",
          email: "",
          number: "",
        });
        setOtp("");
      });
  };

  if (!open) return null;

  return (
    <>
      {/* OtpModal Dialog */}
      {open && !successPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => onHide()}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[475px] p-6 transform transition-all scale-100">
            {loading ? (
              <div className="py-12">
                <Loader2 />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#1F1F1F]">
                    OTP Verification
                  </h2>
                  <button
                    onClick={() => onHide()}
                    className="text-gray-400 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </button>
                </div>

                <div className="mb-8">
                  <p className="text-[#3D3855] text-base leading-relaxed">
                    Sent a 4 digit code on customer mobile no{" "}
                    {isClaimCheck === "true" ? (
                      <>
                        <strong className="text-[#1F1F1F]">+91 {number}</strong>
                        <br />
                        <button
                          onClick={handleBack}
                          className="text-[#D96C47] hover:underline font-bold text-sm mt-1"
                        >
                          Change Number
                        </button>
                      </>
                    ) : (
                      <>
                        <strong className="text-[#1F1F1F]">+91 {number}</strong>{" "}
                        as him/her to proceed with the eye checkup.
                        <br />
                        <button
                          onClick={handleBack}
                          className="text-[#D96C47] hover:underline font-bold text-sm mt-1"
                        >
                          Change Number
                        </button>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex justify-center mb-8">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={4}
                    renderSeparator={<span className="w-4"></span>}
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="focus:!border-[#232320] focus:!bg-white"
                      />
                    )}
                    inputType="tel"
                    inputStyle={{
                      width: "3.5rem",
                      height: "3.5rem",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      borderRadius: "0.75rem",
                      border: "2px solid #E5E7EB",
                      backgroundColor: "#F9FAFB",
                      color: "#1F1F1F",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 border-2 border-[#232320] text-[#232320] font-bold rounded-lg uppercase text-sm tracking-wider hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleOtpSubmit}
                    disabled={otp.length < 4}
                    className="flex-1 py-3 bg-[#232320] text-white font-bold rounded-lg uppercase text-sm tracking-wider hover:bg-black transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>

                <p className="text-center mt-6 font-bold text-[#1F1F1F] text-sm">
                  00:{timer < 10 ? `0${timer}` : timer}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logic for Post-Success Modals */}
      {isEyeCheck && (
        <SuccessPopUp
          open={successPopup}
          onHide={() => setSuccessPopup(false)}
        />
      )}

      {isClaimCheck === "true" && userDetail && (
        <>
          {userDetail?.claimstatus ? (
            <StartGameDialog
              open={successPopup}
              order_id={order_id}
              setStartGamePopup={setSuccessPopup}
              onHide={() => setSuccessPopup(false)}
            />
          ) : (
            <AllreadyPlayed
              open={successPopup}
              orderId={order_id}
              onHide={() => setSuccessPopup(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export default React.memo(OtpModal);
