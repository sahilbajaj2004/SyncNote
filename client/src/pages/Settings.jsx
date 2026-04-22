import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

const Settings = () => {
  const { user, updateUser } = useAuth();
  
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    password: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewPic, setPreviewPic] = useState(user?.profilePic || null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Canvas compression
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // compress to 70% quality JPEG
        setPreviewPic(dataUrl);
        setProfilePic(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = {};
      if (form.name !== user.name) data.name = form.name;
      if (form.username !== user.username) data.username = form.username;
      if (form.password) data.password = form.password;
      if (profilePic) data.profilePic = profilePic;

      if (Object.keys(data).length === 0) {
        setLoading(false);
        return setError("No changes made");
      }

      const res = await axios.put("/users/profile", data);
      
      updateUser(res.data.user);
      setSuccess("Profile updated successfully!");
      setForm((prev) => ({ ...prev, password: "" })); // clear password field
      
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] relative py-12 px-6">
      <div className="mesh-bg opacity-30"></div>
      <div className="grain-overlay"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <h1 className="text-3xl font-heading font-bold text-white mb-8 anim-in anim-in-1">
          Account Settings
        </h1>

        <div className="glass-card p-8 sm:p-10 anim-in anim-in-2">
          {error && <div className="error-banner px-4 py-3 mb-6">{error}</div>}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-deep border-2 border-gold-400/40 flex items-center justify-center cursor-pointer shadow-glow-gold hover:scale-105 transition-transform overflow-hidden relative group shrink-0"
              >
                {previewPic ? (
                  <img src={previewPic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gold-400 font-heading text-4xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-void/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Profile Picture</h3>
                <p className="text-gray-400 text-sm mb-3">Click the avatar to upload a new image. Will be compressed automatically.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="divider-gold opacity-30"></div>

            {/* Account Details Form */}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5 ml-1">Display Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="input-gold w-full px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5 ml-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    placeholder="username"
                    className="input-gold w-full pl-9 pr-4 py-3"
                  />
                </div>
                <p className="text-gold-400/80 text-xs mt-2 ml-1">
                  Note: You can only change your username once a year.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5 ml-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="input-gold w-full px-4 py-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full sm:w-auto px-8 py-3 mt-4"
            >
              {loading ? "Saving changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
