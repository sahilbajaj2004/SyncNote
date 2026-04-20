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
      // Small delay to let state update before navigating
      setTimeout(() => navigate("/dashboard", { replace: true }), 100);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">Pick a username</h2>
        <p className="text-gray-400 text-sm mb-6">
          This is how others will find and invite you to notes.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
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
                className="w-full bg-gray-800 text-white pl-8 pr-24 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500 placeholder-gray-600"
              />
              {username.length >= 3 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs">
                  {checking ? (
                    <span className="text-gray-500">checking...</span>
                  ) : available === true ? (
                    <span className="text-green-400">available</span>
                  ) : available === false ? (
                    <span className="text-red-400">taken</span>
                  ) : null}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-xs mt-1">
              Letters, numbers, underscores only. Min 3 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !available}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting up..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupUsername;