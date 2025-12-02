import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  useScrollTrigger,
  Slide,
  Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';

export default function Landing() {
  const navigate = useNavigate();
  const trigger = useScrollTrigger();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)' }}>
      {/* Navbar */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ContentCutIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                  BARBER<Box component="span" sx={{ color: 'primary.main' }}>SHOP</Box>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/register')}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Registrarse
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </Slide>

      {/* Hero Section */}
      <Box sx={{ pt: 15, pb: 8, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(90deg, #ff6ec4, #7873f5, #4facfe, #00f2fe, #43e97b, #38f9d7, #667eea, #764ba2, #ff6ec4)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradientFlow 4s linear infinite',
                  '@keyframes gradientFlow': {
                    '0%': { backgroundPosition: '0% center' },
                    '100%': { backgroundPosition: '200% center' },
                  },
                }}
              >
                Tu estilo, nuestra pasión
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}
              >
                Reserva tu cita online en segundos. Los mejores cortes, los mejores barberos.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(255,255,255,0.2)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(255,255,255,0.3)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Agenda tu cita ahora
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    document.getElementById('servicios').scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Ver servicios
                </Button>
              </Box>
            </Box>
          </Fade>

          {/* Features */}
          <Fade in timeout={1500}>
            <Grid container spacing={3} sx={{ mt: 4 }}>
              {[
                { icon: CalendarMonthIcon, title: 'Reserva Online', desc: 'Agenda tu cita 24/7 desde cualquier lugar' },
                { icon: AccessTimeIcon, title: 'Sin esperas', desc: 'Llega a tu hora exacta y entra directo' },
                { icon: StarIcon, title: 'Calidad garantizada', desc: 'Barberos profesionales con años de experiencia' },
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      background: 'linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(255, 255, 255, 0.12), 0 0 16px rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        background: 'linear-gradient(145deg, #2a2a2a 0%, #2f2f2f 100%)',
                      },
                    }}
                  >
                    <feature.icon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Scroll indicator */}
      <Box sx={{ textAlign: 'center', mt: 8, pb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Desliza para ver más
        </Typography>
        <Box
          sx={{
            width: '30px',
            height: '50px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            mx: 'auto',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '6px',
              height: '10px',
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '3px',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'scroll 1.5s ease-in-out infinite',
            },
            '@keyframes scroll': {
              '0%, 100%': { transform: 'translate(-50%, 0)' },
              '50%': { transform: 'translate(-50%, 15px)' },
            },
          }}
        />
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            ¿Listo para tu mejor look?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Crea tu cuenta gratis y agenda tu primera cita en menos de 2 minutos
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/register')}
            sx={{
              py: 2,
              px: 5,
              fontSize: '1.2rem',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Comenzar ahora
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          py: 4,
          background: 'rgba(0,0,0,0.4)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ContentCutIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  BARBERSHOP
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Tu barbería de confianza. Estilo, calidad y profesionalismo en cada corte.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Horarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lunes a Viernes: 10:00 - 20:00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sábados: 10:00 - 16:00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Domingos: Cerrado
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Contacto
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📧 contacto@barbershop.cl
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📱 +56 9 1234 5678
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📍 Santiago, Chile
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 Sistema de Barbería. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
