import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { ViewProductComponent } from './view-product/view-product.component';
import { AddNewProductComponent } from './add-new-product/add-new-product.component';
import { HeaderNavbarComponent } from './header-navbar/header-navbar.component';
import { AllProductListsComponent } from './all-product-lists/all-product-lists.component';
import { CheckoutPageComponent } from './checkout-page/checkout-page.component';


const routes: Routes = [
  {
    path:'', component:HeaderNavbarComponent, children:[
      // { path: '', component: LoginSignupComponent },
      {path:'', component:AllProductListsComponent},
      {path:'home', component:AllProductListsComponent},
      { path: 'AddNew', component: AddNewProductComponent },
      {path:"ViewProduct", component:ViewProductComponent},
      {path:"ViewProduct/:id", component:ViewProductComponent},
      {path:"checkout", component:CheckoutPageComponent},
      {path:"checkout/:ids", component:CheckoutPageComponent},
    ]
  }
]

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
    exports: [RouterModule]
  })

export class AppRoutingModule { }