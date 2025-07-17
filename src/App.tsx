import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useUserRole } from "./hooks/useUserRole";
import { PrivateRoute } from "./components/PrivateRoute";
import AdminPage from "./pages/AdminPage";
import MainPage from "./pages/MainPage";
import Layout from "./components/Layout";
import LoginForm from "./components/LoginForm";
import RecordsPage from "./components/RecordsPage";

function App() {
  const { role, loading } = useUserRole();

  if (loading) return <p>Cargando...</p>; // O spinner

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LoginForm />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['administrador']} loading={loading}>
                <AdminPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PrivateRoute allowedRoles={['administrador', 'encargado']} loading={loading}>
                <MainPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/records"
            element={
              <PrivateRoute allowedRoles={['administrador']} loading={loading}>
                <RecordsPage />
              </PrivateRoute>
            }
          />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;