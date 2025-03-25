const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Rota de Registro
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  if (role !== 'player' && role !== 'master') {
    return res.status(400).json({ error: 'Função inválida' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Rota de Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Tentativa de login:', { email, password });
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('Usuário encontrado:', user);
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Senha válida?', isPasswordValid);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      'minha-chave-secreta-123',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Middleware para verificar o token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, 'minha-chave-secreta-123');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Rota para criar um lobby
app.post('/lobbies', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome do lobby é obrigatório' });
  }

  if (req.user.role !== 'master') {
    return res.status(403).json({ error: 'Apenas mestres podem criar lobbies' });
  }

  try {
    const lobby = await prisma.lobby.create({
      data: {
        name,
        masterId: req.user.id,
      },
    });
    res.status(201).json(lobby);
  } catch (error) {
    console.error('Erro ao criar lobby:', error);
    res.status(500).json({ error: 'Erro ao criar lobby' });
  }
});
  
// Rota para listar lobbies do mestre (opcional)
app.get('/lobbies', authenticateToken, async (req, res) => {
  const user = req.user;
  
  try {
    const lobbies = await prisma.lobby.findMany({
       where: {
         masterId: user.id,
       },
     });
    res.json(lobbies);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar lobbies' });
  }
});

app.post('/invites', authenticateToken, async (req, res) => {
  const { lobbyId, playerEmail } = req.body;
  const user = req.user; // Mestre autenticado
  
  // Verifica se o usuário é mestre
  if (user.role !== 'master') {
    return res.status(403).json({ error: 'Apenas mestres podem enviar convites' });
  }
  
  // Validação básica
  if (!lobbyId || !playerEmail) {
    return res.status(400).json({ error: 'lobbyId e playerEmail são obrigatórios' });
  }
  
  try {
    // Verifica se o lobby existe e pertence ao mestre
    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
    });
    if (!lobby || lobby.masterId !== user.id) {
      return res.status(403).json({ error: 'Lobby não encontrado ou não pertence ao mestre' });
    }
  
    // Busca o jogador pelo email
    const player = await prisma.user.findUnique({
      where: { email: playerEmail },
    });
    if (!player) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }
    if (player.role === 'master') {
      return res.status(400).json({ error: 'Não é possível convidar outro mestre' });
    }
  
    // Verifica se já existe um convite pendente
    const existingInvite = await prisma.invite.findFirst({
      where: { lobbyId, playerId: player.id, status: 'pending' },
    });
    if (existingInvite) {
      return res.status(400).json({ error: 'Já existe um convite pendente para este jogador neste lobby' });
    }
  
    // Cria o convite
    const invite = await prisma.invite.create({
      data: {
        lobbyId,
        playerId: player.id,
        status: 'pending',
      },
    });
  
    res.status(201).json({ message: 'Convite enviado com sucesso', invite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar convite' });
  }
});
  
// Rota para listar convites recebidos (apenas jogadores)
app.get('/invites', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'master') {
      const invites = await prisma.invite.findMany({
        where: {
          lobby: { masterId: req.user.id },
        },
        include: {
          lobby: true,
          player: true,
        },
      });
      res.json(invites);
    } else {
      const invites = await prisma.invite.findMany({
        where: {
          playerId: req.user.id,
        },
        include: {
          lobby: true,
        },
      });
      res.json(invites);
    }
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    res.status(500).json({ error: 'Erro ao listar convites' });
  }
});
  
  // Rota para aceitar ou rejeitar um convite (apenas jogadores)
app.patch('/invites/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "accepted" ou "rejected"
  const user = req.user;

  // Validação
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status deve ser "accepted" ou "rejected"' });
  }

  try {
    // Busca o convite
    const invite = await prisma.invite.findUnique({
      where: { id: parseInt(id) },
    });
    if (!invite) {
      return res.status(404).json({ error: 'Convite não encontrado' });
    }
    if (invite.playerId !== user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para modificar este convite' });
    }
    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'Este convite já foi processado' });
    }

    // Atualiza o status do convite
    const updatedInvite = await prisma.invite.update({
      where: { id: invite.id },
      data: { status },
    });
  
    res.json({ message: `Convite ${status === 'accepted' ? 'aceito' : 'rejeitado'} com sucesso`, invite: updatedInvite });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar convite' });
    }
});

// Rota para listar os lobbies que o jogador ingressou
app.get('/player-lobbies', authenticateToken, async (req, res) => {
  if (req.user.role !== 'player') {
    return res.status(403).json({ error: 'Apenas jogadores podem acessar esta rota' });
  }

  try {
    const invites = await prisma.invite.findMany({
      where: {
        playerId: req.user.id,
        status: 'accepted',
      },
      include: {
        lobby: {
          include: {
            master: true,
          },
        },
      },
    });

    const lobbies = invites.map((invite) => ({
      ...invite.lobby,
      inviteId: invite.id,
    }));
    res.json(lobbies);
  } catch (error) {
    console.error('Erro ao listar lobbies do jogador:', error);
    res.status(500).json({ error: 'Erro ao listar lobbies' });
  }
});

app.delete('/invites/:id', authenticateToken, async (req, res) => {
  const inviteId = parseInt(req.params.id);
  console.log('Tentando deletar convite com ID:', inviteId, 'Usuário:', req.user);

  try {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });
    console.log('Convite encontrado:', invite);

    if (!invite) {
      return res.status(404).json({ error: 'Convite não encontrado' });
    }

    if (invite.playerId !== req.user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para sair deste lobby' });
    }

    await prisma.invite.delete({
      where: { id: inviteId },
    });
    console.log('Convite deletado com sucesso:', inviteId);

    res.json({ message: 'Você saiu do lobby com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar convite:', error);
    res.status(500).json({ error: 'Erro ao sair do lobby' });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
