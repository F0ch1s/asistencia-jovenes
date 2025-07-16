import { Outlet } from "react-router-dom"

const Layout = () => {
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
                <Outlet />
            </div>
        </main>
    )
}

export default Layout