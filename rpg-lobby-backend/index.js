const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

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
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, role } });
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
    const token = jwt.sign({ id: user.id, role: user.role }, 'minha-chave-secreta-123', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

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
    const lobby = await prisma.lobby.create({ data: { name, masterId: req.user.id } });
    res.status(201).json(lobby);
  } catch (error) {
    console.error('Erro ao criar lobby:', error);
    res.status(500).json({ error: 'Erro ao criar lobby' });
  }
});

// Rota para listar lobbies do mestre
app.get('/lobbies', authenticateToken, async (req, res) => {
  try {
    const lobbies = await prisma.lobby.findMany({ where: { masterId: req.user.id } });
    res.json(lobbies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar lobbies' });
  }
});

// Rota para enviar convites
app.post('/invites', authenticateToken, async (req, res) => {
  const { lobbyId, playerEmail } = req.body;
  if (!lobbyId || !playerEmail) {
    return res.status(400).json({ error: 'lobbyId e playerEmail são obrigatórios' });
  }
  if (req.user.role !== 'master') {
    return res.status(403).json({ error: 'Apenas mestres podem enviar convites' });
  }
  try {
    const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
    if (!lobby || lobby.masterId !== req.user.id) {
      return res.status(403).json({ error: 'Lobby não encontrado ou não pertence ao mestre' });
    }
    const player = await prisma.user.findUnique({ where: { email: playerEmail } });
    if (!player) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }
    if (player.role === 'master') {
      return res.status(400).json({ error: 'Não é possível convidar outro mestre' });
    }
    const existingInvite = await prisma.invite.findFirst({
      where: { lobbyId, playerId: player.id, status: 'pending' },
    });
    if (existingInvite) {
      return res.status(400).json({ error: 'Já existe um convite pendente para este jogador neste lobby' });
    }
    const invite = await prisma.invite.create({ data: { lobbyId, playerId: player.id, status: 'pending' } });
    res.status(201).json({ message: 'Convite enviado com sucesso', invite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar convite' });
  }
});

// Rota para listar convites
app.get('/invites', authenticateToken, async (req, res) => {
  try {
    const invites = req.user.role === 'master'
      ? await prisma.invite.findMany({
          where: { lobby: { masterId: req.user.id } },
          include: { lobby: true, player: true },
        })
      : await prisma.invite.findMany({
          where: { playerId: req.user.id },
          include: { lobby: true },
        });
    res.json(invites);
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    res.status(500).json({ error: 'Erro ao listar convites' });
  }
});

// Rota para aceitar ou rejeitar um convite
app.patch('/invites/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status deve ser "accepted" ou "rejected"' });
  }
  try {
    const invite = await prisma.invite.findUnique({ where: { id: parseInt(id) } });
    if (!invite) {
      return res.status(404).json({ error: 'Convite não encontrado' });
    }
    if (invite.playerId !== req.user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para modificar este convite' });
    }
    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'Este convite já foi processado' });
    }
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

// Rota para listar lobbies que o jogador ingressou
app.get('/player-lobbies', authenticateToken, async (req, res) => {
  if (req.user.role !== 'player') {
    return res.status(403).json({ error: 'Apenas jogadores podem acessar esta rota' });
  }
  try {
    const invites = await prisma.invite.findMany({
      where: { playerId: req.user.id, status: 'accepted' },
      include: { lobby: { include: { master: true } } },
    });
    const lobbies = invites.map((invite) => ({ ...invite.lobby, inviteId: invite.id }));
    res.json(lobbies);
  } catch (error) {
    console.error('Erro ao listar lobbies do jogador:', error);
    res.status(500).json({ error: 'Erro ao listar lobbies' });
  }
});

