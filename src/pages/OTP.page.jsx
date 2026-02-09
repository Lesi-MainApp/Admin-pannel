import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useVerifyPhoneOtpMutation,
  useResendVerifyOtpMutation,
  useForgotPasswordSendOtpMutation,
} from "../api/authApi";

const OTPPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const flow = params.get("flow") || "signup"; // signup | forgot
  const phoneFromUrl = params.get("phone") || "";

  const [phone, setPhone] = useState(phoneFromUrl);

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const code = useMemo(() => digits.join(""), [digits]);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [verifyPhoneOtp, { isLoading: verifying }] =
    useVerifyPhoneOtpMutation();
  const [resendVerifyOtp, { isLoading: resending }] =
    useResendVerifyOtpMutation();
  const [forgotSendOtp, { isLoading: sendingForgotOtp }] =
    useForgotPasswordSendOtpMutation();

  const setAt = (idx, val) => {
    setError("");
    setMsg("");
    const v = String(val || "").replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => prev.map((x, i) => (i === idx ? v : x)));
  };

  // ✅ Flow 2 step: user enters phone then click Send OTP
  const handleSendForgotOtp = async () => {
    setError("");
    setMsg("");

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    try {
      // backend expects identifier
      await forgotSendOtp({ identifier: phone }).unwrap();
      setMsg("OTP sent. Check WhatsApp/Email.");
    } catch (err) {
      setError(err?.data?.message || "Failed to send OTP");
    }
  };

  // ✅ Verify OTP
  const handleVerify = async () => {
    setError("");
    setMsg("");

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    if (code.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }

    try {
      // ✅ Flow 1: signup verification uses /whatsapp/verify-code
      if (flow === "signup") {
        await verifyPhoneOtp({ phonenumber: phone, code }).unwrap();
        navigate("/signin");
        return;
      }

      // ✅ Flow 2: go reset page and pass phone + code
      navigate(
        `/reset-password?identifier=${encodeURIComponent(
          phone
        )}&code=${encodeURIComponent(code)}`
      );
    } catch (err) {
      setError(err?.data?.message || "OTP verification failed");
    }
  };

  const handleResendSignupOtp = async () => {
    setError("");
    setMsg("");

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    try {
      await resendVerifyOtp({ phonenumber: phone }).unwrap();
      setMsg("OTP resent. Check WhatsApp/Email.");
    } catch (err) {
      setError(err?.data?.message || "Resend failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-2">
          OTP Verification
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Check your WhatsApp and enter the verification code
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        {msg && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
            {msg}
          </div>
        )}

        {/* ✅ Flow 2: ask phone number + Send OTP */}
        {flow === "forgot" && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={handleSendForgotOtp}
              disabled={sendingForgotOtp}
              className="w-full mt-3 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold disabled:opacity-60"
            >
              {sendingForgotOtp ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        <div className="flex justify-between gap-2 mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold disabled:opacity-60"
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>

        {/* ✅ Only signup flow has resend */}
        {flow === "signup" && (
          <button
            type="button"
            onClick={handleResendSignupOtp}
            disabled={resending}
            className="w-full mt-3 border border-blue-600 text-blue-700 py-2.5 rounded-lg hover:bg-blue-50 transition duration-200 font-semibold disabled:opacity-60"
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OTPPage;
