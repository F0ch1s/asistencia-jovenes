import { useState } from "react";
import "../styles/RegistroForm.css";
import supabase from "../lib/supabase";
import logo from "../assets/jovenes-logo.png";

// Toast
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface FormData {
  nombres: string;
  apellidos: string;
  perfil: "universitario" | "profesional";
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

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "es_nuevo" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nombres = formData.nombres.trim();
    const apellidos = formData.apellidos.trim();
    const celular = formData.celular.trim();
    const facebook = formData.facebook.trim();
    const correo = formData.correo.trim();

    // Validaciones
    if (!nombres || nombres.length < 2) {
      showError("Ingrese un nombre válido (mínimo 2 letras).");
      return;
    }

    if (!apellidos || apellidos.length < 2) {
      showError("Ingrese un apellido válido (mínimo 2 letras).");
      return;
    }

    if (!/^\d{9}$/.test(celular)) {
      showError("El número de celular debe tener exactamente 9 dígitos.");
      return;
    }

    if (correo && correo !== "No tiene" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      showError("Ingrese un correo electrónico válido.");
      return;
    }


    if (facebook && facebook !== "No tiene" && facebook.length < 3) {
      showError("El campo Facebook debe tener al menos 3 caracteres.");
      return;
    }


    try {
      const { error } = await supabase.from("asistentes").insert([
        {
          nombres,
          apellidos,
          perfil: formData.perfil,
          celular,
          facebook,
          correo,
          es_nuevo: formData.es_nuevo,
        },
      ]);

      if (error) {
        console.error("Error al registrar:", error.message);
        showError("Error al registrar. Revisa los datos.");
      } else {
        showSuccess("¡Registro enviado con éxito!");
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
      showError("Error inesperado. Inténtalo de nuevo.");
    }
  };

  const showSuccess = (msg: string) => {
    toast.success(msg, {
      icon: <FaCheckCircle style={{ color: "green" }} />,
      position: "top-center",
      autoClose: 3000,
      style: {
        background: "#ffffff",
        color: "#000000",
        border: "1px solid #ddd",
        fontSize: "1.25rem",         // 🔠 Texto más grande
        padding: "20px",             // 📦 Espaciado interno mayor
        borderRadius: "14px",
        textAlign: "center",
        width: "95%",
        maxWidth: "500px",           // 📏 Límite máximo más ancho
        margin: "0 auto",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  const showError = (msg: string) => {
    toast.error(msg, {
      icon: <FaTimesCircle style={{ color: "red" }} />,
      position: "top-center",
      autoClose: 4000,
      style: {
        background: "#fff1f1",
        color: "#b00020",
        border: "1px solid #f5c2c2",
        fontSize: "1rem",
        padding: "16px",
        borderRadius: "10px",
        textAlign: "center",
      },
    });
  };

  return (
    <div className="registro-container">
      <img src={logo} alt="Logo" className="registro-logo" />
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
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              disabled={formData.facebook === "No tiene"}
              placeholder="Escribe tu Facebook"
            />
            <button
              type="button"
              className="transparent-btn"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  facebook: prev.facebook === "No tiene" ? "" : "No tiene",
                }))
              }
            >
              {formData.facebook === "No tiene" ? "Cancelar" : "No tiene"}
            </button>
          </div>
        </div>


        <div className="registro-group">
          <label>Correo electrónico:</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              disabled={formData.correo === "No tiene"}
              placeholder="ejemplo@correo.com"
            />
            <button
              type="button"
              className="transparent-btn"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  correo: prev.correo === "No tiene" ? "" : "No tiene",
                }))
              }
            >
              {formData.correo === "No tiene" ? "Cancelar" : "No tiene"}
            </button>
          </div>
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

        <button type="submit" className="registro-button">
          Registrar
        </button>
      </form>
    </div>
  );
}
