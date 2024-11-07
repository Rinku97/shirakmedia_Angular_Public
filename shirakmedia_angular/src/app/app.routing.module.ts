import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewProductComponent } from './view-product/view-product.component';
import { HeaderNavbarComponent } from './header-navbar/header-navbar.component';
import { AllProductListsComponent } from './all-product-lists/all-product-lists.component';
import { CheckoutPageComponent } from './checkout-page/checkout-page.component';
import { AboutPageComponent } from './about-page/about-page.component';


const routes: Routes = [
  {
    path:'', component:HeaderNavbarComponent, children:[
      {path:'', component:AllProductListsComponent},
      {path:'home', component:AllProductListsComponent},
      {path:"ViewProduct/:id", component:ViewProductComponent},
      {path:"checkout", component:CheckoutPageComponent},
      {path:"checkout/:ids", component:CheckoutPageComponent},
      {path:"about-us", component:AboutPageComponent},
    ]
  }
]

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
    exports: [RouterModule]
  })

export class AppRoutingModule { }