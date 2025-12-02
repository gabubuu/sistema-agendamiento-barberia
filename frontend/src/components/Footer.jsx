import { Box, Container, Grid, Typography } from '@mui/material';
import ContentCutIcon from '@mui/icons-material/ContentCut';

export default function Footer() {
  return (
    <Box
      sx={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        py: 4,
        mt: 'auto',
        background: 'rgba(0,0,0,0.4)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ContentCutIcon sx={{ fontSize: 28 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 1px 1px 0 rgba(0, 0, 0, 0.5)',
                  letterSpacing: '1px',
                }}
              >
                THEBARBER
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
              Lunes a sábado: 13:00 - 20:00
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Domingos: cerrado
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Contacto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📧 contacto@thebarber.cl
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📱 +56 9 1234 5678
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📍 Antofagasta, Chile
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 TheBarber. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
