import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  isMenuOpen: boolean = true;
  usuario: any = {}
  marcaSeleccionada : any = {}
  @Input() brand: any

  menuList = [
    {id: 1, nombre: 'Inicio', icon: 'fas fa-home', link: 'inicio'},
    {id: 2, nombre: 'Resultados', icon: 'fas fa-circle-up', link: 'resultados'},
    {id: 3, nombre: 'Indicadores', icon: 'fas fa-chart-simple', link: 'indicadores'},
    {id: 4, nombre: 'Cash Flow', icon: 'fas fa-money-bill-transfer', link: 'flujo-efectivo'},
    {id: 5, nombre: 'Estimaciones', icon: 'fas fa-money-bill-trend-up', link: 'estimaciones-profit'},
    {id: 6, nombre: 'Análisis', icon: 'fas fa-gauge', link: 'analisis-costo'},
    {id: 7, nombre: 'Inventarios', icon: 'fas fa-layer-group', link: 'inventarios'},
    {id: 8, nombre: 'Gastos', icon: 'fas fa-layer-group', link: 'gastos'},
    {id: 9, nombre: 'Proveedores', icon: 'fas fa-layer-group', link: 'proveedores'},
    {id: 10, nombre: 'Ventas', icon: 'fas fa-layer-group', link: 'ventas'}
  ]

  constructor(private router: Router, private authService: AuthService) {
    this.usuario = JSON.parse(authService.getUserLogged())
    let marcaSeleccionada = sessionStorage.getItem('marcaSeleccionada') 
    this.marcaSeleccionada = JSON.parse(marcaSeleccionada == null ? '': marcaSeleccionada)
  }

  toggleMenu() {
    this.isMenuOpen = true;
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }

  navigate(url: string, params: any) {
    this.router.navigate([`dashboard/${url}`], {state: params})
  }

  getSucursal() {
    return this.brand.sucursal
  }
}
