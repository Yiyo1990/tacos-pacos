import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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

  constructor(private router: Router, private authService: AuthService){}

  onLogin(){
    let result = this.authService.login(this.email, this.password)
    if(result) {
      this.router.navigate(['/sucursal'])
    } else {
      this.messageAlert = "El usuario y/o contraseña no son los correctos"
      this.showAlert = true
      setTimeout(() => {
        this.showAlert = false
      }, 3000)
    }
  }

}
