import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = ""
  password: string = ""
  showAlert: boolean = false
  messageAlert: string = ""

  constructor(private router: Router, private authService: AuthService, private toast: ToastrService){}

  onLogin(){
    let result = this.authService.login(this.email, this.password)
    if(result) {
      this.router.navigate(['/sucursal'])
    } else {
      this.toast.warning("Usuario y/o contraseña no son correctos")
    }
  }

}
