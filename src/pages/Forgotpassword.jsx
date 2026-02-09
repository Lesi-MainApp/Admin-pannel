import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/otp?flow=forgot", { replace: true });
  }, [navigate]);

  return null;
};

export default ForgotPassword;
