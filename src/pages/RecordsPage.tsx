import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import "../styles/Events.css";

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
      .select("id, nombre, fecha");

    if (!error && data) {
      data.forEach((item) => {
        item.fecha = item.fecha.replace("T", " ");
        const [fecha] = item.fecha.split(" ");
        item.fecha = fecha;
      });
      setEventos(data);
    }
  };

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
        data.evento_asistentes.map((e: any) => e.asistentes) as Asistente[]
      );
    }
  };

  const handleClick = async (id: number) => {
    if (eventoSeleccionado === id) {
      setEventoSeleccionado(null);
      setAsistentes([]);
    } else {
      setEventoSeleccionado(id);
      await fetchAsistentes(id);
    }
  };

  const agruparPorEdad = (items: Asistente[]) => {
    const preAdolescentes = items.filter(a => a.edad >= 11 && a.edad <= 13);
    const adolescentes   = items.filter(a => a.edad >= 14 && a.edad <= 17);
    const jovenes        = items.filter(a => a.edad >= 18 && a.edad <= 25 && a.perfil === "universitario");
    const jovenes_pro    = items.filter(a => a.edad >= 18 && a.edad <= 25 && a.perfil === "profesional");
    return { preAdolescentes, adolescentes, jovenes, jovenes_pro };
  };

  useEffect(() => { fetchEventos(); }, []);

  return (
      <div className="records-wrapper">
      <h1 className="titulo-lista">Lista de asistencia</h1>
      <h2 className="subtitulo-eventos">Eventos:</h2>

        <div className="event-list">
          {eventos.map((ev) => {
            const isOpen = eventoSeleccionado === ev.id;

            return (     
              <div key={ev.id} style={{ marginBottom: "1rem" }}>
                <article className="event-item" onClick={() => handleClick(ev.id)}>
                <p className="event-name">
                  <strong>{ev.nombre}</strong>
                </p>                  
                <p className="event-date">📅{ev.fecha}</p>
                </article>

                {isOpen && (
                  <div className="accordion">
                    <div className="accordion-header">
                      <h3>Asistentes</h3>
                      {(() => {
                        const g = agruparPorEdad(asistentes);
                        const total =
                          g.preAdolescentes.length +
                          g.adolescentes.length +
                          g.jovenes.length +
                          g.jovenes_pro.length;
                        return (
                          <div className="badges">
                            <span className="badge">Total: {total}</span>
                            <span className="badge">Pre: {g.preAdolescentes.length}</span>
                            <span className="badge">Ados: {g.adolescentes.length}</span>
                            <span className="badge">Jóv: {g.jovenes.length}</span>
                            <span className="badge">J. Pro: {g.jovenes_pro.length}</span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="accordion-body">
                      {asistentes.length === 0 ? (
                        <div className="empty">No hay asistentes registrados</div>
                      ) : (
                        <>
                          {(() => {
                            const g = agruparPorEdad(asistentes);
                            return (
                              <>
                                {g.preAdolescentes.length > 0 && (
                                  <section className="group">
                                    <h4 style={{ color: "green" }}>
                                      Pre adolescentes (11–13)
                                    </h4>
                                    <ul>
                                      {g.preAdolescentes.map(a => (
                                        <li key={a.id} className="person">
                                          {a.nombres} {a.apellidos}
                                        </li>
                                      ))}
                                    </ul>
                                  </section>
                                )}

                                {g.adolescentes.length > 0 && (
                                  <section className="group">
                                    <h4 style={{ color: "purple" }}>
                                      Adolescentes (14–17)
                                    </h4>
                                    <ul>
                                      {g.adolescentes.map(a => (
                                        <li key={a.id} className="person">
                                          {a.nombres} {a.apellidos}
                                        </li>
                                      ))}
                                    </ul>
                                  </section>
                                )}

                                {g.jovenes.length > 0 && (
                                  <section className="group">
                                    <h4 style={{ color: "red" }}>
                                      Jóvenes (18–25)
                                    </h4>
                                    <ul>
                                      {g.jovenes.map(a => (
                                        <li key={a.id} className="person">
                                          {a.nombres} {a.apellidos}
                                        </li>
                                      ))}
                                    </ul>
                                  </section>
                                )}

                                {g.jovenes_pro.length > 0 && (
                                  <section className="group">
                                    <h4 style={{ color: "gold" }}>
                                      Jóvenes Profesionales (18–25)
                                    </h4>
                                    <ul>
                                      {g.jovenes_pro.map(a => (
                                        <li key={a.id} className="person">
                                          {a.nombres} {a.apellidos}
                                        </li>
                                      ))}
                                    </ul>
                                  </section>
                                )}
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
  );
};

export default RecordsPage;
