import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonService } from '../common.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../config.service';
import { ConfirmationAlertComponent } from '../popup/confirmation-alert/confirmation-alert.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-header-navbar',
  templateUrl: './header-navbar.component.html',
  styleUrls: ['./header-navbar.component.scss'],
})
export class HeaderNavbarComponent {

  @ViewChild('sidenav') sidenav: MatDrawer;

  containerHeight = '0'; // Default height when drawer is open
  openCartSideNav: boolean = false;
  showCategoryOptions: boolean = false;

  productLength: number = 0;
  roundedTotalPrice: any = 0;

  cartProducts: any[] = [];
  allProducts: any[] = [];

  private subscription: Subscription;

  constructor(private router: Router, private backSVC: CommonService, private config: ConfigService, private dialog: MatDialog) {

    // Subscribe to router events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Log the current route
      this.openCartSideNav = false;
      let url = event.urlAfterRedirects;
      if (!url.includes('AddNew') && !url.includes('ViewProduct') && !url.includes('checkout') && !url.includes('about-us')) {
        this.showCategoryOptions = true;
      } else {
        this.showCategoryOptions = false;
      }
    });

    this.productLength = this.cartProducts.length;
    this.calculateRoundedTotalPrice();

    this.subscription = this.backSVC.countOfCartProducts.subscribe(option => {
      // this.productLength = option;
      this.getCartProducts();
    });

    this.backSVC.selectedOption$.subscribe(option => {
      if (!option) {
        this.openCartSideNav = false;
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onMenuClick(menu: string) {
    if (menu == 'cart') {
      this.openCartSideNav = !this.openCartSideNav;
      this.backSVC.setSelectedOption(menu);
      this.getCartProducts();
    }

    if (menu == 'home') {
      this.openCartSideNav = false;
      this.router.navigate(['']);
    }

    if (menu == 'aboutus') {
      this.openCartSideNav = false;
      this.router.navigate(['about-us']);
    }

    if (menu == 'category') {
      this.backSVC.setSelectedOption(menu);
    }

    this.closeDrawer();
  }

  onMobileMenuClick(menu: string) {
    if (menu == 'home') {
      this.router.navigate(['']);
    }

    if (menu == 'category') {
      this.backSVC.setSelectedOption(menu);
    }

    if (menu == 'cart') {
      this.openCartSideNav = !this.openCartSideNav;
      this.getCartProducts();
    }

    this.closeDrawer();
  }

  async getProductById(productIds) {

    try {

      let response = await this.backSVC.getProductById(productIds);

      if (!response.Success) {
        this.backSVC.openAlertDialogMessage(response.Message);
        return;
      }

      this.allProducts = response.Data;

      this.calculateRoundedTotalPrice();

    } catch (error) {
      this.backSVC.openAlertDialogMessage(error.error.Message);
    }
  }

  async getCartProducts() {
    // Retrieve the cartProducts from localStorage and parse it into an array
    const cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];

    if(this.openCartSideNav && cartProducts.length > 0){
      let allProductsId = this.cartProducts.map(item => item.id).join(',');
      await this.getProductById(allProductsId);
    }

    this.cartProducts = cartProducts;
    this.productLength = this.cartProducts.length;

    cartProducts.forEach(item => {

      let product = this.allProducts.find(x => x.id == item.id);

      if(product){

          item.min_quantity = product.min_quantity;

          item.price = product.price;

          item.product_name = product.product_name;

          item.color = product.color;

          item.size = product.size;

          item.productImages = product.productImages;
      }

      item.selectedColor = item.color[0];
      item.selectedSize = item.size[0];
      item.selectedQty = item.min_quantity;
      
    });

    this.calculateRoundedTotalPrice();
  }

calculateRoundedTotalPricee() {
  const totalPrice = this.cartProducts.reduce((sum, item) => {
      const price = parseFloat(item.price);
      return sum + (isNaN(price) ? 0 : price); 
  }, 0);

  // Format the rounded total price in INR format
  this.roundedTotalPrice = Math.round(totalPrice).toLocaleString('en-IN');
}

calculateRoundedTotalPrice() {
  const totalPrice = this.cartProducts.reduce((sum, item) => {
      const price:any = item.price * item.selectedQty || item.min_quantity;
      const amount = parseFloat(price);
      return sum + (isNaN(amount) ? 0 : amount); 
  }, 0);

  this.roundedTotalPrice = Math.round(totalPrice).toLocaleString('en-IN');
}

 // Function to format the price in INR format
 getFormattedPrice(product) {
  return '₹' + Math.round(product.price).toLocaleString('en-IN');
}


  closeDrawer() {
    this.containerHeight = '0';
    this.sidenav.close(); // Programmatically close the drawer
  }

  // Method called when the drawer is opened
  onDrawerOpened() {
    this.containerHeight = '100vh'; // Restore full height when drawer is open
    this.openCartSideNav = false;
  }

  // Method called when the drawer is closed
  onDrawerClosed() {
    this.containerHeight = '0'; // Set height to 0 when drawer is closed
  }

  onCloseButton() {
    this.openCartSideNav = false;
  }

  addToCart(product: any, comingFormBuyNow?) {
    // Retrieve the existing cartProducts from localStorage, or initialize an empty array if not found
    let cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];

    // Check if the product already exists in the cart. Assuming product has a unique identifier like 'id'.
    const productExists = cartProducts.some(cartProduct => cartProduct.id === product.id);

    if (productExists) {
      // If the product is already in the cart, log a message and return only if it is not clicked again
      if (!comingFormBuyNow) {
        this.backSVC.openAlertDialogMessage('This product is already in your cart. Feel free to review it in your cart or continue shopping.');
      }
      return;
    }

    // Add the new product to the array
    cartProducts.push(product);

    // Store the updated cartProducts array back into localStorage
    localStorage.setItem("cartProducts", JSON.stringify(cartProducts));

    // Update the cart count
    this.backSVC.updateCartCount(cartProducts.length);
  }

  onBuyNowClick(product: any, comingFormBuyNow?) {

    // adding the product to cart if the user clicked on buy now button.
    this.addToCart(product, comingFormBuyNow);

    let encryptedId = this.config.encrypt(product.id.toString());
    let encodedString = encodeURIComponent(encryptedId);

    const productInfo = [{ id:product.id, minQty: product.selectedQty, selectedColor: product.selectedColor, selectedSize: product.selectedSize }];
    // sending additional details over the route to checkout page
    this.router.navigate([`checkout/${encodedString}`], {
      state: { productDetails: productInfo }
    });

    // this.router.navigate([`checkout/${encodedString}`]);
  }

  onCheckOutAll() {
    let allProductsId = this.cartProducts.map(item => item.id).join(',');
    let encryptedId = this.config.encrypt(allProductsId);
    let encodedURI = encodeURIComponent(encryptedId);

    const productInfo = [];
    this.cartProducts.forEach(item => {
      productInfo.push({
        id:item.id, 
        minQty: item.selectedQty, 
        selectedColor: item.selectedColor, 
        selectedSize: item.selectedSize 
      });
    });

    // sending additional details over the route to checkout page
    this.router.navigate([`checkout/${encodedURI}`], {
      state: { productDetails: productInfo }
    });

    // this.router.navigate([`checkout/${encodedURI}`]);
  }

  removeFromCart(product: any) {

    this.openCartSideNav = false;

    const dialogRef = this.dialog.open(ConfirmationAlertComponent, {
      // height: '300px',
      // width: '500px',
      data: { message: `Are you sure want to delete "${product.product_name}" from the cart?` }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data.toLowerCase() == 'yes') {
        // Retrieve the existing cartProducts from localStorage, or initialize an empty array if not found
        let cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];

        // Find the index of the product to be removed. Assuming product has a unique identifier like 'id'.
        const index = cartProducts.findIndex(cartProduct => cartProduct.id === product.id);

        // If the product is found, remove it from the array
        if (index !== -1) {
          cartProducts.splice(index, 1);

          // Update localStorage with the modified array
          localStorage.setItem("cartProducts", JSON.stringify(cartProducts));

          this.backSVC.updateCartCount(cartProducts.length);
          this.cartProducts = cartProducts;
          this.calculateRoundedTotalPrice();
        } else {
          this.backSVC.openAlertDialogMessage('Product not found in the cart.');
        }
      }
    });
  }

  onProductClick(product: any) {
    this.router.navigate([`/ViewProduct/${product.id}`]);
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStars = Math.ceil(rating - fullStars);
    const stars = Array(fullStars).fill('star');
    if (halfStars) stars.push('star_half');
    return stars;
  }

  selectSize(product:any, size: any) {
    product.selectedSize = size;
  }

  selectColor(product:any, color: any) {
    product.selectedColor = color;
  }

  decreaseQuantity(product:any) {
    if (product.selectedQty < product.min_quantity) {
      product.selectedQty = product.min_quantity;
      this.calculateRoundedTotalPrice();
      return;
    }
    product.selectedQty --;

    this.calculateRoundedTotalPrice();
  }

  increaseQuantity(product:any) {
    product.selectedQty ++;
    this.calculateRoundedTotalPrice();
  }

  // to handle input change
  onQuantityChange(event: Event, product:any): void {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.value;

    // Prevent decreasing below the min_quantity
    if (!newValue) {
      inputElement.value = product.selectedQty.toString();
      return;
    }
    
    product.selectedQty = parseInt(newValue, 10);

    if (product.selectedQty < product.min_quantity) {
      product.selectedQty = product.min_quantity;
    }

    this.calculateRoundedTotalPrice();
  }

// handle keydown events and prevent deletion below min_quantity
onKeyDown(event: KeyboardEvent, product: any): void {
  const inputElement = event.target as HTMLInputElement;
  const currentValue = inputElement.value;

  if (parseInt(currentValue, 10) <= product.min_quantity) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault(); 
    }
  }
}

}
