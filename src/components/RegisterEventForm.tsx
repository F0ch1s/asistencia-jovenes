import { useState } from "react";
import supabase from "../lib/supabase";
import "../styles/RegisterEventForm.css";

interface FormState {
  name: string;
  date: string; // formato YYYY-MM-DD desde <input type="date">
}

type Msg = { type: "ok" | "err" | null; text: string };

const RegisterEventForm = () => {
  const [formData, setFormData] = useState<FormState>({ name: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg>({ type: null, text: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg({ type: null, text: "" });

    const nombre = formData.name.trim();
    if (!nombre) {
      setMsg({ type: "err", text: "El nombre del evento es obligatorio." });
      return;
    }
    if (!formData.date) {
      setMsg({ type: "err", text: "Selecciona una fecha válida." });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("eventos").insert([
        {
          nombre,           // columna en tu tabla
          fecha: formData.date, // asegúrate que la columna sea date/text compatible
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        setMsg({ type: "err", text: "No se pudo registrar el evento." });
      } else {
        setMsg({ type: "ok", text: "✅ Evento registrado correctamente." });
        setFormData({ name: "", date: "" }); // limpiar formulario
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: "err", text: "Ocurrió un error inesperado." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <div className="register-form-card">
        <h1>📅 Nuevo Evento</h1>

        {msg.type && (
          <div className={`form-alert ${msg.type === "ok" ? "ok" : "err"}`}>
            {msg.text}
          </div>
        )}

        <form className="events-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Nombre del evento</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ej: Reunión de jóvenes"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterEventForm;
