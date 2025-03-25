import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          RPG Lobby
        </Link>
        <div className="space-x-4">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/" className="text-white hover:text-gray-200 transition">
                Login
              </Link>
              <Link to="/register" className="text-white hover:text-gray-200 transition">
                Registrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;