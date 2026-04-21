import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const SetupUsername = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.username) {
      navigate("/dashboard", { replace: true });
    }
  }, [user?.username]);

  useEffect(() => {
    if (username.length < 3) {
      setAvailable(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await axios.get(`/auth/check-username/${username}`);
        setAvailable(res.data.available);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!available) return;
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/setup-username", { username });
      updateUser({ username: res.data.user.username });
      setTimeout(() => navigate("/dashboard", { replace: true }), 100);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] relative flex items-center justify-center px-4 py-12">
      <div className="mesh-bg"></div>
      <div className="grain-overlay"></div>

      <div className="glass-card w-full max-w-md p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8 anim-in anim-in-1">
          <h2 className="text-3xl font-heading font-bold text-white mb-2">
            Pick a username
          </h2>
          <p className="text-gray-400 text-sm">
            This is how others will find and invite you to notes.
          </p>
        </div>

        {error && (
          <div className="error-banner px-4 py-3 mb-6 anim-in anim-in-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 anim-in anim-in-3">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5 ml-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                  )
                }
                required
                placeholder="sahilbajaj"
                className="input-gold w-full pl-9 pr-24 py-3"
              />
              {username.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center bg-void/50 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5">
                  {checking ? (
                    <span className="text-gold-400 text-[11px] font-medium tracking-wide uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
                      Checking
                    </span>
                  ) : available === true ? (
                    <span className="text-[#4ade80] text-[11px] font-medium tracking-wide uppercase flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Available
                    </span>
                  ) : available === false ? (
                    <span className="text-[#f87171] text-[11px] font-medium tracking-wide uppercase flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      Taken
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-2 ml-1">
              Letters, numbers, underscores only. Min 3 chars.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !available}
            className="btn-gold w-full py-3 text-base"
          >
            {loading ? "Completing setup..." : "Continue to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupUsername;