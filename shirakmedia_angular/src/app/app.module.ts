import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { FileUploadModule } from 'ng2-file-upload';
import { AppRoutingModule } from './app.routing.module';
import { CommonModule } from '@angular/common';
import { ViewProductComponent } from './view-product/view-product.component';
import { ShowLargeImageComponent } from './popup/show-large-image/show-large-image.component';
import { HeaderNavbarComponent } from './header-navbar/header-navbar.component';
import { AlertComponent } from './popup/alert/alert.component';
import { AllProductListsComponent } from './all-product-lists/all-product-lists.component';
import { CheckoutPageComponent } from './checkout-page/checkout-page.component';
import { ConfirmationAlertComponent } from './popup/confirmation-alert/confirmation-alert.component';
import { ConfigService } from './config.service';
import { AboutPageComponent } from './about-page/about-page.component';

export function initializeApp(configService: ConfigService): () => Promise<any> {
  return () => configService.loadConfig();
}

@NgModule({
  declarations: [
    AppComponent,
    ViewProductComponent,
    ShowLargeImageComponent,
    HeaderNavbarComponent,
    AlertComponent,
    AllProductListsComponent,
    CheckoutPageComponent,
    ConfirmationAlertComponent,
    AboutPageComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgHttpLoaderModule.forRoot(),
    FileUploadModule,
    MaterialModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
