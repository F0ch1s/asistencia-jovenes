import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegistroForm.css";
import supabase from "../lib/supabase";
import logo from "../assets/jovenes-logo.png";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Select from "react-select";

interface FormData {
  nombres: string;
  apellidos: string;
  edad: number; // siempre guardamos número
  tipo_persona: "pre-adolescente" | "adolescente" | "joven";
  perfil: "universitario" | "profesional" | "";
  celular: string;
  facebook: string;
  correo: string;
  es_nuevo: boolean;
}

interface Evento { id: number; nombre: string; }
interface Asistente { id: number; nombres: string; apellidos: string; }

/** Categorización por edad */
const getTipoPersonaFromEdad = (edad: number) => {
  if (edad >= 11 && edad <= 13) return "pre-adolescente" as const;
  if (edad >= 14 && edad <= 17) return "adolescente" as const;
  if (edad >= 18 && edad <= 25) return "joven" as const;
  return "pre-adolescente" as const; // default
};

export default function RegistroForm() {
  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    apellidos: "",
    edad: 1,
    tipo_persona: getTipoPersonaFromEdad(1),
    perfil: "",
    celular: "",
    facebook: "",
    correo: "",
    es_nuevo: true,
  });

  const [encargadoId, setEncargadoId] = useState<string | null>(null);
  const [encargadoNombre, setEncargadoNombre] = useState<string>("");

  const [eventOptions, setEventOptions] = useState<{ value: number; label: string }[]>([]);
  const [eventSelected, setEventSelected] = useState<{ value: number; label: string } | null>(null);
  const [asistOptions, setAsistOptions] = useState<{ value: number; label: string }[]>([]);
  const [asistSelected, setAsistSelected] = useState<{ value: number; label: string } | null>(null);

  const navigate = useNavigate();

  const fetchEventos = async () => {
    const { data, error } = await supabase.from("eventos").select("id, nombre");
    if (!error && data) {
      setEventOptions(data.map((e: Evento) => ({ value: e.id, label: e.nombre })));
    }
  };

  const fetchAsistentes = async () => {
    const { data, error } = await supabase.from("asistentes").select("id, nombres, apellidos");
    if (!error && data) {
      setAsistOptions(data.map((a: Asistente) => ({ value: a.id, label: `${a.apellidos}, ${a.nombres}` })));
    }
  };

  useEffect(() => {
    const fetchEncargado = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;
      const { data, error } = await supabase
        .from("encargados").select("id, nombres").eq("correo", user.email).single();
      if (!error && data) { setEncargadoId(data.id); setEncargadoNombre(data.nombres); }
    };
    fetchEncargado();
    fetchEventos();
    fetchAsistentes();
  }, []);

  const registerAsistencia = async (asistenteId: number) => {
    if (!eventSelected) return showError("Seleccione un evento");
    const asistente_id = asistenteId === -1 ? asistSelected?.value : asistenteId;
    const { error } = await supabase.from("evento_asistentes").insert([{ evento_id: eventSelected?.value, asistente_id }]);
    if (!error) { showSuccess("¡Registro enviado con éxito!"); setAsistSelected(null); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  /** Alterna entre "" y "No tiene" */
  const toggleNoTiene = (field: "celular" | "facebook" | "correo") => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] === "No tiene" ? "" : "No tiene",
    }));
  };

  /** Sanea entradas y recalcula tipo_persona cuando cambia la edad */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData(prev => {
      if (name === "edad") {
        // Solo dígitos, sin ceros a la izquierda, máx 2 dígitos (99)
        const digitsOnly = value.replace(/\D/g, "");
        const noLeadingZeros = digitsOnly.replace(/^0+(?=\d)/, "");
        const limited = noLeadingZeros.slice(0, 2);
        const edadNum = limited === "" ? 0 : parseInt(limited, 10);
        const tipo = getTipoPersonaFromEdad(edadNum);
        return {
          ...prev,
          edad: edadNum,
          tipo_persona: tipo,
          perfil: tipo === "joven" ? prev.perfil : "", // limpia perfil si deja de ser joven
        };
      }

      if (name === "celular") {
        // Acepta solo dígitos, limita a 9
        const digits = value.replace(/\D/g, "").slice(0, 9);
        return { ...prev, celular: digits };
      }

      if (name === "es_nuevo") return { ...prev, es_nuevo: value === "true" };

      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!encargadoId) return showError("No se pudo identificar al encargado.");

    const { nombres, apellidos, edad, perfil, celular, facebook, correo, es_nuevo } = formData;

    if (asistSelected) { registerAsistencia(-1); return; }

    if (!eventSelected) return showError("Seleccione evento");
    if (!nombres.trim() || nombres.length < 2) return showError("Ingrese un nombre válido (mínimo 2 letras).");
    if (!apellidos.trim() || apellidos.length < 2) return showError("Ingrese un apellido válido (mínimo 2 letras).");
    if (edad <= 0 || isNaN(edad)) return showError("Ingrese una edad válida.");

    const tipoCalculado = getTipoPersonaFromEdad(edad);
    if (tipoCalculado === "joven" && !perfil) return showError("Seleccione si es universitario o profesional.");

    // ✅ Validación de celular (solo si NO es "No tiene")
    if (celular && celular !== "No tiene" && !/^\d{9}$/.test(celular))
      return showError("El número de celular debe tener 9 dígitos.");

    if (correo && correo !== "No tiene" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
      return showError("Correo no válido.");

    if (facebook && facebook !== "No tiene" && facebook.length < 3)
      return showError("Facebook debe tener al menos 3 caracteres.");

    try {
      const { data, error } = await supabase
        .from("asistentes")
        .insert([{
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          edad,
          tipo_persona: tipoCalculado,                 // usamos el calculado sí o sí
          perfil: tipoCalculado === "joven" ? perfil : null,
          celular: celular.trim(),
          facebook: facebook.trim(),
          correo: correo.trim(),
          es_nuevo,
          registrado_por: encargadoId,
        }])
        .select()
        .single();

      if (error) {
        console.error("Error al registrar:", error.message);
        showError("Error al registrar. Revisa los datos.");
      } else {
        registerAsistencia(data.id);
        setFormData({
          nombres: "",
          apellidos: "",
          edad: 1,
          tipo_persona: getTipoPersonaFromEdad(1),
          perfil: "",
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
        fontSize: "1.25rem",
        padding: "20px",
        borderRadius: "14px",
        textAlign: "center",
        width: "95%",
        maxWidth: "500px",
        margin: "0 auto",
        boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
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
      <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>

      <div className="registro-header">
        <img src={logo} alt="Logo" className="registro-logo" />
        {encargadoNombre && (
          <p className="encargado-saludo">
            <span role="img" aria-label="saludo">👋</span> <strong>{encargadoNombre}</strong>
          </p>
        )}
        <h2 className="registro-title">Registro de Asistencia</h2>
      </div>

      <div className="registro-group">
        <label>Evento:</label>
        <Select
          className="registro-select"
          classNamePrefix="rs"
          options={eventOptions}
          value={eventSelected}
          onChange={(val) => setEventSelected(val)}
          placeholder="Seleccione evento"
          isClearable
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="registro-group" style={{ justifySelf: "center" }}>
          <label>¿Es nuevo?</label>
          <div className="registro-radios">
            <label className="radio-option">
              <input
                type="radio"
                name="es_nuevo"
                value="true"
                checked={formData.es_nuevo === true}
                onChange={handleChange}
              /> Sí
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="es_nuevo"
                value="false"
                checked={formData.es_nuevo === false}
                onChange={handleChange}
              /> No
            </label>
          </div>
        </div>

        {formData.es_nuevo ? null : (
          <Select
            className="registro-select"
            classNamePrefix="rs"
            options={asistOptions}
            value={asistSelected}
            onChange={(val) => setAsistSelected(val)}
            placeholder="Buscar asistente..."
            isClearable
          />
        )}

        <div className="registro-group">
          <label>Nombres:</label>
          <input
            type="text"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            required={asistSelected === null}
          />
        </div>

        <div className="registro-group">
          <label>Apellidos:</label>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            required={asistSelected === null}
          />
        </div>

        <div className="registro-group">
          <label>Edad:</label>
          {/* TEXT + inputMode numeric para limpiar ceros a la izquierda */}
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            name="edad"
            value={formData.edad ? String(formData.edad) : ""} // sin '0' fantasma
            onChange={handleChange}
            maxLength={2}                   // máx 2 dígitos (99)
            placeholder="0"
            required={asistSelected === null}
          />
        </div>

        {/* Campo oculto (etapa) por si lo quieres mantener en el DOM */}
        <div className="hidden-field">
          <label>¿En qué etapa estás?</label>
          <div className="registro-radios">
            <label>
              <input type="radio" name="tipo_persona" value="pre-adolescente"
                checked={formData.tipo_persona === "pre-adolescente"} readOnly />
              Pre-adolescente
            </label>
            <label>
              <input type="radio" name="tipo_persona" value="adolescente"
                checked={formData.tipo_persona === "adolescente"} readOnly />
              Adolescente
            </label>
            <label>
              <input type="radio" name="tipo_persona" value="joven"
                checked={formData.tipo_persona === "joven"} readOnly />
              Joven
            </label>
          </div>
        </div>

        {/* Solo si es joven (18–25) pedimos perfil */}
        {formData.tipo_persona === "joven" && (
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
                /> Universitario
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="perfil"
                  value="profesional"
                  checked={formData.perfil === "profesional"}
                  onChange={handleChange}
                /> Profesional
              </label>
            </div>
          </div>
        )}

        {/* CELULAR con botón "No tiene" */}
        <div className="registro-group">
          <label>Celular:</label>
          <div className="input-with-button">
            <input
              type="tel"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              disabled={formData.celular === "No tiene"}
              placeholder="9 dígitos"
              inputMode="numeric"
              maxLength={9}
              required={asistSelected === null}
            />
            <button
              type="button"
              className="transparent-btn"
              onClick={() => toggleNoTiene("celular")}
            >
              {formData.celular === "No tiene" ? "Cancelar" : "No tiene"}
            </button>
          </div>
        </div>

        <div className="registro-group">
          <label>Facebook:</label>
          <div className="input-with-button">
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
              onClick={() => toggleNoTiene("facebook")}
            >
              {formData.facebook === "No tiene" ? "Cancelar" : "No tiene"}
            </button>
          </div>
        </div>

        <div className="registro-group">
          <label>Correo electrónico:</label>
          <div className="input-with-button">
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
              onClick={() => toggleNoTiene("correo")}
            >
              {formData.correo === "No tiene" ? "Cancelar" : "No tiene"}
            </button>
          </div>
        </div>

        <button type="submit" className="registro-button">Registrar</button>
      </form>
    </div>
  );
}
