import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const drawerWidth = 260;

const menuItems = [
  { 
    text: 'Configuración de horarios', 
    icon: AccessTimeIcon, 
    path: '/admin/horarios',
    exact: true 
  },
  { 
    text: 'Gestión de servicios', 
    icon: ContentCutIcon, 
    path: '/admin/servicios' 
  },
  { 
    text: 'Todas las citas', 
    icon: EventIcon, 
    path: '/admin/citas' 
  },
  { 
    text: 'Lista de usuarios', 
    icon: PeopleIcon, 
    path: '/admin/usuarios' 
  },
];

export default function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleUserMenuClose();
  };

  const handleVolverInicio = () => {
    navigate('/');
    handleUserMenuClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{ 
          p: 3, 
          background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
          borderBottom: '1px solid #333'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Panel Admin
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sistema de Gestión
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ flex: 1, px: 1, pt: 2 }}>
        {menuItems.map((item) => {
          const isSelected = item.exact 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#000',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#000',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleVolverInicio}
          sx={{
            borderRadius: 2,
            border: '1px solid #333',
          }}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Volver al inicio"
            primaryTypographyProps={{ fontSize: '0.9rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />

          <Box
            onClick={handleUserMenuOpen}
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
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', color: '#000' }}>
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

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            disableScrollLock={true}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {usuario?.nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Administrador
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleVolverInicio}>
              <HomeIcon sx={{ mr: 1 }} fontSize="small" />
              Volver al inicio
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: '1px solid #333',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
        }}
      >
        <Outlet />
      </Box>
      </Box>
      
      <Footer />
    </Box>
  );
}
