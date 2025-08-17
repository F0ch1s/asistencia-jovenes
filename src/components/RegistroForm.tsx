import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegistroForm.css";
import supabase from "../lib/supabase";
import logo from "../assets/jovenes-logo.png";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Select from 'react-select'

interface FormData {
  nombres: string;
  apellidos: string;
  edad: number;
  tipo_persona: "pre-adolescente" | "adolescente" | "joven";
  perfil: "universitario" | "profesional" | "";
  celular: string;
  facebook: string;
  correo: string;
  es_nuevo: boolean;
}

interface Evento {
  id: number;
  nombre: string;
}

interface Asistente {
  id: number;
  nombres: string;
  apellidos: string;
}

export default function RegistroForm() {
  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    apellidos: "",
    edad: 1,
    tipo_persona: "pre-adolescente",
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
    const { data, error } = await supabase
      .from("eventos")
      .select("id, nombre")

    if (!error && data) {
      setEventOptions(data.map((e: Evento) => ({
        value: e.id,
        label: `${e.nombre}`
      })));
    };
  }

  const fetchAsistentes = async () => {
    const { data, error } = await supabase
    .from("asistentes")
    .select("id, nombres, apellidos")

    if (!error && data) {
      setAsistOptions(data.map((a: Asistente) => ({
        value: a.id,
        label: `${a.apellidos}, ${a.nombres}`
      })));
    };
  }

  useEffect(() => {
    const fetchEncargado = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error } = await supabase
        .from("encargados")
        .select("id, nombres")
        .eq("correo", user.email)
        .single();

      if (!error && data) {
        setEncargadoId(data.id);
        setEncargadoNombre(data.nombres);
      }
    };

    fetchEncargado();
    fetchEventos();
    fetchAsistentes();
  }, []);

  const registerAsistencia = async (asistenteId: number) => {
    if (!eventSelected) return showError("Seleccione un evento");
    let asistente_id = asistenteId === -1 ? asistSelected?.value : asistenteId

    const { error } = await supabase
    .from("evento_asistentes")
    .insert([
      {
        evento_id: eventSelected?.value,
        asistente_id
      }
    ]);

    if (!error) {
      showSuccess("¡Registro enviado con éxito!");
      setAsistSelected(null);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "es_nuevo" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!encargadoId) return showError("No se pudo identificar al encargado.");

    const { nombres, apellidos, edad, tipo_persona, perfil, celular, facebook, correo, es_nuevo } = formData;

    if (asistSelected) {
      registerAsistencia(-1);
      return;
    }

    if (!eventSelected) return showError("Seleccione evento")
    if (!nombres.trim() || nombres.length < 2) return showError("Ingrese un nombre válido (mínimo 2 letras).");
    if (!apellidos.trim() || apellidos.length < 2) return showError("Ingrese un apellido válido (mínimo 2 letras).");
    if (edad <= 0 || isNaN(edad)) return showError("Ingrese una edad válida.");
    if (tipo_persona === "joven" && perfil === "") return showError("Seleccione si es universitario o profesional.");
    if (celular && celular !== "No tiene" && !/^\d{9}$/.test(celular.trim())) return showError("El número de celular debe tener 9 dígitos.");
    if (correo && correo !== "No tiene" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return showError("Correo no válido.");
    if (facebook && facebook !== "No tiene" && facebook.length < 3) return showError("Facebook debe tener al menos 3 caracteres.");

    try {
      const { data, error } = await supabase.from("asistentes").insert([
        {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          edad,
          tipo_persona,
          perfil: tipo_persona === "joven" ? perfil : null,
          celular: celular.trim(),
          facebook: facebook.trim(),
          correo: correo.trim(),
          es_nuevo,
          registrado_por: encargadoId,
        },
      ])
      .select().single();

      if (error) {
        console.error("Error al registrar:", error.message);
        showError("Error al registrar. Revisa los datos.");
      } else {
        registerAsistencia(data.id);
        setFormData({
          nombres: "",
          apellidos: "",
          edad: 1,
          tipo_persona: "pre-adolescente",
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

        {formData.es_nuevo
        ? null
        : <Select
            options={asistOptions}
            value={asistSelected}
            onChange={(val) => setAsistSelected(val)}
            placeholder="Buscar asistente..."
            isClearable
          />
        }

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
          <input
            type="number"
            name="edad"
            value={formData.edad}
            onChange={handleChange}
            min={1}
            required={asistSelected === null}
          />
        </div>

        <div className="registro-group">
          <label>¿En qué etapa estás?</label>
          <div className="registro-radios">
            <label>
              <input
                type="radio"
                name="tipo_persona"
                value="pre-adolescente"
                checked={formData.tipo_persona === "pre-adolescente"}
                onChange={handleChange}
              />
              Pre-adolescente
            </label>
            <label>
              <input
                type="radio"
                name="tipo_persona"
                value="adolescente"
                checked={formData.tipo_persona === "adolescente"}
                onChange={handleChange}
              />
              Adolescente
            </label>
            <label>
              <input
                type="radio"
                name="tipo_persona"
                value="joven"
                checked={formData.tipo_persona === "joven"}
                onChange={handleChange}
              />
              Joven
            </label>
          </div>
        </div>

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
        )}

        <div className="registro-group">
          <label>Celular:</label>
          <input
            type="tel"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            required={asistSelected === null}
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

        <button type="submit" className="registro-button">
          Registrar
        </button>
      </form>
    </div>
  );
}
