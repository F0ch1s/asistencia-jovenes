import { useState } from "react";
import '../styles/RegistroForm.css';
import supabase from "../lib/supabase";

interface FormData {
  nombres: string;
  apellidos: string;
  perfil: 'universitario' | 'profesional';
  celular: string;
  facebook: string;
  correo: string;
  es_nuevo: boolean;
}

export default function RegistroForm() {
  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    apellidos: "",
    perfil: "universitario",
    celular: "",
    facebook: "",
    correo: "",
    es_nuevo: true,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData(prevData => ({
      ...prevData,
      [name]: name === "es_nuevo" ? value === "true" : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Limpiar campos
    const nombres = formData.nombres.trim();
    const apellidos = formData.apellidos.trim();
    const celular = formData.celular.trim();
    const facebook = formData.facebook.trim();
    const correo = formData.correo.trim();

    // Validaciones
    if (!nombres || nombres.length < 2) {
      alert("Ingrese un nombre válido (mínimo 2 letras).");
      return;
    }

    if (!apellidos || apellidos.length < 2) {
      alert("Ingrese un apellido válido (mínimo 2 letras).");
      return;
    }

    if (!/^\d{9}$/.test(celular)) {
      alert("El número de celular debe tener exactamente 9 dígitos.");
      return;
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      alert("Ingrese un correo electrónico válido.");
      return;
    }

    if (facebook && facebook.length < 3) {
      alert("El campo Facebook debe tener al menos 3 caracteres si se completa.");
      return;
    }

    try {
      const { error } = await supabase
        .from("asistentes")
        .insert([{
          nombres,
          apellidos,
          perfil: formData.perfil,
          celular,
          facebook,
          correo,
          es_nuevo: formData.es_nuevo
        }]);

      if (error) {
        console.error("Error al registrar:", error.message);
        alert("Error al registrar. Revisa los datos.");
      } else {
        alert("¡Registro enviado con éxito!");
        setFormData({
          nombres: "",
          apellidos: "",
          perfil: "universitario",
          celular: "",
          facebook: "",
          correo: "",
          es_nuevo: true,
        });
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado. Inténtalo de nuevo.");
    }
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

        <div className="registro-group">
          <label>¿Es nuevo?</label>
          <div className="registro-radios">
            <label className="radio-option">
              <input
                type="radio"
                name="es_nuevo"
                value="true"
                checked={formData.es_nuevo === true}
                onChange={handleChange}
              />
              Sí
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="es_nuevo"
                value="false"
                checked={formData.es_nuevo === false}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>

        <button type="submit" className="registro-button">Registrar</button>
      </form>
    </div>
  );
}
