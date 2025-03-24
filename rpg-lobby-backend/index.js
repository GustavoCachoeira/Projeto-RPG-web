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

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});