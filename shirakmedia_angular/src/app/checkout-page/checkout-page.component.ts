import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../common.service';
import { ShowLargeImageComponent } from '../popup/show-large-image/show-large-image.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../config.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss']
})
export class CheckoutPageComponent {

  @ViewChild('formGroupDirective') formGroupDirective: FormGroupDirective;

  checkoutForm: FormGroup;
  formFields: any[] = [
    {
      "name": "firstName",
      "label": "First Name",
      "type": "text",
      "validation": ["required"]
    },
    {
      "name": "lastName",
      "label": "Last Name",
      "type": "text",
      "validation": ["required"]
    },
    {
      "name": "email",
      "label": "Email",
      "type": "email",
      "validation": ["required", "email"]
    },
    {
      "name": "phoneNumber",
      "label": "Phone Number",
      "type": "text",
      "validation": ["required", "pattern"],
      "pattern": "^[0-9]{10}$"
    },
    {
      "name": "deliveryLocation",
      "label": "Delivery Location",
      "type": "text",
      "validation": ["required"]
    },
    {
      "name": "additionalInfo",
      "label": "Additional Information",
      "type": "textarea",
      "validation": []
    }
  ];

  products: any[] = [];
  productIds: any;
  roundedTotalPrice: any = 0;

  productInfo:any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient,
    private router: Router, private backSVC: CommonService, private config: ConfigService,private location: Location,
    private dialog: MatDialog, private ActRoute: ActivatedRoute) {
    let productIds = this.ActRoute.snapshot.paramMap.get('ids');
    let decodedURI = decodeURIComponent(productIds);
    this.productIds = this.config.decrypt(decodedURI);

    const state = this.location.getState() as { productDetails: any };
    if (state) {
      this.productInfo = state.productDetails;
      console.log(this.productInfo);
    }

    this.getProductById();
  }

  ngOnInit(): void {
    this.createFormControls();
  }

  async getProductById() {

    try {

      let response = await this.backSVC.getProductById(this.productIds);

      if (!response.Success) {
        this.backSVC.openAlertDialogMessage(response.Message);
        return;
      }

      this.products = response.Data;

      if(this.products.length > 0){
        if(this.productInfo && this.productInfo.length > 0){

          this.products.forEach(item => {
            let product = this.productInfo.find(x => x.id == item.id);
            item.selectedColor = product.selectedColor;
            item.selectedSize = product.selectedSize;
            item.min_quantity = item.min_quantity > product.minQty ? item.min_quantity : product.minQty;
          });
        }
      }

      console.log(this.products);

      this.calculateRoundedTotalPrice();

    } catch (error) {
      this.backSVC.openAlertDialogMessage(error.error.Message);
    }
  }

  calculateRoundedTotalPrice() {
    const totalPrice = this.products.reduce((sum, item) => {
        const price:any = item.price * item.min_quantity;
        const amount = parseFloat(price);
        return sum + (isNaN(amount) ? 0 : amount); 
    }, 0);

    this.roundedTotalPrice = Math.round(totalPrice).toLocaleString('en-IN');
  }


  createFormControls(): void {
    const controls = {};
    this.formFields.forEach(field => {
      let validators = [];
      if (field.validation.includes('required')) {
        validators.push(Validators.required);
      }
      if (field.validation.includes('email')) {
        validators.push(Validators.email);
      }
      if (field.validation.includes('pattern')) {
        validators.push(Validators.pattern(field.pattern || ''));
      }
      controls[field.name] = ['', validators];
    });
    this.checkoutForm = this.fb.group(controls);
  }

  onSubmit(): void {
    if(this.products.length == 0){
      this.backSVC.openAlertDialogMessage("You currently have no orders to check out. Please visit the product page to make a purchase.");
      this.checkoutForm.reset();
      this.formGroupDirective.resetForm();
      return;
    }
    if (this.checkoutForm.valid) {
      this.initiatePayment();
    } else {
      this.backSVC.openAlertDialogMessage("Please fill in all the mandatory fields highlighted in red before continue.")
    }
  }

  initiatePayment(): void {
    const amountInINR = this.products.length > 1 ? this.roundedTotalPrice : this.products[0].price; // Amount in INR
    const number = parseInt(amountInINR.replace(/,/g, ''), 10);
    const amountInPaise = number * 100; 

    // Assuming delivery location is stored in this.checkoutForm
    const deliveryLocation = this.checkoutForm.get('deliveryLocation').value; // Get the delivery location
    // Collect product details (title, price, color, quantity)
  const productsInfo = this.productInfo.map(product => ({
    product_Id: product.id,
    color: product.selectedColor.name,
    size: product.selectedSize.name,
    quantity: product.minQty
  }));

    const options = {
      key: 'rzp_test_cVVPrmC1vgnDAj', 
      amount: amountInPaise, 
      currency: 'INR',
      name: 'Shirak Media',
      description: 'Test Transaction',
      image: 'assets/Images/shirakMediaLogo.jpeg',
      handler: (response) => {
        this.onPaymentSuccess(response);
      }, // Bind the context
      prefill: {
        name: this.checkoutForm.get('firstName').value + ' ' + this.checkoutForm.get('lastName').value,
        email: this.checkoutForm.get('email').value,
        contact: this.checkoutForm.get('phoneNumber').value
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: this.onPaymentCancelled.bind(this) // Bind the context
      },
      notes: {
        delivery_location: deliveryLocation,
        productDetails: JSON.stringify(productsInfo)
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
}


  onPaymentSuccess(response: any): void {
    console.log(response);
     // Log order details including payment ID and user details
     const orderDetails = {
      orderId: response.razorpay_payment_id,
      razorpay_payment_id: response.razorpay_payment_id,
      userDetails: {
        name: this.checkoutForm.get('firstName').value + ' ' + this.checkoutForm.get('lastName').value,
        email: this.checkoutForm.get('email').value,
        contact: this.checkoutForm.get('phoneNumber').value,
        deliveryLocation: this.checkoutForm.get('deliveryLocation').value,
      },
      productDetails: this.productInfo
    };

    console.log('Order Details:', orderDetails);

    this.removeFromCart();
    this.products = [];
    this.roundedTotalPrice = 0;

    // Reset the checkout form
    this.checkoutForm.reset();
    this.formGroupDirective.resetForm();

    this.backSVC.openConfirmationDialogMessage(`
      Your payment has been successfully processed, and your order is confirmed. Would you like to return to the home page?`,
       null, true, true, false, false
    );
  }

  onPaymentCancelled(): void {
    this.backSVC.openAlertDialogMessage(`Your payment has been canceled. Please try again later.`, null, true, false, false);
  }

  onPaymentFailure(error: any): void {
    this.backSVC.openAlertDialogMessage(`Payment failed:${error}`, null, true, false, false);
  }

  onProductTitleClick(product: any) {
    this.router.navigate([`ViewProduct/${product.id}`]);
  }

  removeFromCart() {

    let ids = this.productIds.split(',');
    if (ids.length > 0) {

      // Retrieve the existing cartProducts from localStorage, or initialize an empty array if not found
      let cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];

      // checking for the product with each matching id and if found removing that.
      ids.forEach(id => {

        // Find the index of the product to be removed. Assuming product has a unique identifier like 'id'.
        const index = cartProducts.findIndex(cartProduct => cartProduct.id.toString() === id);

        // removing if the item founds
        if (index !== -1) {
          cartProducts.splice(index, 1);
        }

      });

      // Update localStorage with the modified array
      localStorage.setItem("cartProducts", JSON.stringify(cartProducts));

      this.backSVC.updateCartCount(cartProducts.length);
    }
  }

  enlargeImage(product: any): void {
    let sendObj = {
      name: product.productImages[0].name,
      url: product.productImages[0].url
    }
    const dialogRef = this.dialog.open(ShowLargeImageComponent, {
      data: sendObj,
      width: '80%',
      maxWidth: '600px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(data => {
    })
  }

  // Function to format the price in INR format
  getFormattedPrice(product) {
    let price = product.price * product.min_quantity;
    return '₹' + Math.round(price).toLocaleString('en-IN');
  }

}