// Rota para sair de um lobby
app.delete('/invites/:id', authenticateToken, async (req, res) => {
  const inviteId = parseInt(req.params.id);
  console.log('Tentando deletar convite com ID:', inviteId, 'Usuário:', req.user);
  try {
    const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
    if (!invite) {
      return res.status(404).json({ error: 'Convite não encontrado' });
    }
    if (invite.playerId !== req.user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para sair deste lobby' });
    }
    await prisma.invite.delete({ where: { id: inviteId } });
    console.log('Convite deletado com sucesso:', inviteId);
    res.json({ message: 'Você saiu do lobby com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar convite:', error);
    res.status(500).json({ error: 'Erro ao sair do lobby' });
  }
});

// Rota para criar ficha
app.post('/character-sheets', authenticateToken, async (req, res) => {
  if (req.user.role !== 'player') {
    return res.status(403).json({ error: 'Apenas jogadores podem criar fichas' });
  }
  const { lobbyId, name, class: charClass, subclass, level, xp, strength, constitution, dexterity, intelligence, wisdom, charisma, inventory } = req.body;
  console.log('Recebido:', req.body); // Debug: Verificar todos os dados recebidos
  try {
    const invite = await prisma.invite.findFirst({
      where: { lobbyId: parseInt(lobbyId), playerId: req.user.id, status: 'accepted' },
    });
    if (!invite) {
      return res.status(403).json({ error: 'Você não está nesse lobby' });
    }
    const characterSheet = await prisma.characterSheet.create({
      data: {
        playerId: req.user.id,
        lobbyId: parseInt(lobbyId),
        name: name || '',
        class: charClass || null,
        subclass: subclass || null,
        level: level !== undefined ? parseInt(level) || 1 : 1,
        xp: xp !== undefined ? parseInt(xp) || 0 : 0,
        strength: strength !== undefined ? parseInt(strength) || 8 : 8,
        constitution: constitution !== undefined ? parseInt(constitution) || 8 : 8,
        dexterity: dexterity !== undefined ? parseInt(dexterity) || 8 : 8,
        intelligence: intelligence !== undefined ? parseInt(intelligence) || 8 : 8,
        wisdom: wisdom !== undefined ? parseInt(wisdom) || 8 : 8,
        charisma: charisma !== undefined ? parseInt(charisma) || 8 : 8,
        inventory: {
          create: Array.isArray(inventory) ? inventory.map(item => ({
            itemName: item.itemName || '',
            quantity: parseInt(item.quantity) || 1,
          })) : [],
        },
      },
      include: { inventory: true }, // Inclui os itens do inventário na resposta
    });
    console.log('Ficha criada com sucesso:', characterSheet);
    res.status(201).json(characterSheet);
  } catch (err) {
    console.error('Erro ao criar ficha:', err);
    res.status(400).json({ error: 'Erro ao criar ficha: ' + err.message });
  }
});

// Rota para listar fichas do jogador
app.get('/character-sheets', authenticateToken, async (req, res) => {
  if (req.user.role !== 'player') {
    return res.status(403).json({ error: 'Apenas jogadores podem listar fichas' });
  }
  const { lobbyId } = req.query;
  try {
    const characterSheets = await prisma.characterSheet.findMany({
      where: { playerId: req.user.id, lobbyId: lobbyId ? parseInt(lobbyId) : undefined },
      include: { inventory: true }, // Inclui o inventário nas fichas retornadas
    });
    res.json(characterSheets);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar fichas' });
  }
});

// Rota para atualizar ficha
app.patch('/character-sheets/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'player') {
    return res.status(403).json({ error: 'Apenas jogadores podem atualizar fichas' });
  }
  const { id } = req.params;
  const { name, class: charClass, subclass, level, xp, strength, constitution, dexterity, intelligence, wisdom, charisma, inventory } = req.body;
  console.log('Recebido para atualização:', req.body);
  try {
    const existingSheet = await prisma.characterSheet.findUnique({
      where: { id: parseInt(id) },
      include: { inventory: true },
    });
    if (!existingSheet || existingSheet.playerId !== req.user.id) {
      return res.status(403).json({ error: 'Ficha não encontrada ou não autorizada' });
    }
    const updatedSheet = await prisma.characterSheet.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingSheet.name,
        class: charClass !== undefined ? charClass : existingSheet.class,
        subclass: subclass !== undefined ? subclass : existingSheet.subclass,
        level: level !== undefined ? parseInt(level) : existingSheet.level,
        xp: xp !== undefined ? parseInt(xp) : existingSheet.xp,
        strength: strength !== undefined ? parseInt(strength) : existingSheet.strength,
        constitution: constitution !== undefined ? parseInt(constitution) : existingSheet.constitution,
        dexterity: dexterity !== undefined ? parseInt(dexterity) : existingSheet.dexterity,
        intelligence: intelligence !== undefined ? parseInt(intelligence) : existingSheet.intelligence,
        wisdom: wisdom !== undefined ? parseInt(wisdom) : existingSheet.wisdom,
        charisma: charisma !== undefined ? parseInt(charisma) : existingSheet.charisma,
        inventory: {
          deleteMany: {},
          create: Array.isArray(inventory) ? inventory.map(item => ({
            itemName: item.itemName || '',
            quantity: parseInt(item.quantity) || 1,
          })) : [],
        },
      },
      include: { inventory: true },
    });
    console.log('Ficha atualizada com sucesso:', updatedSheet);
    res.json(updatedSheet);
  } catch (err) {
    console.error('Erro ao atualizar ficha:', err);
    res.status(400).json({ error: 'Erro ao atualizar ficha: ' + err.message });
  }
});

