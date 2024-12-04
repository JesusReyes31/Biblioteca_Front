import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DatosService } from '../services/users/datos.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const datos = inject(DatosService)
  const tipoUsuario = datos.getTipoUss();
  
  // Definir rutas permitidas por tipo de usuario
  const rutasPermitidas: { [key: string]: string[] } = {
    'Anonimo': [
      '/catalogo',
      '/informacion',
    ],
    'Cliente': [
      '/info-sucursales',
      '/catalogo',
      '/informacion',
      '/reservas',
      '/historial-prestamos',
      '/compras',
      '/recibo',
      '/factura',
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
      '/recibo',
      '/factura',
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
      '/pago-sucursal',
    ],
    'Inventario': [
      '/catalogo',
      '/informacion',
      '/reservas',
      '/historial-prestamos',
      '/compras',
      '/recibo',
      '/factura',
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
      '/reportes',
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
