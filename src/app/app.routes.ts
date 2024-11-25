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

export const routes: Routes = [
    {
        path:"",component:ClienteComponent,
        children:[
            {path:"catalogo",component:CatalogoComponent},
            {path:"informacion",component:InformacionComponent,canActivate:[informacionGuard]},
            {path:"reservas",component:LibrosReservadosComponent},
            {path:"historial-prestamos",component:HistorialPrestamoComponent},
            {path:"compras",component:HistorialComprasComponent},
            {path:"credencial",component:CredencialComponent},
            {path:"registrar-libros",component:InventarioComponent},
            {path:"registrar-usuarios",component:PrestamosComponent},
            {path:"prestamos",component:PrestarLibrosComponent},
            {path:"devoluciones",component:DevolverLibrosComponent},
            {path:"ventas-por-entregar",component:VentasPorEntregarComponent},
            {path:"prestamos-generales",component:PrestamosGeneralesComponent},
            {path:"perfil",component:CambiarInformacionComponent},
            {path:"carrito",component:CarritoComponent},
            {path:"metodos-pago",component:MetodosPagoComponent},
            {path:"pago-carrito",component:PagoCarritoComponent},
            {path:"confirmacion-pago",component:ConfirmacionPagoComponent},
        ]
    },
    {path:"login",component:LoginComponent},
    {path:"recover",component:RecoveryComponent},
    {path:"reset-password/:token",component:ResetPassComponent,canActivate:[resetPassGuard]},
    {path:"**",redirectTo:""}
];