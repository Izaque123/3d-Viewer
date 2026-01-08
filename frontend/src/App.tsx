import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Pacientes from './pages/Pacientes';
import Visualizador from './pages/Visualizador';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/pacientes" replace />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="visualizador/:modeloId" element={<Visualizador />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

