import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/setup-username");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] relative flex items-center justify-center px-4 py-12">
      {/* Background Effects */}
      <div className="mesh-bg"></div>
      <div className="grain-overlay"></div>

      {/* Main Content */}
      <div className="glass-card w-full max-w-md p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8 anim-in anim-in-1">
          <h2 className="text-3xl font-heading font-bold text-white mb-2">
            Create account
          </h2>
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="error-banner px-4 py-3 mb-6 anim-in anim-in-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 anim-in anim-in-3">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5 ml-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Sahil Bajaj"
              className="input-gold w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5 ml-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="sahil@example.com"
              className="input-gold w-full px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5 ml-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Min 6 characters"
              className="input-gold w-full px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 mt-2 text-base"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6 anim-in anim-in-4">
          <div className="divider-gold flex-1" />
          <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">or sign up with</span>
          <div className="divider-gold flex-1" />
        </div>

        <div className="anim-in anim-in-5">
          <a
            href="http://localhost:5000/api/auth/google"
            className="btn-glass w-full flex items-center justify-center gap-3 py-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.2-2.7-.4-4z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.7-2.9-11.9-7.2l-6.5 5C9.5 40.1 16.3 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C41 35.3 44 30 44 24c0-1.3-.2-2.7-.4-4z" />
            </svg>
            Google
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;