import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface LoginFormProps {
  cambiarPantalla: (pantalla: 'login' | 'registro' | 'main') => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ cambiarPantalla }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

    // ✅ Usuario autenticado, ahora buscamos su rol en la tabla "encargados"
    const { data: rolData, error: rolError } = await supabase
      .from('encargados')
      .select('rol')
      .eq('correo', email)
      .single();

    if (rolError || !rolData) {
      setErrorMsg('No se pudo obtener el rol del usuario.');
      return;
    }

    const rol = rolData.rol;

    alert(`✅ Inicio de sesión exitoso como ${rol}`);
    console.log('Usuario:', loginData.user);

    // 🔁 Redirigir según el rol
    if (rol === 'encargado') {
      cambiarPantalla('registro');
    } else if (rol === 'administrador') {
      cambiarPantalla('main');
    } else {
      setErrorMsg('Rol no reconocido.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 400,
        margin: '2rem auto',
        padding: '2rem',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Bienvenido, ingresa tus credenciales 🔐
      </h2>

      {errorMsg && (
        <div style={{ color: 'red', fontWeight: 'bold' }}>
          {errorMsg}
        </div>
      )}

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        Correo Electrónico
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            padding: '0.5rem',
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: '1rem',
          }}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            padding: '0.5rem',
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: '1rem',
          }}
        />
      </label>

      <button
        type="submit"
        style={{
          padding: '0.75rem',
          borderRadius: 4,
          border: 'none',
          background: '#2563eb',
          color: '#fff',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          marginTop: '1rem',
        }}
      >
        Iniciar Sesión
      </button>
    </form>
  );
};

export default LoginForm;
