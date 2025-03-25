import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [lobbyName, setLobbyName] = useState('');
  const [lobbies, setLobbies] = useState([]);
  const [playerLobbies, setPlayerLobbies] = useState([]);
  const [invitesSent, setInvitesSent] = useState([]);
  const [invitesReceived, setInvitesReceived] = useState([]);
  const [playerEmail, setPlayerEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal
  const [selectedInviteId, setSelectedInviteId] = useState(null); // Estado para armazenar o inviteId
  const navigate = useNavigate();

  const fetchLobbies = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/lobbies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLobbies(response.data);
    } catch (err) {
      setError('Erro ao carregar lobbies');
    }
  };

  const fetchPlayerLobbies = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/player-lobbies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayerLobbies(response.data);
    } catch (err) {
      setError('Erro ao carregar lobbies do jogador');
    }
  };

  const fetchInvites = async (token) => {
    try {
      const received = await axios.get('http://localhost:5000/invites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvitesReceived(received.data);

      if (user?.role === 'master') {
        const sent = await axios.get('http://localhost:5000/invites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvitesSent(sent.data);
      }
    } catch (err) {
      setError('Erro ao carregar convites');
    }
  };

  const handleCreateLobby = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5000/lobbies',
        { name: lobbyName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLobbyName('');
      fetchLobbies(token);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar lobby');
    }
  };

  const handleSendInvite = async (lobbyId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5000/invites',
        { lobbyId, playerEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlayerEmail('');
      fetchInvites(token);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar convite');
    }
  };

  const handleRespondInvite = async (inviteId, status) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `http://localhost:5000/invites/${inviteId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchInvites(token);
      if (status === 'accepted') {
        fetchPlayerLobbies(token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao responder convite');
    }
  };

  const handleLeaveLobby = async (inviteId) => {
    const token = localStorage.getItem('token');
    console.log('Tentando sair do lobby com inviteId:', inviteId);
    try {
      const response = await axios.delete(`http://localhost:5000/invites/${inviteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Resposta da API:', response.data);
      setSuccessMessage(response.data.message);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchPlayerLobbies(token);
      fetchInvites(token);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao sair do lobby';
      console.error('Erro ao sair do lobby:', err.response || err);
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Função para abrir o modal
  const openModal = (inviteId) => {
    setSelectedInviteId(inviteId);
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInviteId(null);
  };

  // Função para confirmar a saída do lobby
  const confirmLeaveLobby = () => {
    if (selectedInviteId) {
      handleLeaveLobby(selectedInviteId);
    }
    closeModal();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.id, role: payload.role });
      fetchLobbies(token);
      fetchInvites(token);
      if (payload.role === 'player') {
        fetchPlayerLobbies(token);
      }
    } catch (err) {
      setError('Erro ao carregar dados do usuário');
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

      {user?.role === 'master' && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Criar Lobby</h2>
            <form onSubmit={handleCreateLobby}>
              <input
                type="text"
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
                placeholder="Nome do lobby"
                className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
              >
                Criar Lobby
              </button>
            </form>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Meus Lobbies</h2>
            {lobbies.length === 0 ? (
              <p className="text-gray-600">Nenhum lobby criado ainda.</p>
            ) : (
              <ul className="space-y-4">
                {lobbies.map((lobby) => (
                  <li key={lobby.id} className="p-4 bg-white rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">{lobby.name}</h3>
                        <p className="text-gray-600">
                          Criado em: {new Date(lobby.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="email"
                          placeholder="Email do jogador"
                          value={playerEmail}
                          onChange={(e) => setPlayerEmail(e.target.value)}
                          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSendInvite(lobby.id)}
                          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Convidar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Convites Enviados</h2>
            {invitesSent.length === 0 ? (
              <p className="text-gray-600">Nenhum convite enviado.</p>
            ) : (
              <ul className="space-y-2">
                {invitesSent.map((invite) => (
                  <li key={invite.id} className="p-3 bg-white rounded-lg shadow">
                    Lobby: {invite.lobby.name} | Jogador: {invite.playerId} | Status: {invite.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {user?.role === 'player' && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Convites Recebidos</h2>
            {invitesReceived.filter((invite) => invite.status === 'pending').length === 0 ? (
              <p className="text-gray-600">Nenhum convite pendente.</p>
            ) : (
              <ul className="space-y-2">
                {invitesReceived
                  .filter((invite) => invite.status === 'pending')
                  .map((invite) => (
                    <li key={invite.id} className="p-3 bg-white rounded-lg shadow flex justify-between items-center">
                      <div>
                        Lobby: {invite.lobby.name} | Enviado em: {new Date(invite.createdAt).toLocaleDateString()}
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleRespondInvite(invite.id, 'accepted')}
                          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleRespondInvite(invite.id, 'rejected')}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                        >
                          Rejeitar
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Meus Lobbies</h2>
            {playerLobbies.length === 0 ? (
              <p className="text-gray-600">Você ainda não ingressou em nenhum lobby.</p>
            ) : (
              <ul className="space-y-2">
                {playerLobbies.map((lobby) => (
                  <li key={lobby.id} className="p-3 bg-white rounded-lg shadow flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{lobby.name}</h3>
                      <p className="text-gray-600">
                        Mestre: {lobby.master?.name || 'Desconhecido'} | Criado em: {new Date(lobby.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {lobby.inviteId ? (
                      <button
                        onClick={() => openModal(lobby.inviteId)} // Abre o modal ao clicar
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                      >
                        Sair do Lobby
                      </button>
                    ) : (
                      <p className="text-red-500">Convite não encontrado</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Adiciona o ConfirmModal */}
          <ConfirmModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onConfirm={confirmLeaveLobby}
            message="Tem certeza que deseja sair do lobby?"
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
