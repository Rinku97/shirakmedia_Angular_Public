import { Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.scss']
})
export class AboutPageComponent {

  phoneNumber:string = "+91 98999 00237";
  emailTo:string = "shirakmedia@gmail.com";

  constructor() { }

  ngOnInit(): void {
  }

}
