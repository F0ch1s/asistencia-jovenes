import { useState } from "react";
import '../styles/RegistroForm.css'; // Ruta correcta desde /components hacia /styles

interface FormData {
  nombres: string;
  apellidos: string;
  perfil: 'universitario' | 'profesional';
  celular: string;
  facebook: string;
  correo: string;
}

export default function RegistroForm() {
  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    apellidos: "",
    perfil: "universitario",
    celular: "",
    facebook: "",
    correo: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ 
      ...prevData, 
      [name]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Datos registrados:", formData);
    alert("¡Registro enviado con éxito!");
    // Aquí después conectaremos Supabase o base de datos
  };

  return (
    <div className="registro-container">
      <h2 className="registro-title">Registro de Asistencia</h2>
      <form onSubmit={handleSubmit}>
        <div className="registro-group">
          <label>Nombres:</label>
          <input
            type="text"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            required
          />
        </div>

        <div className="registro-group">
          <label>Apellidos:</label>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            required
          />
        </div>

        <div className="registro-group">
          <label>¿Eres?</label>
          <div className="registro-radios">
            <label className="radio-option">
              <input
                type="radio"
                name="perfil"
                value="universitario"
                checked={formData.perfil === "universitario"}
                onChange={handleChange}
                required
              />
              Universitario
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="perfil"
                value="profesional"
                checked={formData.perfil === "profesional"}
                onChange={handleChange}
              />
              Profesional
            </label>
          </div>
        </div>

        <div className="registro-group">
          <label>Celular:</label>
          <input
            type="tel"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            required
          />
        </div>

        <div className="registro-group">
          <label>Facebook:</label>
          <input
            type="text"
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
          />
        </div>

        <div className="registro-group">
          <label>Correo electrónico:</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="registro-button">Registrar</button>
      </form>
    </div>
  );
}
