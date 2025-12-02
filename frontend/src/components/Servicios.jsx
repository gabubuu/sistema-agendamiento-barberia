import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { obtenerServicios } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Servicios({ onSeleccionarServicio }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const data = await obtenerServicios();
      setServicios(data.servicios || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los servicios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', px: 2 }}>
      <Grid container spacing={3} sx={{ maxWidth: '1300px', width: '100%', justifyContent: 'center' }}>
        {servicios.map((servicio) => (
          <Grid item xs={12} sm={6} md={4} key={servicio.id}>
            <Card 
              elevation={0}
              sx={{
                height: '480px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.15) 0%, rgba(255, 165, 0, 0.15) 100%)',
                border: '1px solid rgba(255, 140, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 8px rgba(255, 140, 0, 0.15)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 25px rgba(255, 140, 0, 0.3), 0 0 15px rgba(255, 165, 0, 0.2)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `
                    radial-gradient(circle, rgba(255, 215, 0, 0.8) 1px, transparent 1px),
                    radial-gradient(circle, rgba(255, 140, 0, 0.6) 1px, transparent 1px),
                    radial-gradient(circle, rgba(255, 165, 0, 0.7) 1px, transparent 1px)
                  `,
                  backgroundSize: '80px 80px, 120px 120px, 150px 150px',
                  backgroundPosition: '0 0, 40px 60px, 80px 20px',
                  animation: 'glitter 20s linear infinite',
                  opacity: 0.4,
                  pointerEvents: 'none',
                  '@keyframes glitter': {
                    '0%': { transform: 'translate(0, 0) rotate(0deg)' },
                    '100%': { transform: 'translate(50px, 50px) rotate(360deg)' },
                  },
                },
              }}
            >
              {servicio.imagen_url && (
                <Box
                  component="img"
                  src={servicio.imagen_url}
                  alt={servicio.nombre}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              {!servicio.imagen_url && (
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.2) 0%, rgba(255, 165, 0, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(255, 140, 0, 0.3)',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <EventAvailableIcon sx={{ fontSize: 60, color: '#ff8c00', opacity: 0.5 }} />
                </Box>
              )}
              <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1 }}>
                {/* Content Group: Título + Descripción + Tiempo + Precio */}
                <Box sx={{ mb: 'auto' }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5, lineHeight: 1.3 }}>
                    {servicio.nombre}
                  </Typography>
                  
                  {servicio.descripcion && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.4, fontSize: '0.8rem' }}>
                      {servicio.descripcion}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}>
                      {servicio.duracion_minutos} min
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 800, 
                      fontSize: '1.5rem',
                      color: '#fff',
                      letterSpacing: '1px',
                      textShadow: '0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.15)',
                      animation: 'priceGlow 2.5s ease-in-out infinite',
                      display: 'inline-block',
                      '@keyframes priceGlow': {
                        '0%, 100%': {
                          textShadow: '0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.15)',
                        },
                        '50%': {
                          textShadow: '0 0 15px rgba(255,255,255,0.5), 0 0 30px rgba(255,255,255,0.25)',
                        },
                      },
                    }}
                  >
                    ${servicio.precio_clp.toLocaleString('es-CL')}
                  </Typography>
                </Box>

                {/* Button pinned to bottom with mt: auto */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<EventAvailableIcon />}
                  onClick={() => onSeleccionarServicio ? onSeleccionarServicio(servicio.id) : null}
                  sx={{ 
                    mt: 2,
                    py: 1,
                    borderRadius: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }}
                >
                  Agendar cita
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {servicios.length === 0 && (
        <Grid item xs={12}>
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No hay servicios disponibles en este momento
            </Typography>
          </Box>
        </Grid>
      )}
    </Box>
  );
}
