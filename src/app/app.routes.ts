import { Routes } from '@angular/router';

import { ClienteComponent } from './features/cliente/cliente.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RecoveryComponent } from './features/auth/recovery/recovery.component';
import { ResetPassComponent } from './features/auth/reset-pass/reset-pass.component';
import { resetPassGuard } from './core/guards/reset-pass.guard';
import { CatalogoComponent } from './core/components/catalogo/catalogo.component';
import { InformacionComponent } from './core/components/informacion/informacion.component';
import { informacionGuard } from './core/guards/informacion.guard';
import { LibrosReservadosComponent } from './features/cliente/libros-reservados/libros-reservados.component';
import { HistorialPrestamoComponent } from './features/cliente/historial-prestamo/historial-prestamo.component';
import { CredencialComponent } from './core/components/credencial/credencial.component';
import { HistorialComprasComponent } from './features/cliente/historial-compras/historial-compras.component';
import { InventarioComponent } from './features/cliente/inventario/inventario.component';
import { PrestamosComponent } from './features/cliente/prestamos/prestamos.component';
import { PrestarLibrosComponent } from './features/cliente/prestamos/prestar-libros/prestar-libros.component';
import { DevolverLibrosComponent } from './features/cliente/prestamos/devolver-libros/devolver-libros.component';
import { VentasPorEntregarComponent } from './features/cliente/prestamos/ventas-por-entregar/ventas-por-entregar.component';
import { PrestamosGeneralesComponent } from './features/cliente/AdminSuc/prestamos-generales/prestamos-generales.component';
import { CambiarInformacionComponent } from './core/components/cambiar-informacion/cambiar-informacion.component';
import { CarritoComponent } from './core/components/carrito/carrito.component';
import { MetodosPagoComponent } from './core/components/metodos-pago/metodos-pago.component';
import { PagoCarritoComponent } from './core/components/carrito/pago-carrito/pago-carrito.component';
import { ConfirmacionPagoComponent } from './core/components/carrito/confirmacion-pago/confirmacion-pago.component';
import { ActivateComponent } from './core/components/activate/activate.component';
import { AdminComponent } from './features/cliente/admin/admin.component';
import { ReciboComponent } from './shared/components/recibo/recibo.component';
import { PagoSucursalComponent } from './features/cliente/prestamos/pago-sucursal/pago-sucursal.component';
import { authGuard } from './core/guards/auth.guard';
import { AccesoDenegadoComponent } from './shared/components/acceso-denegado/acceso-denegado.component';
import { ReportesComponent } from './features/cliente/AdminSuc/reportes/reportes.component';
import { FacturaComponent } from './shared/components/factura/factura.component';
import { SucursalesComponent } from './features/cliente/sucursales/sucursales.component';

export const routes: Routes = [
    {
        path:"",component:ClienteComponent,
        children:[
            {path:"catalogo",component:CatalogoComponent,canActivate:[authGuard]},
            {path:"informacion",component:InformacionComponent,canActivate:[informacionGuard,authGuard]},
            {path:"reservas",component:LibrosReservadosComponent,canActivate:[authGuard]},
            {path:"historial-prestamos",component:HistorialPrestamoComponent,canActivate:[authGuard]},
            {path:"compras",component:HistorialComprasComponent,canActivate:[authGuard]},
            {path:"recibo/:id",component:ReciboComponent,canActivate:[authGuard]},
            {path:"factura/:id",component:FacturaComponent,canActivate:[authGuard]},
            {path:"credencial",component:CredencialComponent,canActivate:[authGuard]},
            {path:"registrar-libros",component:InventarioComponent,canActivate:[authGuard]},
            {path:"registrar-usuarios",component:PrestamosComponent,canActivate:[authGuard]},
            {path:"prestamos",component:PrestarLibrosComponent,canActivate:[authGuard]},
            {path:"devoluciones",component:DevolverLibrosComponent,canActivate:[authGuard]},
            {path:"ventas-por-entregar",component:VentasPorEntregarComponent,canActivate:[authGuard]},
            {path:"prestamos-generales",component:PrestamosGeneralesComponent,canActivate:[authGuard]},
            {path:"perfil",component:CambiarInformacionComponent,canActivate:[authGuard]},
            {path:"carrito",component:CarritoComponent,canActivate:[authGuard]},
            {path:"metodos-pago",component:MetodosPagoComponent,canActivate:[authGuard]},
            {path:"pago-carrito",component:PagoCarritoComponent,canActivate:[authGuard]},
            {path:"confirmacion-pago",component:ConfirmacionPagoComponent,canActivate:[authGuard]},
            {path:"sucursales",component:AdminComponent,canActivate:[authGuard]},
            {path: 'pago-sucursal/:id', component: PagoSucursalComponent,canActivate:[authGuard]},
            {path: 'reportes', component: ReportesComponent,canActivate:[authGuard]},
            {path: 'info-sucursales', component: SucursalesComponent,canActivate:[authGuard]}
        ]
    },
    {path:"login",component:LoginComponent},
    {path:"recover",component:RecoveryComponent},
    {path:"activate/:token",component:ActivateComponent},
    {path:"reset-password/:token",component:ResetPassComponent,canActivate:[resetPassGuard]},
    {path:"acceso-denegado",component:AccesoDenegadoComponent},
    {path:"**",redirectTo:""}
];