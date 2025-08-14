import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

interface Evento {
  nombre: string;
  fecha: string;
}

const RecordsPage = () => {
  const [eventos, setEventos] = useState<Evento[]>([{
    nombre: '',
    fecha: ''
  }]);

  const fetchEventos = async () => {
    const { data, error } = await supabase
      .from("eventos")
      .select("nombre, fecha")

    if (!error && data) setEventos(data);
  }
  useEffect(() => {
    fetchEventos()
  }, []);

  return (
    <div>
      <h1>Registros de asistentes</h1>
      {eventos.map((item, index) => {
        return <div key={index}>
          <p>{item.nombre}</p>
          <p>{item.fecha}</p>
        </div>
      })}
    </div>
  );
};

export default RecordsPage;
