const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.log('❌ Error:', err.message));  // 👈 muestra solo el mensaje

const app = express();
const SECRET = 'secreto123';

app.use(cors());
app.use(express.json());

// ── MIDDLEWARE ──────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// ── RUTAS PÚBLICAS ──────────────────────────────────────

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'Usuario ya existe' });
  }

  // 🔐 Encriptar contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword
  });

  await newUser.save();

  res.json({ message: 'Usuario registrado' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: 'Credenciales incorrectas' });
  }

  // 🔐 Comparar contraseña
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ message: 'Login exitoso', token });
});

// ── RUTAS PROTEGIDAS ────────────────────────────────────
app.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'Perfil del usuario', user: req.user });
});

app.get('/dashboard', verifyToken, (req, res) => {  // 👈 ruta nueva
  res.json({ message: `Bienvenido al dashboard, ${req.user.email}` });
});

app.listen(3000, () => {
  console.log('Servidor en puerto 3000');
});