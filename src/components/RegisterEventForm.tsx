import { useState } from "react";
import supabase from "../lib/supabase";

interface FormData {
    name: string;
    date: string;
}


const RegisterEventForm = () => {
const [formData, setFormData] = useState<FormData>({
        name: "",
        date: "",
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nombre = formData.get("name") as string;
        const fecha = formData.get("date");

        try {
            const { error } = await supabase.from('eventos').insert([
                {
                    nombre: nombre?.trim(),
                    fecha
                }
            ])

            if (error) console.error("Error al registrar: ", error)
            else console.log("Registro exitoso");
        } catch (err) {
            console.error("Error: ", err);
        }
    }

    return <>
        <div>
            <h1>Nuevo Evento</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Nombre: </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="date">Fecha:</label>
                <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
                <button className="registro-button" type="submit">Registrar</button>
            </form>
        </div>
    </>
}

export default RegisterEventForm