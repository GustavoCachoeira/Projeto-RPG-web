import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CharacterSheets from './pages/CharacterSheets';
import LobbyDetails from './pages/LobbyDetails'; // Importa a nova página

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/character-sheets/:lobbyId" element={<CharacterSheets />} />
          <Route path="/lobbies/:id" element={<LobbyDetails />} /> {/* Nova rota */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;