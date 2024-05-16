import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Route, Router } from '@angular/router';
import { SucursalOptionService } from './sucursal-option.service';
import { Marca } from '../models/model';
import { LoadingService } from '../components/loading/loading.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sucursal-option',
  templateUrl: './sucursal-option.component.html',
  styleUrls: ['./sucursal-option.component.scss']
})
export class SucursalOptionComponent implements OnInit {

  marcas?: [Marca]
  sucursalesPorMarca: any = []
  usuario: any = {}
  marcaSelected: any = {}

  showAlert: boolean = false
  messageAlert: string = ""

  constructor(private route: Router, private authService: AuthService, private service: SucursalOptionService, private loading: LoadingService, private toast: ToastrService) {
    this.usuario = JSON.parse(authService.getUserLogged())
  }

  ngOnInit(): void {
    this.callServiceGetMarcas()
  }

  /**
   * Evento para la opción de <select> Marca
   * @param event 
   */
  onChangeMarca(event: any): void {
    let marcaSelected = this.marcas?.find((m: any) => m.id == event.target.value)
    this.sucursalesPorMarca = marcaSelected?.branchs
    this.marcaSelected = { id: marcaSelected?.id, nombre: marcaSelected?.name, logo: marcaSelected?.iconAsset, branchs: null }
  }

  /**
   * Evento para la opción de <select> Sucursal
   * @param event 
   */
  onChangeSucursal(event: any): void {
    let sucursalSelected = this.sucursalesPorMarca.find((s: any) => s.id == event.target.value)
    this.marcaSelected = { ...this.marcaSelected, sucursal: sucursalSelected }
  }

  /**
   * Click boton iniciar para ir a la pagina de Dashboard
   */
  goDashboard(): void {
    if (Object.keys(this.marcaSelected).length > 0 && this.marcaSelected.sucursal) {
      sessionStorage.setItem('marcaSeleccionada', JSON.stringify(this.marcaSelected.sucursal))
      this.route.navigate(['/dashboard/inicio'])
    } else {
      this.messageAlert = "Favor de seleccionar todas las opciones"
      this.showAlert = true
      setTimeout(() => {
        this.showAlert = false
      }, 3000)
    }
  }

  /**
   * Llamado de servicio para obtener el arbol de marcas
   */
  callServiceGetMarcas() {
    this.loading.start()
    this.service.getMarcas().subscribe({
      next: (resp: any) => {
        this.marcas = resp
      },
      error: (e) => {
        this.toast.error("Ha ocurrido un error, intente mas tarde")
        this.loading.stop()
      },
      complete: () => {
        this.loading.stop()
      }
    })
  }
}
