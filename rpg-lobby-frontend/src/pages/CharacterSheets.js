import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CharacterSheetModal from '../components/CharacterSheetModal';

function CharacterSheets() {
  const [characterSheets, setCharacterSheets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { lobbyId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchCharacterSheets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/character-sheets', {
          headers: { Authorization: `Bearer ${token}` },
          params: { lobbyId: parseInt(lobbyId) }, // Garante que lobbyId seja um número inteiro
        });
        setCharacterSheets(response.data);
      } catch (err) {
        setError('Erro ao carregar fichas: ' + (err.response?.data?.error || err.message));
        console.error('Erro ao carregar fichas:', err.response || err); // Log detalhado
      }
    };

    fetchCharacterSheets();
  }, [navigate, lobbyId]);

  const handleCreateSheet = async (data) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        'http://localhost:5000/character-sheets',
        { lobbyId: parseInt(lobbyId), ...data }, // Garante que lobbyId seja um número inteiro
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCharacterSheets([...characterSheets, response.data]);
      setError(''); // Limpa o erro ao criar com sucesso
    } catch (err) {
      setError('Erro ao criar ficha: ' + (err.response?.data?.error || err.message));
      console.error('Erro ao criar ficha:', err.response || err); // Log detalhado
    }
  };

  const handleUpdateSheet = async (data) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.patch(
        `http://localhost:5000/character-sheets/${editingSheet.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCharacterSheets(
        characterSheets.map((sheet) =>
          sheet.id === editingSheet.id ? response.data : sheet
        )
      );
      setError(''); // Limpa o erro ao atualizar com sucesso
    } catch (err) {
      setError('Erro ao atualizar ficha: ' + (err.response?.data?.error || err.message));
      console.error('Erro ao atualizar ficha:', err.response || err); // Log detalhado
    }
  };

  const openModalForCreate = () => {
    setEditingSheet(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (sheet) => {
    setEditingSheet(sheet);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSheet(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Minhas Fichas</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={openModalForCreate}
        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition mb-6"
      >
        Criar Nova Ficha
      </button>
      {characterSheets.length === 0 ? (
        <p className="text-gray-600">Nenhuma ficha criada ainda.</p>
      ) : (
        <ul className="space-y-4">
          {characterSheets.map((sheet) => (
            <li key={sheet.id} className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{sheet.name}</h3>
                  <p className="text-gray-600">
                    Força: {sheet.strength} | Constituição: {sheet.constitution} | Agilidade: {sheet.dexterity} | Inteligência: {sheet.intelligence} | Sabedoria: {sheet.wisdom} | Carisma: {sheet.charisma}
                  </p>
                </div>
                <button
                  onClick={() => openModalForEdit(sheet)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Editar Ficha
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <CharacterSheetModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingSheet ? handleUpdateSheet : handleCreateSheet}
        initialData={editingSheet}
      />
    </div>
  );
}

export default CharacterSheets;