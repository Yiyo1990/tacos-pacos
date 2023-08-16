import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated: boolean = false

  constructor() { }

  login(username: string, password: string) : boolean {
    // llamar servicio de autenticacion


    if(username == 'usuario' && password == '1') {

      const dataUser = {
        usuario: username,
        nombre: 'Usuario',
        token: 'moisomdaosmdaid34344$$#$%%',
      }
      sessionStorage.setItem('dataUser', JSON.stringify(dataUser))

      return true
    }
    return false
  }

  logout() {
    sessionStorage.removeItem('dataUser')
  }

  isAuthenticatedUser(): boolean {
    return sessionStorage.getItem('dataUser') ? true: false
  }

  getUserLogged(): any{
    return sessionStorage.getItem('dataUser')
  }
}

