import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import '../styles/Events.css'
interface Evento {
  id: number;
  nombre: string;
  fecha: string;
}

interface Asistente {
  id: number;
  nombres: string;
  apellidos: string;
}

const RecordsPage = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<number | null>(null);

  const fetchEventos = async () => {
    const { data, error } = await supabase
      .from("eventos")
      .select("id, nombre, fecha")

    if (!error && data) {
      data.forEach((item) => {
        //Cambiar formato AAAA-MM-DDTHH:mm:ss a DD-MM-AAAA
        item.fecha = item.fecha.replace("T", " ");
        const [fecha] = item.fecha.split(" ");
        item.fecha = fecha;
      })
      setEventos(data);
    }
  }

  const fetchAsistentes = async (eventoId: number) => {
    const { data, error } = await supabase
    .from("eventos")
    .select(`
      id,
      evento_asistentes (
        asistentes (
          id,
          nombres,
          apellidos
          )
          )
          `)
          .eq("id", eventoId)
          .single();

      if (!error && data) {
        setAsistentes(
          data.evento_asistentes.map((element: any) => element.asistentes) as Asistente[]
        );
      }
  }

  const handleClick = async (id: number) => {
    if (eventoSeleccionado === id) {
      // si ya está abierto → lo cerramos
      setEventoSeleccionado(null);
      setAsistentes([]);
    } else {
      setEventoSeleccionado(id);
      await fetchAsistentes(id);
    }
  }

  useEffect(() => {
    fetchEventos()
  }, []);

  return (
    <>
      <h1>Registros de asistentes</h1>
            <div className="event-list">
        {eventos.map((item) => (
          <div key={item.id}>
            <article
              className="event-item"
              onClick={() => handleClick(item.id)}
            >
              <p className="event-name">{item.nombre}</p>
              <p className="event-date">{item.fecha}</p>
            </article>

            {/* Acordeón: solo se abre si el evento coincide */}
            {eventoSeleccionado === item.id && (
              <div className="accordion-content">
                <h3>Asistentes:</h3>
                {asistentes.length > 0 ? (
                  <ul>
                    {asistentes.map((a) => (
                      <li key={a.id}>
                        {a.nombres} {a.apellidos}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay asistentes registrados</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default RecordsPage;
