import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit{

 // constructor( private fb: FormBuilder ){} ES LO MISMO QUE :
  private fb=    inject(FormBuilder);
  private authService = inject( AuthService );
  private router      = inject( Router )

  public myForm: FormGroup=this.fb.group({
    email:['zaida@prueba.com',[Validators.required,Validators.email]],
    password:['abcdefg',[Validators.required,Validators.minLength(6)]]

  } )

  ngOnInit(): void {
    //throw new Error('Method not implemented.');
  }

  login(){
    const { email, password } = this.myForm.value;


    this.authService.login(email, password)
      .subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: (message) => {
          Swal.fire('Error', message, 'error' )
        }
      })
  }


}
