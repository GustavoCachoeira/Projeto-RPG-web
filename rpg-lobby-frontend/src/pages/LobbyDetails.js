import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CharacterSheetViewModal from '../components/CharacterSheetViewModal';

function LobbyDetails() {
  const [characterSheets, setCharacterSheets] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchCharacterSheets = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/lobbies/${id}/character-sheets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCharacterSheets(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erro ao carregar fichas do lobby');
        console.error('Erro ao carregar fichas do lobby:', err.response || err);
      }
    };

    fetchCharacterSheets();
  }, [navigate, id]);

  const openModal = (sheet) => {
    setSelectedSheet(sheet);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSheet(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Fichas do Lobby</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {characterSheets.length === 0 ? (
        <p className="text-gray-600">Nenhuma ficha criada neste lobby ainda.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Nome do Personagem</th>
              <th className="border p-2">Jogador</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {characterSheets.map((sheet) => (
              <tr key={sheet.id}>
                <td className="border p-2">{sheet.name}</td>
                <td className="border p-2">{sheet.player?.name || 'Desconhecido'}</td>
                <td className="border p-2">
                  <button
                    onClick={() => openModal(sheet)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Visualizar Ficha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <CharacterSheetViewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        sheet={selectedSheet}
      />
    </div>
  );
}

export default LobbyDetails;