import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.scss']
})
export class ViewProductComponent {

  products: any[] = [];
  selectedProduct: any;
  selectedImage: any;

  productId: any;
  selectedSize: any = "";
  selectedColor: any = "";
  minQuantity: number = 1;
  quantity: number = 1;

  replyForms: { [key: number]: FormGroup } = {};

  reviewForm: FormGroup;

  quantityControl = new FormControl();

  constructor(private fb: FormBuilder, private backSVC: CommonService, private ActRoute: ActivatedRoute, private cd: ChangeDetectorRef, private router: Router, private config: ConfigService) {
    this.productId = this.ActRoute.snapshot.paramMap.get('id');
    this.reviewForm = this.fb.group({
      comment: [''],
      rating: [0]
    });

    this.getProductById();
  }

  ngOnInit(): void {
    this.quantityControl.valueChanges.subscribe(value => {
      if (value < this.minQuantity) {
        this.quantityControl.setValue(this.minQuantity, { emitEvent: false });
      }
    });
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  addReview(): void {
    if (this.reviewForm.get('comment').value) {
      const newReview = {
        productId: this.productId,
        username: 'User',
        rating: this.reviewForm.value.rating,
        comment: this.reviewForm.value.comment
      };

      this.addProductReviews(newReview);
    } else {
      this.backSVC.openAlertDialogMessage("Please enter your review before proceeding.");
    }
  }

  changeImage(imageUrl: any): void {
    this.selectedImage = imageUrl.url;
  }

  async getProductReviews() {

    try {

      let response = await this.backSVC.getProductReviews(this.productId);

      if (!response.Success) {
        this.backSVC.openAlertDialogMessage(response.Message);
        return;
      }

      this.selectedProduct.reviews = response.Data;
      this.reviewForm.reset();

    } catch (error) {
      this.backSVC.openAlertDialogMessage(error.error.Message);
    }
  }

  async addProductReviews(newReview) {

    try {

      let response = await this.backSVC.addProductReviews(newReview);

      if (!response.Success) {
        this.backSVC.openAlertDialogMessage(response.Message);
        return;
      }

      this.backSVC.openAlertDialogMessage(response.Message);
      this.reviewForm.reset();
      this.getProductReviews();

    } catch (error) {
      this.backSVC.openAlertDialogMessage(error.error.Message);
    }
  }

  async getProductById() {

    try {

      let response = await this.backSVC.getProductById(this.productId);

      if (!response.Success) {
        this.backSVC.openAlertDialogMessage(response.Message);
        return;
      }

      this.selectedProduct = response.Data[0];
      this.selectedImage = this.selectedProduct['productImages'][0].url;

      // if (response.Data[0].color) {
      //   this.selectedProduct.colors = response.Data[0].color;
      // }

      // if (response.Data[0].size) {
      //   this.selectedProduct.sizes = response.Data[0].size;
      // }

      this.minQuantity = this.selectedProduct.min_quantity || 1;

      this.quantityControl.setValue(this.minQuantity);
      this.quantityControl.setValidators([Validators.required, Validators.min(this.minQuantity)]);

      this.quantity = this.minQuantity;

      this.cd.detectChanges();

    } catch (error) {
      this.backSVC.openAlertDialogMessage(error.error.Message);
    }
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStars = Math.ceil(rating - fullStars);
    const stars = Array(fullStars).fill('star');
    if (halfStars) stars.push('star_half');
    return stars;
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  addToCart(product: any, comingFormBuyNow?) {
    // Retrieve the existing cartProducts from localStorage, or initialize an empty array if not found
    let cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];

    // Check if the product already exists in the cart. Assuming product has a unique identifier like 'id'.
    const productExists = cartProducts.some(cartProduct => cartProduct.id === product.id);

    if (productExists) {
      // If the product is already in the cart, log a message and return only if it is not clicked again
      if (!comingFormBuyNow) {
        // informing navbar to hide cart if the popup comes
        this.backSVC.setSelectedOption('');

        this.backSVC.openAlertDialogMessage(`The product "${product.product_name}" is already in your cart. Feel free to review it in your cart or continue shopping.`);
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

    // sending additional details over the route to checkout page
    const productInfoObj = [{ minQty: this.quantityControl.value, selectedColor: this.selectedColor, selectedSize: this.selectedSize }];
    console.log(productInfoObj);
    this.router.navigate([`checkout/${encodedString}`], {
      state: { productDetails: productInfoObj }
    });
  }

  // Function to format the price in INR format
  getFormattedPrice(product) {
    return '₹' + Math.round(product.price).toLocaleString('en-IN');
  }

  selectSize(size: any) {
    this.selectedProduct.selectedSize = size;
    this.selectedSize = size;
  }

  selectColor(color: any) {
    this.selectedProduct.selectedColor = color;
    this.selectedColor = color;
  }

  validateQuantity(product: any, comingFromBuyNow?: boolean) {
    if (this.quantityControl.value < this.minQuantity) {
      this.quantityControl.setValue(this.minQuantity);
    }

    this.selectedProduct.min_quantity = this.quantityControl.value;
    console.log(this.selectedProduct);


    if (comingFromBuyNow) {
      this.onBuyNowClick(product, comingFromBuyNow);
    } else {
      this.addToCart(product);
    }
  }

  decreaseQuantity() {
    if (this.quantityControl.value > this.minQuantity) {
      this.quantityControl.setValue(this.quantityControl.value - 1);
    }
  }

  increaseQuantity() {
    this.quantityControl.setValue(Number(this.quantityControl.value) + 1);
  }

  getQuantityPlaceholder(): string {
    return `Enter ≥ ${this.minQuantity} or selected quantity`;
  }
}
