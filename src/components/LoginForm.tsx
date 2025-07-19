import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import logo from '../assets/jovenes-logo.png';
import '../styles/LoginForm.css';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const userId = loginData.user.id;

    const { data: rolData, error: rolError } = await supabase
      .from('encargados')
      .select('rol')
      .eq('id', userId)
      .single();

    if (rolError || !rolData) {
      setErrorMsg('No se pudo obtener el rol del usuario.');
      console.error(rolError);
      return;
    }

    const rol = rolData.rol;
    localStorage.setItem('userRole', rol);

    switch (rol) {
      case 'administrador':
        navigate('/admin');
        break;
      case 'encargado':
        navigate('/register');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <form className="login-container" onSubmit={handleSubmit}>
      <img src={logo} alt="Logo Jóvenes" className="login-logo" />

      <h2 className="login-title">
        Bienvenido, ingresa tus credenciales 🔐
      </h2>

      {errorMsg && <div className="login-error">{errorMsg}</div>}

      <div className="login-group">
        <label>Correo Electrónico</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="login-group">
        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="login-button">
        Iniciar Sesión
      </button>
    </form>
  );
};

export default LoginForm;
