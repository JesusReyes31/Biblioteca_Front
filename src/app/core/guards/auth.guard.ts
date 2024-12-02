import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tipoUsuario = sessionStorage.getItem('tipoUss');
  
  // Definir rutas permitidas por tipo de usuario
  const rutasPermitidas: { [key: string]: string[] } = {
    'Anonimo': [
      '/catalogo',
      '/informacion',
    ],
    'Cliente': [
      '/catalogo',
      '/informacion',
      '/reservas',
      '/historial-prestamos',
      '/compras',
      '/recibo/:id',
      '/credencial',
      '/perfil',
      '/carrito',
      '/metodos-pago',
      '/pago-carrito',
      '/confirmacion-pago'
    ],
    'Prestamos': [
      '/catalogo',
      '/informacion',
      '/reservas',
      '/historial-prestamos',
      '/compras',
      '/recibo/:id',
      '/credencial',
      '/perfil',
      '/carrito',
      '/metodos-pago',
      '/pago-carrito',
      '/confirmacion-pago',
      '/registrar-usuarios',
      '/prestamos',
      '/devoluciones',
      '/ventas-por-entregar',
    ],
    'Inventario': [
      '/catalogo',
      '/informacion',
      '/reservas',
      '/historial-prestamos',
      '/compras',
      '/recibo/:id',
      '/credencial',
      '/perfil',
      '/carrito',
      '/metodos-pago',
      '/pago-carrito',
      '/confirmacion-pago',
      '/registrar-libros',
    ],
    'Admin Sucursal': [
      '/registrar-usuarios',
      '/prestamos-generales',
      '/perfil',
      '/credencial',
      '/reportes'
    ],
    'Admin': [
      '/sucursales',
      '/registrar-usuarios',
      '/perfil',
      '/credencial'
    ]
  };

  // Si no hay usuario autenticado, redirigir al login
  if (!tipoUsuario) {
    router.navigate(['/login']);
    return false;
  }

  // Obtener las rutas permitidas para el tipo de usuario
  const permisosUsuario = rutasPermitidas[tipoUsuario];
  
  // Verificar si la ruta actual está permitida
  const rutaActual = state.url.split('?')[0]; // Eliminar query params si existen
  const tienePermiso = permisosUsuario?.some(ruta => rutaActual.startsWith(ruta));

  if (!tienePermiso) {
    // Redirigir al catálogo si no tiene permiso
    router.navigate(['/acceso-denegado']);
    return false;
  }

  return true;
};
