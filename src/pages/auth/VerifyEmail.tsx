import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.post(
          `http://localhost:5000/api/v1/auth/verify-email?token=${token}`,
          {},
          { withCredentials: true }
        );

        setMessage("Email verified successfully 🎉");

        // চাইলে 2 সেকেন্ড পরে redirect
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error: any) {
        setMessage(
          error.response?.data?.message || "Verification failed."
        );
      }
    };

    verify();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{message}</h2>
    </div>
  );
};

export default VerifyEmail;