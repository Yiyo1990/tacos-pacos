import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Pages } from 'src/app/util/util';


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
    {id: 1, nombre: Pages.MAIN, icon: 'fas fa-home', link: 'inicio'},
    {id: 2, nombre: Pages.RESULT, icon: 'fas fa-circle-up', link: 'resultados'},
    {id: 3, nombre: Pages.INDICATOR, icon: 'fas fa-chart-simple', link: 'indicadores'},
    {id: 4, nombre: Pages.CASH, icon: 'fas fa-money-bill-transfer', link: 'flujo-efectivo'},
    {id: 5, nombre: Pages.ESTIMATES, icon: 'fas fa-money-bill-trend-up', link: 'estimaciones-profit'},
    {id: 6, nombre: Pages.ANALISIS, icon: 'fas fa-gauge', link: 'analisis-costo'},
    {id: 7, nombre: Pages.INVENTARIO, icon: 'fas fa-layer-group', link: 'inventarios'},
    {id: 8, nombre: Pages.EXPENSES, icon: 'fas fa-layer-group', link: 'gastos'},
    {id: 9, nombre: Pages.SUPPLIER, icon: 'fas fa-layer-group', link: 'proveedores'},
    {id: 10, nombre: Pages.SALES, icon: 'fas fa-layer-group', link: 'ventas'}
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
