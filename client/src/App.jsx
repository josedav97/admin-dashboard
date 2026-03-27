import { useState } from 'react';

function App() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // ── REGISTRO ────────────────────────────────────────────
  const register = async () => {
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    alert(data.message);
  };

  // ── LOGIN ───────────────────────────────────────────────
  const login = async () => {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('Login exitoso ✅');
    } else {
      alert(data.message);
    }
  };

  // ── DASHBOARD (ruta protegida) ──────────────────────────
  const getDashboard = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Debes iniciar sesión primero');
      return;
    }

    const res = await fetch('http://localhost:3000/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    alert(data.message);
  };

  // ── UI ──────────────────────────────────────────────────
  return (
    <div>
      <h1>Login</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={register}>Registrarse</button>
      <button onClick={login}>Login</button>
      <button onClick={getDashboard}>Ver Dashboard 🔒</button>
    </div>
  );
}

export default App;