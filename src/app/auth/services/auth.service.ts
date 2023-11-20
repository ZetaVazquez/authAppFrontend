import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environments';
import { AuthStatus,User,LoginResponse,CheckTokenResponse } from '../interfaces/';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

//!Declaraciones//////////////////////////////////////////////////////

  private readonly baseUrl: string = environment.baseUrl;
  private http = inject( HttpClient );

// Así nadie fuera del servicio podrá< cambiar los valores
  private _currentUser = signal<User|null>(null);
  private _authStatus = signal<AuthStatus>( AuthStatus.checking );

  //---!!!!!!!!!!!!!Al mundo exterior=(cualquier cosa que esté fuera del servicio)
  public currentUser = computed( () => this._currentUser() );
  public authStatus = computed( () => this._authStatus() );

//! Para el login y su autenticacion////////////////////////////////////////////////////////
  private setAuthentication(user: User, token:string): boolean {

    this._currentUser.set( user );
    this._authStatus.set( AuthStatus.authenticated );
    localStorage.setItem('token', token);

    return true;
  }
////////////////////////////////////////////////////////////////////////////////////////////
  login( email: string, password: string ): Observable<boolean> {
    // Construir la URL para la solicitud de inicio de sesión utilizando el baseUrl del entorno
    const url  = `${ this.baseUrl }/auth/login`;

    // Construir el cuerpo de la solicitud que se enviará al backend
    //Lo que se vava enviar al backend. t<ambien se puede escribir:{ email:email, password:password }
    const body = { email, password };

    //esto es lo que se envia como peticion al backend. URL y email y password
   //Realizar una solicitud HTTP POST al backend para el inicio de sesión
    return this.http.post<LoginResponse>( url, body )
      .pipe(
        // Utilizar el operador 'map' para procesar la respuesta exitosa del backend
        map( ({ user, token }) => this.setAuthentication( user, token )),
          // Utilizar el operador 'catchError' para manejar errores de la solicitud
        catchError( err => throwError( () => err.error.message ))
      );
  }

///////////////////////////////////////////////////////////////////////////////////////////

  constructor() {
    this.checkAuthStatus().subscribe();
  }

/////////////////////////////////////////////////////////////////////////////////////////
  checkAuthStatus():Observable<boolean> {

    const url   = `${ this.baseUrl }/auth/check-token`;
    const token = localStorage.getItem('token');

    if ( !token ) {
      this.logout();
      return of(false);
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${ token }`);


      return this.http.get<CheckTokenResponse>(url, { headers })
        .pipe(
          map( ({ user, token }) => this.setAuthentication( user, token )),
          catchError(() => {
            this._authStatus.set( AuthStatus.notAuthenticated );
            return of(false);
          })
        );


  }
  
/////////////////////////////////////////////////////////////////////////////////
  logout() {
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this._authStatus.set( AuthStatus.notAuthenticated );

  }

}
