// File moved to components/eyeCheckup/eyeCheckupForm/EyeCheckupForm.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EyeCheckupFormRedirect: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/new-eye-check");
  }, [navigate]);
  return null;
};
export default EyeCheckupFormRedirect;
