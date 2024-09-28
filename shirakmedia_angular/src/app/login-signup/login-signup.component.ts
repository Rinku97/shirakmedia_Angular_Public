import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ConfigService } from '../config.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.scss']
})
export class LoginSignupComponent {

  loginForm: FormGroup;
  signupForm: FormGroup;
  activeForm: 'login' | 'signup' = 'login'; // Default to login form

  constructor(private fb: FormBuilder, private configSvc:ConfigService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required], // New field for confirm password
      mobileNumber: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator // Custom validator function for password match
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password').value;
    const confirmPassword = group.get('confirmPassword').value;
  
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Convenience getter for easy access to form fields
  get lf() { return this.loginForm.controls; }
  get sf() { return this.signupForm.controls; }

  // Switch between login and signup forms
  toggleForm(form: 'login' | 'signup') {
    this.activeForm = form;
  }

  // Submit login form
  async onSubmitLogin() {
    // if (this.loginForm.valid) {
    //   // Implement login functionality here
    //   let email = this.configSvc.encrypt(this.loginForm.value.email);
    //   let password = this.configSvc.encrypt(this.loginForm.value.password);
    //   let response = await this.backSvc.login(email, password);
      
    //   if (!response.success) {
    //     this.backSvc.openDialogMessage(response.message, 'digitalSignature');
    //     return;
    //   }

    //   let encryptedToken = this.configSvc.encrypt(response.data.token);
    //   localStorage.setItem('UserToken', encryptedToken);
    //   this.backSvc.openDialogMessage(response.data.message,'DigitalSignature', true, false, 'home');
    //   this.loginForm.reset();
    // } else {
    //   this.loginForm.markAllAsTouched(); // Mark fields as touched to display validation messages
    // }
  }

  // Submit signup form
  async onSubmitSignup() {
    // if (this.signupForm.valid) {
    //   // Get form values and encrypt password
    //   const { username, firstName, lastName, email, mobileNumber, password } = this.signupForm.value;
    //   const encryptedPassword = this.configSvc.encrypt(password);

    //   // Format the current date to match SQL DATETIME format
    //   const registrationDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');

    //   // Create the user object
    //   const userObject = {
    //     UserName: username,
    //     FirstName: firstName,
    //     LastName: lastName,
    //     Email: email,
    //     Password: encryptedPassword,
    //     MobileNumber: mobileNumber,
    //     RegistrationDate: registrationDate
    //   };

    //   console.log('User Object:', userObject);

    //   let response = await this.backSvc.addUser(userObject);
      
    //   if (!response.success) {
    //     this.backSvc.validateAPIResponse(response);
    //     return;
    //   }

    //   this.backSvc.openDialogMessage("Congratulations! Your registration was successful. Please login with your credentials.", 'digitalSignature', true);
    //   this.signupForm.reset();
    //   this.toggleForm('login');

    // } else {
    //   this.signupForm.markAllAsTouched(); // Mark fields as touched to display validation messages
    // }
  }

}
