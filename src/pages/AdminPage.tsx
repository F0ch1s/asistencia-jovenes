import { useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <h1 className="admin-title">Panel de administración</h1>

      <div className="admin-cards">
        <button
          className="admin-card"
          onClick={() => navigate('/register')}
        >
          <div className="card-icon">➕</div>
          <h2 className="card-title">Registrar nuevo asistente</h2>
          <p className="card-text">Agrega asistentes a los eventos fácilmente.</p>
        </button>

        <button
          className="admin-card"
          onClick={() => navigate('/events')}
        >
          <div className="card-icon">📅</div>
          <h2 className="card-title">Registrar nuevo evento</h2>
          <p className="card-text">Crea los eventos para el registro en el sistema.</p>
        </button>

        <button
          className="admin-card"
          onClick={() => navigate('/records')}
        >
          <div className="card-icon">📊</div>
          <h2 className="card-title">Visualizar registros</h2>
          <p className="card-text">Consulta las listas de asistencia separadas por categorías.</p>
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
