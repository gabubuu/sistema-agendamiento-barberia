import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { obtenerServicios } from '../../services/api';
import { crearServicio, actualizarServicio, eliminarServicio } from '../../services/adminApi';
import { CLOUDINARY_CONFIG } from '../../config/cloudinary';

export default function GestionServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_clp: '',
    duracion_minutos: '60',
    imagen_url: ''
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const data = await obtenerServicios();
      setServicios(data.servicios || []);
    } catch (err) {
      setError('Error al cargar servicios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (servicio = null) => {
    if (servicio) {
      setEditando(servicio.id);
      setFormData({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || '',
        precio_clp: servicio.precio_clp.toString(),
        duracion_minutos: servicio.duracion_minutos.toString(),
        imagen_url: servicio.imagen_url || ''
      });
    } else {
      setEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio_clp: '',
        duracion_minutos: '60',
        imagen_url: ''
      });
    }
    setDialogOpen(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditando(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio_clp: '',
      duracion_minutos: '60'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    setUploadingImage(true);
    
    try {
      // Usar FormData para enviar el archivo
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'dstot0fta');
      data.append('cloud_name', 'dstot0fta');
      
      const response = await fetch('https://api.cloudinary.com/v1_1/dstot0fta/image/upload', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'Error en Cloudinary');
      }

      if (result.secure_url) {
        setFormData({
          ...formData,
          imagen_url: result.secure_url
        });
        setError(null);
        console.log('Imagen subida:', result.secure_url);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(`Error al subir: ${err.message}`);
    } finally {
      setUploadingImage(false);
      document.getElementById('image-upload').value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const servicioData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio_clp: parseInt(formData.precio_clp),
        duracion_minutos: parseInt(formData.duracion_minutos),
        imagen_url: formData.imagen_url || null
      };

      if (editando) {
        await actualizarServicio(editando, servicioData);
        setSuccess('Servicio actualizado exitosamente');
      } else {
        await crearServicio(servicioData);
        setSuccess('Servicio creado exitosamente');
      }

      handleCloseDialog();
      cargarServicios();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar servicio');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
      await eliminarServicio(id);
      setSuccess('Servicio eliminado exitosamente');
      cargarServicios();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar servicio');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContentCutIcon fontSize="large" />
            Gestión de servicios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los servicios que ofreces
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Nuevo servicio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card elevation={3}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Descripción</strong></TableCell>
                  <TableCell align="center"><strong>Duración</strong></TableCell>
                  <TableCell align="right"><strong>Precio</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {servicios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" py={4}>
                        No hay servicios registrados. Crea uno nuevo para comenzar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  servicios.map((servicio) => (
                    <TableRow key={servicio.id} hover>
                      <TableCell>{servicio.nombre}</TableCell>
                      <TableCell>{servicio.descripcion || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${servicio.duracion_minutos} min`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <strong>${servicio.precio_clp.toLocaleString('es-CL')}</strong>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(servicio)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleEliminar(servicio.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editando ? 'Editar servicio' : 'Nuevo servicio'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                name="nombre"
                label="Nombre del servicio"
                value={formData.nombre}
                onChange={handleChange}
                required
                autoFocus
              />
              <TextField
                fullWidth
                name="descripcion"
                label="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                type="number"
                name="precio_clp"
                label="Precio (CLP)"
                value={formData.precio_clp}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 1000 }}
              />
              <TextField
                fullWidth
                name="duracion_minutos"
                label="Duración (minutos)"
                value={formData.duracion_minutos}
                onChange={handleChange}
                required
                inputProps={{ min: 15, step: 15 }}
                helperText="Por defecto: 60 minutos (1 hora)"
              />
              
              <Box sx={{ 
                border: '2px dashed', 
                borderColor: 'divider', 
                borderRadius: 2, 
                p: 2, 
                backgroundColor: 'background.default' 
              }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Imagen del servicio
                </Typography>
                
                {formData.imagen_url && (
                  <Box sx={{ mb: 2 }}>
                    <img 
                      src={formData.imagen_url} 
                      alt="preview" 
                      style={{ 
                        width: '100%', 
                        height: '200px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }} 
                    />
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() => setFormData({ ...formData, imagen_url: '' })}
                    >
                      Quitar imagen
                    </Button>
                  </Box>
                )}
                
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(e)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => document.getElementById('image-upload').click()}
                  fullWidth
                  disabled={uploadingImage}
                  sx={{ 
                    py: 1.5, 
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    },
                    '&:disabled': {
                      backgroundColor: '#bdbdbd'
                    }
                  }}
                >
                  {uploadingImage ? 'Subiendo...' : 'Seleccionar imagen'}
                </Button>
              </Box>
              
              <TextField
                fullWidth
                name="imagen_url"
                label="O pega una URL de imagen (opcional)"
                value={formData.imagen_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                size="small"
                helperText="También puedes pegar una URL manualmente"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editando ? 'Guardar cambios' : 'Crear servicio'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
