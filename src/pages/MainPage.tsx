import RegistroForm from "../components/RegistroForm";
import LoginForm from "../components/LoginForm";

export default function MainPage() {
    return (
        <main style={{ 
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
                <h1>Registro de Asistencia</h1>
                <LoginForm />
            </div>
        </main>
            
    )
}