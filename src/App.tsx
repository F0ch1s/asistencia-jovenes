import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useUserRole } from "./hooks/useUserRole";
import { PrivateRoute } from "./components/PrivateRoute";
import AdminPage from "./pages/AdminPage";
import MainPage from "./pages/MainPage";
import Layout from "./components/Layout";
import LoginForm from "./components/LoginForm";
import RecordsPage from "./pages/RecordsPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EventsPage from "./pages/EventsPage";

function App() {
  const { role, loading } = useUserRole();

  if (loading) return (
    <div className="loading-container">
      <div className="loader" />
      <p style={{ marginTop: '1rem' }}>Cargando...</p>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LoginForm />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["administrador"]} >
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PrivateRoute allowedRoles={["administrador", "encargado"]}>
                <MainPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute allowedRoles={["administrador"]}>
                <EventsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/records"
            element={
              <PrivateRoute allowedRoles={["administrador"]}>
                <RecordsPage />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
