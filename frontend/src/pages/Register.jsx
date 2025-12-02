import { useState } from 'react';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generar partículas una sola vez con useMemo para evitar re-render
  const particulas = React.useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      animationType: i % 3
    }));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const result = await register(
      formData.nombre,
      formData.email,
      formData.password,
      formData.telefono
    );

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)),
        url('https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg')
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Partículas flotantes */}
      <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
        {particulas.map((p) => (
          <Box
            key={p.id}
            sx={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: 'linear-gradient(45deg, #ff8c00, #ffd700)',
              borderRadius: '50%',
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              animation: `float${p.animationType} ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              boxShadow: '0 0 10px rgba(255, 140, 0, 0.6)',
              '@keyframes float0': {
                '0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)' },
                '50%': { transform: 'translateY(-30px) translateX(20px) scale(1.2)' },
              },
              '@keyframes float1': {
                '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
                '50%': { transform: 'translateY(-50px) translateX(-20px) rotate(180deg)' },
              },
              '@keyframes float2': {
                '0%, 100%': { transform: 'translateY(0) translateX(0)' },
                '33%': { transform: 'translateY(-20px) translateX(30px)' },
                '66%': { transform: 'translateY(-40px) translateX(-15px)' },
              },
            }}
          />
        ))}
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <Box textAlign="center" mb={4}>
            {/* Logo The Barber estilo hero pero pequeño */}
            <Typography
              sx={{
                fontFamily: '"Great Vibes", cursive',
                fontSize: { xs: '3rem', md: '4rem' },
                fontWeight: 400,
                letterSpacing: '4px',
                mb: 2,
                background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 25%, #ffd700 50%, #ff8c00 75%, #ffd700 100%)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                WebkitTextStroke: '0.5px rgba(255, 140, 0, 0.3)',
                animation: 'epicGlow 4s ease-in-out infinite',
                filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 15px rgba(255, 140, 0, 0.4))',
                textShadow: `
                  1px 1px 0 rgba(0, 0, 0, 0.4),
                  2px 2px 0 rgba(0, 0, 0, 0.3)
                `,
                '@keyframes epicGlow': {
                  '0%, 100%': { 
                    backgroundPosition: '0% 50%',
                    filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 15px rgba(255, 140, 0, 0.4)) brightness(1.1)',
                  },
                  '50%': { 
                    backgroundPosition: '100% 50%',
                    filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5)) drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 20px rgba(255, 140, 0, 0.5)) brightness(1.2)',
                  },
                },
              }}
            >
              The Barber
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500,
                letterSpacing: '1px'
              }}
            >
              Crear cuenta
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(255, 140, 0, 0.1)',
                color: '#ffa500',
                border: '1px solid rgba(255, 140, 0, 0.3)',
                '& .MuiAlert-icon': { color: '#ff8c00' }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nombre completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#ff8c00' },
                  '&.Mui-focused fieldset': { borderColor: '#ffa500' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#ffa500' },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#ff8c00' },
                  '&.Mui-focused fieldset': { borderColor: '#ffa500' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#ffa500' },
              }}
            />

            <TextField
              fullWidth
              label="Teléfono (opcional)"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              margin="normal"
              placeholder="+56912345678"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#ff8c00' },
                  '&.Mui-focused fieldset': { borderColor: '#ffa500' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#ffa500' },
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Mínimo 6 caracteres"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#ff8c00' },
                  '&.Mui-focused fieldset': { borderColor: '#ffa500' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#ffa500' },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Confirmar contraseña"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#ff8c00' },
                  '&.Mui-focused fieldset': { borderColor: '#ffa500' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#ffa500' },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                bgcolor: '#ff8c00',
                '&:hover': { bgcolor: '#ffa500' },
                boxShadow: '0 4px 16px rgba(255, 140, 0, 0.3)',
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Registrarse'}
            </Button>

            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="text.secondary">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#ffa500',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Inicia sesión aquí
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
