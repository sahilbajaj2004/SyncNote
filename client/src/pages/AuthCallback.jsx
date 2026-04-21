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

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        login(parsedUser, token);
        navigate("/setup-username", { replace: true });
      } catch (err) {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-73px)] relative flex items-center justify-center">
      <div className="mesh-bg opacity-50"></div>
      <div className="grain-overlay"></div>
      
      <div className="flex flex-col items-center gap-6 anim-fade z-10">
        <div className="branded-loader"></div>
        <p className="text-gold-400 font-medium tracking-wide">Authenticating</p>
      </div>
    </div>
  );
};

export default AuthCallback;