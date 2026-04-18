import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    console.log("token:", token);
    console.log("user:", user);

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        console.log("parsedUser:", parsedUser);
        login(parsedUser, token);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.log("parse error:", err);
        navigate("/login");
      }
    } else {
      console.log("no token or user found in URL");
      navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  );
};

export default AuthCallback;