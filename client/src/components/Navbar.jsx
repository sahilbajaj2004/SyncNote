import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/register");
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 px-6 py-4 anim-fade">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="font-heading font-bold text-xl tracking-tight anim-in anim-in-1"
        >
          <span className="text-white">Sync</span>
          <span className="text-gold-gradient">Note</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-5 anim-in anim-in-2">
            
            <button
              onClick={handleLogout}
              className="btn-glass text-sm px-4 py-2"
            >
              Logout
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium leading-tight">
                {user.name}
              </p>
              {user.username && (
                <p className="text-gold-400 text-xs mt-0.5 opacity-80 font-medium">
                  @{user.username}
                </p>
              )}
            </div>
            
            <Link to="/settings" title="Settings" className="h-9 w-9 overflow-hidden rounded-full bg-deep border-2 border-gold-400/40 flex items-center justify-center shadow-glow-gold hover:scale-105 transition-transform">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gold-400 font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </Link>

            
          </div>
        ) : (
          <div className="flex items-center gap-4 anim-in anim-in-2">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="btn-gold text-sm px-5 py-2.5"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;