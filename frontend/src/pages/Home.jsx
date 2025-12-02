import { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Avatar,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Fade,
  Slide,
  useScrollTrigger
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TodayIcon from '@mui/icons-material/Today';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { obtenerEstadisticas } from '../services/adminApi';
import Servicios from '../components/Servicios';
import AgendarCita from '../components/AgendarCita';
import MisCitas from '../components/MisCitas';
import Footer from '../components/Footer';
import EditarPerfil from '../components/EditarPerfil';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card 
    elevation={3}
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: `${color}20`,
            mr: 2
          }}
        >
          <Icon sx={{ fontSize: 32, color }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [serviciosVisible, setServiciosVisible] = useState(false);
  const [editarPerfilOpen, setEditarPerfilOpen] = useState(false);
  const { usuario, logout, isAdmin, actualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const trigger = useScrollTrigger();

  useEffect(() => {
    if (isAdmin()) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setServiciosVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const serviciosElement = document.getElementById('servicios');
    if (serviciosElement) {
      observer.observe(serviciosElement);
    }

    return () => observer.disconnect();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin()) {
      cargarEstadisticas();
    }
  }, []);

  // Morphing text effect
  useEffect(() => {
    if (isAdmin() || tabValue !== 0) return;

    const text1 = document.getElementById('text1');
    const text2 = document.getElementById('text2');
    
    if (!text1 || !text2) return;

    const texts = ['Corta,', 'transforma,', 'impresiona'];
    const morphTime = 1;
    const cooldownTime = 0.25;

    let textIndex = texts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;

    text1.textContent = texts[textIndex % texts.length];
    text2.textContent = texts[(textIndex + 1) % texts.length];
    text1.style.filter = '';
    text1.style.opacity = '100%';
    text2.style.filter = '';
    text2.style.opacity = '0%';

    function doMorph() {
      morph -= cooldown;
      cooldown = 0;
      
      let fraction = morph / morphTime;
      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }
      setMorph(fraction);
    }

    function setMorph(fraction) {
      const blur1 = Math.min(8 / fraction - 8, 100);
      const blur2 = Math.min(8 / (1 - fraction) - 8, 100);
      
      text2.style.filter = `blur(${blur1}px)`;
      text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      
      text1.style.filter = `blur(${blur2}px)`;
      text1.style.opacity = `${Math.pow(1 - fraction, 0.4) * 100}%`;
      
      text1.textContent = texts[textIndex % texts.length];
      text2.textContent = texts[(textIndex + 1) % texts.length];
    }

    function doCooldown() {
      morph = 0;
      
      textIndex++;
      
      text2.style.filter = '';
      text2.style.opacity = '100%';
      text1.style.filter = '';
      text1.style.opacity = '0%';
      
      text1.textContent = texts[textIndex % texts.length];
      text2.textContent = texts[(textIndex + 1) % texts.length];
    }

    function animate() {
      const animationId = requestAnimationFrame(animate);
      
      let newTime = new Date();
      let shouldIncrementIndex = cooldown > 0;
      let dt = (newTime - time) / 1000;
      time = newTime;
      
      cooldown -= dt;
      
      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          doCooldown();
        }
        doMorph();
      }
      
      return animationId;
    }

    const animationId = animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isAdmin, tabValue]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await obtenerEstadisticas();
      setEstadisticas(data.estadisticas);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleAdminPanel = () => {
    navigate('/admin');
    handleMenuClose();
  };

  const handleSeleccionarServicio = (servicioId) => {
    setServicioSeleccionado(servicioId);
    setTabValue(1);
  };

  const handleEditarPerfil = () => {
    setEditarPerfilOpen(true);
    handleMenuClose();
  };

  const handleActualizarPerfil = (usuarioActualizado) => {
    if (actualizarUsuario) {
      actualizarUsuario(usuarioActualizado);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: `
        linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)),
        url('https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg')
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
    }}>
      {/* Navbar - solo en landing hero para clientes */}
      {!isAdmin() && (
        <Slide appear={false} direction="down" in={!trigger}>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1100,
              background: 'rgba(13, 13, 13, 0.95)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ContentCutIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      letterSpacing: 1,
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 1px 1px 0 rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    THEBARBER
                  </Typography>
                </Box>
              </Box>
            </Container>
            
            {/* Avatar fijo en la derecha, fuera del container */}
            <Box
              onClick={handleMenuOpen}
              sx={{
                position: 'absolute',
                top: '50%',
                right: 32,
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-50%) scale(1.05)',
                }
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }
                }}
              >
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </Avatar>
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '5px solid rgba(255,255,255,0.7)',
                  ml: -0.5
                }}
              />
            </Box>
          </Box>
        </Slide>
      )}

      {/* User menu floating button - solo para admin */}
      {isAdmin() && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 32,
            zIndex: 1200,
          }}
        >
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                color: '#000',
                transition: 'box-shadow 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }
              }}
            >
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </Avatar>
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(255,255,255,0.7)',
                ml: -0.5
              }}
            />
          </Box>
        </Box>
      )}

      {/* Menu de usuario */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
            }
          }
        }}
        disableScrollLock={true}
      >
          <MenuItem disabled>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {usuario?.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {usuario?.email}
              </Typography>
            </Box>
          </MenuItem>
          {isAdmin() && (
            <MenuItem onClick={handleAdminPanel}>
              <AdminPanelSettingsIcon sx={{ mr: 1 }} fontSize="small" />
              Panel de admin
            </MenuItem>
          )}
          {!isAdmin() && [
            <MenuItem key="mis-citas" onClick={() => { setTabValue(2); handleMenuClose(); }}>
              <CalendarTodayIcon sx={{ mr: 1 }} fontSize="small" />
              Mis citas
            </MenuItem>,
            <MenuItem key="editar-perfil" onClick={handleEditarPerfil}>
              <EditIcon sx={{ mr: 1 }} fontSize="small" />
              Editar perfil
            </MenuItem>
          ]}
          <MenuItem onClick={handleLogout}>
            <AccountCircle sx={{ mr: 1 }} fontSize="small" />
            Cerrar sesión
          </MenuItem>
        </Menu>

      <EditarPerfil
        open={editarPerfilOpen}
        onClose={() => setEditarPerfilOpen(false)}
        onActualizar={handleActualizarPerfil}
      />

      {/* Hero Section - solo para clientes y solo en tab de servicios */}
      {!isAdmin() && tabValue === 0 && (
        <Box sx={{ 
          pt: 15, 
          pb: 12, 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          position: 'relative', 
          overflow: 'hidden',
        }}>
          {/* Partículas flotantes */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(20)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  background: 'linear-gradient(45deg, #ff8c00, #ffd700)',
                  borderRadius: '50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                  animation: `float${i % 3} ${Math.random() * 10 + 8}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
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

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                {/* Título principal con efecto manuscrito épico */}
                <Typography
                  sx={{
                    fontFamily: '"Great Vibes", cursive',
                    fontSize: { xs: '4.5rem', md: '9rem' },
                    fontWeight: 400,
                    letterSpacing: '8px',
                    mb: 3,
                    position: 'relative',
                    background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 25%, #ffd700 50%, #ff8c00 75%, #ffd700 100%)',
                    backgroundSize: '300% 300%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    WebkitTextStroke: '1px rgba(255, 140, 0, 0.3)',
                    animation: 'epicGlow 4s ease-in-out infinite, float 3s ease-in-out infinite',
                    filter: 'drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.5)) drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 20px rgba(255, 140, 0, 0.4))',
                    transform: 'perspective(500px) rotateX(5deg)',
                    textShadow: `
                      1px 1px 0 rgba(0, 0, 0, 0.4),
                      2px 2px 0 rgba(0, 0, 0, 0.3),
                      3px 3px 0 rgba(0, 0, 0, 0.2),
                      4px 4px 0 rgba(0, 0, 0, 0.1)
                    `,
                    '@keyframes epicGlow': {
                      '0%, 100%': { 
                        backgroundPosition: '0% 50%',
                        filter: 'drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.5)) drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 20px rgba(255, 140, 0, 0.4)) brightness(1.1)',
                      },
                      '50%': { 
                        backgroundPosition: '100% 50%',
                        filter: 'drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.5)) drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 30px rgba(255, 140, 0, 0.5)) brightness(1.2)',
                      },
                    },
                    '@keyframes float': {
                      '0%, 100%': { transform: 'perspective(500px) rotateX(5deg) translateY(0px)' },
                      '50%': { transform: 'perspective(500px) rotateX(5deg) translateY(-10px)' },
                    },
                  }}
                >
                  The Barber
                </Typography>

                {/* Subtítulo con efecto de typing */}
                <Typography
                  variant="h5"
                  sx={{ 
                    mb: 5, 
                    maxWidth: '800px', 
                    mx: 'auto', 
                    lineHeight: 1.7,
                    fontSize: { xs: '1.3rem', md: '1.5rem' },
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.9)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #ff8c00, #ffd700, #ff8c00, transparent)',
                      animation: 'expandLine 2s ease-in-out infinite',
                    },
                    '@keyframes expandLine': {
                      '0%, 100%': { width: '60px', opacity: 0.5 },
                      '50%': { width: '120px', opacity: 1 },
                    },
                  }}
                >
                  Tu estilo, nuestra pasión. Cortes de clase mundial.
                </Typography>

                {/* Botón elegante Ver Citas */}
                <Box 
                  onClick={() => setTabValue(2)}
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 4,
                    py: 1.5,
                    mb: 4,
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%)',
                    border: '1px solid rgba(255, 140, 0, 0.4)',
                    borderRadius: 50,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 15px rgba(255, 140, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 25px rgba(255, 140, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      borderColor: 'rgba(255, 140, 0, 0.6)',
                      '&::before': {
                        left: '100%',
                      },
                    },
                  }}
                >
                  <CalendarTodayIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: '#ffd700',
                      filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))',
                    }} 
                  />
                  <Typography 
                    sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.95)',
                      letterSpacing: '0.5px',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    Ver mis citas
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap' }}>
                  <Box 
                    sx={{ 
                      position: 'relative',
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.15) 0%, rgba(255, 165, 0, 0.15) 100%)',
                      border: '1px solid rgba(255, 140, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 8px rgba(255, 140, 0, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
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
                    <CalendarMonthIcon sx={{ fontSize: 56, color: '#ff8c00', mb: 1.5, filter: 'drop-shadow(0 0 3px rgba(255, 140, 0, 0.5))', position: 'relative', zIndex: 1 }} />
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, color: '#ffa500', position: 'relative', zIndex: 1 }}>Agenda online</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ position: 'relative', zIndex: 1 }}>24/7 disponible</Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      position: 'relative',
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.15) 0%, rgba(255, 165, 0, 0.15) 100%)',
                      border: '1px solid rgba(255, 140, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 8px rgba(255, 140, 0, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
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
                        backgroundPosition: '20px 20px, 60px 80px, 100px 40px',
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
                    <AccessTimeIcon sx={{ fontSize: 56, color: '#ff8c00', mb: 1.5, filter: 'drop-shadow(0 0 3px rgba(255, 140, 0, 0.5))', position: 'relative', zIndex: 1 }} />
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, color: '#ffa500', position: 'relative', zIndex: 1 }}>Sin esperas</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ position: 'relative', zIndex: 1 }}>A tu hora exacta</Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      position: 'relative',
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.15) 0%, rgba(255, 165, 0, 0.15) 100%)',
                      border: '1px solid rgba(255, 140, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 8px rgba(255, 140, 0, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
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
                        backgroundPosition: '10px 30px, 50px 70px, 90px 30px',
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
                    <StarIcon sx={{ fontSize: 56, color: '#ff8c00', mb: 1.5, filter: 'drop-shadow(0 0 3px rgba(255, 140, 0, 0.5))', position: 'relative', zIndex: 1 }} />
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, color: '#ffa500', position: 'relative', zIndex: 1 }}>Calidad premium</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ position: 'relative', zIndex: 1 }}>Profesionales expertos</Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>


          </Container>
        </Box>
      )}

      <Container maxWidth="xl" sx={{ py: { xs: 6, sm: 8 }, flex: 1 }}>
        {isAdmin() ? (
          // Vista Dashboard para Admin
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Bienvenido al panel de administración
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Vista general de tu negocio
              </Typography>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={60} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : (
              <>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Citas de hoy"
                      value={estadisticas?.citas_hoy || 0}
                      icon={TodayIcon}
                      color="#2196f3"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Próximas citas"
                      value={estadisticas?.proximas_citas || 0}
                      icon={EventIcon}
                      color="#4caf50"
                      subtitle="Próximos 7 días"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Total de citas"
                      value={estadisticas?.total_citas || 0}
                      icon={TrendingUpIcon}
                      color="#ff9800"
                      subtitle="Confirmadas"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Ingresos del mes"
                      value={`$${(estadisticas?.total_ingresos || 0).toLocaleString('es-CL')}`}
                      icon={AttachMoneyIcon}
                      color="#9c27b0"
                      subtitle="Mes actual"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                      title="Total clientes"
                      value={estadisticas?.total_clientes || 0}
                      icon={PeopleIcon}
                      color="#f44336"
                      subtitle="Registrados"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Bienvenido a tu sistema de gestión
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Desde aquí puedes administrar completamente tu negocio. Utiliza el menú lateral "Panel de admin" para acceder a todas las funcionalidades:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        • <strong>Configuración de horarios:</strong> define los días y horas de atención de tu negocio
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        • <strong>Servicios:</strong> administra los servicios que ofreces, precios y duraciones
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        • <strong>Todas las citas:</strong> visualiza, filtra y gestiona todas las reservas de tus clientes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • <strong>Lista de usuarios:</strong> consulta todos los usuarios registrados en el sistema
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </>
            )}
          </Box>
        ) : (
          // Vista progresiva para Clientes - Flujo paso a paso
          <>
            <Box 
              sx={{ 
                maxWidth: '1400px',
                mx: 'auto',
                px: { xs: 2, sm: 3 }
              }}
            >
              {/* Vista condicional según el paso */}
              {tabValue === 0 && (
                <Box 
                  id="servicios"
                  sx={{
                    opacity: serviciosVisible ? 1 : 0,
                    transform: serviciosVisible ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.95)',
                    transition: 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: serviciosVisible ? 'blur(0px)' : 'blur(10px)',
                  }}
                >
                  <Box 
                    sx={{ 
                      mb: 6, 
                      textAlign: 'center',
                      opacity: serviciosVisible ? 1 : 0,
                      transform: serviciosVisible ? 'translateY(0)' : 'translateY(-30px)',
                      transition: 'all 0.8s ease-out',
                      transitionDelay: serviciosVisible ? '0.2s' : '0s',
                    }}
                  >
                    <Typography 
                      variant="h3" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{ 
                        background: 'linear-gradient(90deg, #ff8c00, #ffa500, #ffd700, #ffb347, #ff8c00)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        mb: 1,
                        animation: serviciosVisible ? 'gradientFlow 3s linear infinite, pulse 2s ease-in-out infinite, titleGlow 2s ease-in-out' : 'none',
                        filter: 'drop-shadow(0 0 4px rgba(255, 140, 0, 0.5))',
                        transform: 'perspective(500px)',
                        transformStyle: 'preserve-3d',
                        '@keyframes gradientFlow': {
                          '0%': {
                            backgroundPosition: '0% center',
                          },
                          '100%': {
                            backgroundPosition: '200% center',
                          },
                        },
                        '@keyframes pulse': {
                          '0%, 100%': {
                            transform: 'scale(1) rotateY(0deg)',
                            filter: 'drop-shadow(0 0 4px rgba(255, 140, 0, 0.5))',
                          },
                          '50%': {
                            transform: 'scale(1.05) rotateY(5deg)',
                            filter: 'drop-shadow(0 0 10px rgba(255, 140, 0, 0.7)) drop-shadow(0 0 20px rgba(255, 165, 0, 0.5))',
                          },
                        },
                        '@keyframes titleGlow': {
                          '0%': {
                            filter: 'drop-shadow(0 0 4px rgba(255, 140, 0, 0.5))',
                          },
                          '50%': {
                            filter: 'drop-shadow(0 0 25px rgba(255, 140, 0, 0.9)) drop-shadow(0 0 50px rgba(255, 165, 0, 0.7))',
                          },
                          '100%': {
                            filter: 'drop-shadow(0 0 4px rgba(255, 140, 0, 0.5))',
                          },
                        },
                      }}
                    >
                      Nuestros servicios
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'transparent',
                        background: 'linear-gradient(90deg, #ff8c00, #ffa500, #ffd700, #ffb347, #ff8c00)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'shimmer 3s linear infinite',
                        '@keyframes shimmer': {
                          '0%': { backgroundPosition: '0% center' },
                          '100%': { backgroundPosition: '200% center' },
                        },
                      }}
                    >
                      Selecciona un servicio para comenzar
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      mb: 8,
                      opacity: serviciosVisible ? 1 : 0,
                      transform: serviciosVisible ? 'translateY(0)' : 'translateY(40px)',
                      transition: 'all 1s ease-out',
                      transitionDelay: serviciosVisible ? '0.4s' : '0s',
                    }}
                  >
                    <Servicios onSeleccionarServicio={handleSeleccionarServicio} />
                  </Box>
                </Box>
              )}

              {tabValue === 1 && (
                <Box
                  sx={{
                    animation: 'fadeInUp 0.5s ease-out',
                    '@keyframes fadeInUp': {
                      from: {
                        opacity: 0,
                        transform: 'translateY(20px)'
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                >
                  <AgendarCita 
                    servicioIdInicial={servicioSeleccionado} 
                    onCancelar={() => setTabValue(0)}
                  />
                </Box>
              )}

              {tabValue === 2 && (
                <Box
                  sx={{
                    animation: 'fadeInUp 0.5s ease-out',
                    '@keyframes fadeInUp': {
                      from: {
                        opacity: 0,
                        transform: 'translateY(20px)'
                      },
                      to: {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                >
                  <MisCitas onVolver={() => setTabValue(0)} />
                </Box>
              )}
            </Box>
          </>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
