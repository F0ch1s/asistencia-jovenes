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
  edad: number;
  perfil: string;
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
          apellidos,
          edad,
          perfil
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

  const agruparPorEdad = (asistentes: Asistente[]) => {
    console.log(asistentes);
    const asistentesAgrupado = {
      preAdolescentes: asistentes.filter(a => a.edad >= 11 && a.edad <= 13),
      adolescentes: asistentes.filter(a => a.edad >= 14 && a.edad <= 17),
      jovenes: asistentes.filter(a => a.edad >= 18 && a.edad <= 25 && a.perfil === "universitario"),
      jovenes_pro: asistentes.filter(a => a.edad >= 18 && a.edad <= 25 && a.perfil === "profesional")
    };
    return asistentesAgrupado;
  };

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
                <>
                  {(() => {
                    const grupos = agruparPorEdad(asistentes);
                    return (
                      <>
                        {grupos.preAdolescentes.length > 0 && (
                          <>
                            <h4 style={{ color: "green" }}>Pre adolescentes (11–13)</h4>
                            <ul>
                              {grupos.preAdolescentes.map(a => (
                                <li key={a.id}>{a.nombres} {a.apellidos} ({a.edad} años)</li>
                              ))}
                            </ul>
                          </>
                        )}
                        {grupos.adolescentes.length > 0 && (
                          <>
                            <h4 style={{ color: "purple" }}>Adolescentes (14–17)</h4>
                            <ul>
                              {grupos.adolescentes.map(a => (
                                <li key={a.id}>{a.nombres} {a.apellidos} ({a.edad} años)</li>
                              ))}
                            </ul>
                          </>
                        )}
                        {grupos.jovenes.length > 0 && (
                          <>
                            <h4 style={{ color: "red" }}>Jóvenes (18–25)</h4>
                            <ul>
                              {grupos.jovenes.map(a => (
                                <li key={a.id}>{a.nombres} {a.apellidos} ({a.edad} años)</li>
                              ))}
                            </ul>
                          </>
                        )}
                        {grupos.jovenes_pro.length > 0 && (
                          <>
                            <h4 style={{ color: "gold" }}>Jóvenes Profesionales (18–25)</h4>
                            <ul>
                              {grupos.jovenes_pro.map(a => (
                                <li key={a.id}>{a.nombres} {a.apellidos} ({a.edad} años)</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </>
                    );
                  })()}
                </>
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
