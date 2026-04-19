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
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link
          to={user ? "/dashboard" : "/register"}
          className="text-white font-bold text-xl tracking-tight"
        >
          Sync<span className="text-indigo-400">Note</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{user.name}</p>
              {user.username && (
                <p className="text-indigo-400 text-xs">@{user.username}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
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