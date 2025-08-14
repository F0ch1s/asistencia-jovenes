import { useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <h1 className="admin-title">Panel de administración</h1>
      <div className="admin-buttons">
        <button onClick={() => navigate('/register')}>Registrar nuevo asistente</button>
        <button onClick={() => navigate('/events')}>Registrar nuevo evento</button>
        <button onClick={() => navigate('/records')}>Visualizar registros</button>
      </div>
    </div>
  );
};

export default AdminPage;
