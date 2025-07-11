import { useState } from "react";

interface FormData {
  nombres: string;
  apellidos: string;
  perfil: 'universitario' | 'profesional'
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

  const validate = () => {
    //TODO: validar cada campo antes de enviar
  }

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
    <form onSubmit={handleSubmit}>
      <label>Nombres:</label><br />
      <input name="nombres" value={formData.nombres} onChange={handleChange} required /><br /><br />

      <label>Apellidos:</label><br />
      <input name="apellidos" value={formData.apellidos} onChange={handleChange} required /><br /><br />

      <label>¿Eres?</label><br />
      <label><input type="radio" name="perfil" value="universitario" onChange={handleChange} required /> Universitario</label><br />
      <label><input type="radio" name="perfil" value="profesional" onChange={handleChange} /> Profesional</label><br /><br />

      <label>Celular:</label><br />
      <input name="celular" value={formData.celular} onChange={handleChange} required /><br /><br />

      <label>Facebook:</label><br />
      <input name="facebook" value={formData.facebook} onChange={handleChange} /><br /><br />

      <label>Correo electrónico:</label><br />
      <input type="email" name="correo" value={formData.correo} onChange={handleChange} /><br /><br />

      <button type="submit">Registrar</button>
    </form>
  );
}
