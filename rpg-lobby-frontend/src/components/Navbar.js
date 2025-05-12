import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Verifica se o usuário está logado

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleLogoClick = () => {
    if (token) {
      navigate('/dashboard'); // Redireciona para o Dashboard se estiver logado
    } else {
      navigate('/'); // Redireciona para a página de login se não estiver logado
    }
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={handleLogoClick} className="text-2xl font-bold">
          RPG Lobby
        </button>
        {token && ( // Mostra o botão "Logout" apenas se o usuário estiver logado
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;