// Rota para listar fichas de um lobby (apenas mestre)
app.get('/lobbies/:id/character-sheets', authenticateToken, async (req, res) => {
  if (req.user.role !== 'master') {
    return res.status(403).json({ error: 'Apenas mestres podem visualizar fichas' });
  }
  const { id } = req.params;
  try {
    const lobby = await prisma.lobby.findUnique({ where: { id: parseInt(id) } });
    if (!lobby || lobby.masterId !== req.user.id) {
      return res.status(403).json({ error: 'Lobby inválido ou não autorizado' });
    }
    const characterSheets = await prisma.characterSheet.findMany({
      where: { lobbyId: parseInt(id) },
      include: { player: { select: { name: true } }, inventory: true },
    });
    res.json(characterSheets);
  } catch (err) {
    console.error('Erro ao listar fichas do lobby:', err);
    res.status(500).json({ error: 'Erro ao listar fichas do lobby' });
  }
});

// Rota para adicionar item ao inventário
app.post('/character-sheets/:id/inventory', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { itemName, quantity } = req.body;
  try {
    const characterSheet = await prisma.characterSheet.findUnique({ where: { id: parseInt(id) } });
    if (!characterSheet || characterSheet.playerId !== req.user.id) {
      return res.status(403).json({ error: 'Ficha inválida ou não autorizada' });
    }
    const inventoryItem = await prisma.inventory.create({
      data: {
        characterSheetId: parseInt(id),
        itemName: itemName || '',
        quantity: quantity !== undefined ? parseInt(quantity) || 1 : 1,
      },
    });
    res.status(201).json(inventoryItem);
  } catch (err) {
    console.error('Erro ao adicionar item ao inventário:', err);
    res.status(400).json({ error: 'Erro ao adicionar item ao inventário: ' + err.message });
  }
});

// Rota para excluir ficha
app.delete('/character-sheets/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'player') {
    return res.status(403).json({ error: 'Apenas jogadores podem excluir fichas' });
  }
  const { id } = req.params;
  try {
    const existingSheet = await prisma.characterSheet.findUnique({ where: { id: parseInt(id) } });
    if (!existingSheet || existingSheet.playerId !== req.user.id) {
      return res.status(403).json({ error: 'Ficha não encontrada ou não autorizada' });
    }
    await prisma.characterSheet.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Ficha excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir ficha:', err);
    res.status(400).json({ error: 'Erro ao excluir ficha: ' + err.message });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});