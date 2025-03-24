const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-aqui';

// Middleware para parsear JSON
app.use(express.json());

// Rota de Registro
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validação básica
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'player', // Default é "player"
      },
    });

    res.status(201).json({ message: 'Usuário criado com sucesso', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Rota de Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validação básica
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    res.json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Middleware para proteger rotas (exemplo de uso futuro)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Exemplo de rota protegida
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Rota protegida', user: req.user });
});

// Rota para criar um lobby (apenas mestres)
app.post('/lobbies', authenticateToken, async (req, res) => {
    const { name } = req.body;
    const user = req.user; // Dados do usuário autenticado pelo token
  
    // Verifica se o usuário é um mestre
    if (user.role !== 'master') {
      return res.status(403).json({ error: 'Apenas mestres podem criar lobbies' });
    }
  
    // Validação básica
    if (!name) {
      return res.status(400).json({ error: 'O nome do lobby é obrigatório' });
    }
  
    try {
      // Cria o lobby no banco
      const lobby = await prisma.lobby.create({
        data: {
          name,
          masterId: user.id,
        },
      });
  
      res.status(201).json({ message: 'Lobby criado com sucesso', lobby });
    } catch (error) {
      console.error(error);
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
  const user = req.user;
  
  try {
    const invites = await prisma.invite.findMany({
      where: { playerId: user.id, status: 'pending' },
      include: { lobby: true }, // Inclui detalhes do lobby
    });
    res.json(invites);
  } catch (error) {
    console.error(error);
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

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});