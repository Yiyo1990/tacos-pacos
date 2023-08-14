import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  isMenuOpen: boolean = false;
  usuario: any = {}
  marcaSeleccionada : any = {}

  menuList = [
    {id: 1, nombre: 'Inicio', icon: 'fas fa-home', link: 'dashboard/inicio'},
    {id: 2, nombre: 'Resultados', icon: 'fas fa-circle-up', link: 'dashboard/resultados'},
    {id: 3, nombre: 'Indicadores', icon: 'fas fa-chart-simple', link: 'dashboard/indicadores'},
    {id: 4, nombre: 'Cash Flow', icon: 'fas fa-money-bill-transfer', link: 'dashboard/flujo-efectivo'},
    {id: 5, nombre: 'Estimaciones Profit %', icon: 'fas fa-money-bill-trend-up', link: 'dashboard/estimaciones-profit'},
    {id: 6, nombre: 'Análisis', icon: 'fas fa-gauge', link: 'dashboard/analisis-costo'},
    {id: 7, nombre: 'Inventarios', icon: 'fas fa-layer-group', link: 'dashboard/inventarios'}
  ]

  constructor(private router: Router, private authService: AuthService) {
    this.usuario = JSON.parse(authService.getUserLogged())
    let marcaSeleccionada = sessionStorage.getItem('marcaSeleccionada') 
    this.marcaSeleccionada = JSON.parse(marcaSeleccionada == null ? '': marcaSeleccionada)

    console.log(this.marcaSeleccionada)
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }
}
