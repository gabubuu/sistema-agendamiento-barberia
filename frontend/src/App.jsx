import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import ConfiguracionHorarios from './pages/admin/ConfiguracionHorarios';
import GestionServicios from './pages/admin/GestionServicios';
import TodasCitas from './pages/admin/TodasCitas';
import ListaUsuarios from './pages/admin/ListaUsuarios';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#cccccc',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(15, 15, 15, 0.95)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#999999',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard protegido */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />

            {/* Panel de admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/horarios" replace />} />
              <Route path="horarios" element={<ConfiguracionHorarios />} />
              <Route path="servicios" element={<GestionServicios />} />
              <Route path="citas" element={<TodasCitas />} />
              <Route path="usuarios" element={<ListaUsuarios />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
