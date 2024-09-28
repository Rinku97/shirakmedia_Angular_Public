import { FlatTreeControl } from '@angular/cdk/tree';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { CommonService } from '../common.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-all-product-lists',
  templateUrl: './all-product-lists.component.html',
  styleUrls: ['./all-product-lists.component.scss']
})
export class AllProductListsComponent {

  products: any[] =  [];

  filteredProducts: any[] = [];
  paginatedProducts: any[] = [];
  filterForm: FormGroup;
  pageSize = 10;
  pageIndex = 0;

  showFilterOptions:boolean = false;
  showCategoryFilterOption:boolean = false;


  /** CATEGPRY FILTER */
  TREE_DATA = [];
  
  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<any>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  hasChild = (_: number, node: any) => node.expandable;

  /** CATEGPRY FILTER */

  selectedOption: string = 'Home';
  private subscription: Subscription;

  constructor(private fb: FormBuilder, private http: HttpClient, private router:Router, private backSVC:CommonService, private config:ConfigService, private cd:ChangeDetectorRef) {
    this.filterForm = this.fb.group({
      category: [''],
      search: [''],
      sort: ['']
    });

    this.getAllProducts();
  }

  ngOnInit(): void {

    this.subscription = this.backSVC.selectedOption$.subscribe(option => {
      this.selectedOption = option;
      if(option.toLowerCase() == 'category'){
        this.showCategoryFilterOption = !this.showCategoryFilterOption;
        if(this.showCategoryFilterOption){
          this.getCategroies();
        }
      }

      if(option.toLowerCase() == 'cart' && window.innerWidth <= 600){
        this.showCategoryFilterOption = false;
      }

    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async getAllProducts(){

    try {
      let response = await this.backSVC.getAllProducts();
      
      if (!response.Success) {
        this.backSVC.openAlertDialogMessage(response.Message);
        return;
      }

      this.products = response.Data;
      this.filteredProducts = this.products;
      this.applyFilters(this.filterForm.value, '');

      this.filterForm.valueChanges.subscribe(values => {
        this.applyFilters(values, '');
      });

      this.cd.detectChanges();

    } catch (error) {
      this.backSVC.openAlertDialogMessage(error.error.Message);
    }
  }

  async getCategroies() {
    try {
        let response = await this.backSVC.getCategroies();

        // Check if the response indicates an error
        if (!response.Success) {
            this.backSVC.openAlertDialogMessage(response.Message);
            return; // Exit the function if there's an error
        }

        this.TREE_DATA = response.Data;
        this.dataSource.data = this.TREE_DATA;

    } catch (error) {
        this.backSVC.openAlertDialogMessage(error.error.Message);
    }
}

  onApplyFilterButton(){
    this.showFilterOptions = !this.showFilterOptions;
  }

  onCloseButton(){
    this.showCategoryFilterOption = !this.showCategoryFilterOption;
    this.backSVC.setSelectedOption('');
  }

  applyFilters(values: any, categoryType): void {
    const { category, search, sort } = values;
    let filtered = this.products.filter(product => {
      const matchesCategory = category ? product[categoryType] === category : true;
      const matchesSearch = search ? product.title.toLowerCase().includes(search.toLowerCase()) : true;
      return matchesCategory && matchesSearch;
    });

    if (sort) {
      filtered = this.sortProducts(filtered, sort);
    }

    this.filteredProducts = filtered;
    this.updatePaginatedProducts();
  }

  sortProducts(products: any[], sort: string): any[] {
    switch (sort) {
      case 'price-asc':
        return products.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price);
      case 'rating-desc':
        return products.sort((a, b) => b.rating - a.rating);
      case 'rating-asc':
        return products.sort((a, b) => a.rating - b.rating);
      default:
        return products;
    }
  }

  updatePaginatedProducts(): void {
    const startIndex = this.pageIndex * this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedProducts();
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStars = Math.ceil(rating - fullStars);
    const stars = Array(fullStars).fill('star');
    if (halfStars) stars.push('star_half');
    return stars;
  }

  addToCart(product:any, comingFormBuyNow?){
    // Retrieve the existing cartProducts from localStorage, or initialize an empty array if not found
    let cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];
    
    // Check if the product already exists in the cart. Assuming product has a unique identifier like 'id'.
    const productExists = cartProducts.some(cartProduct => cartProduct.id === product.id);
    
    if (productExists) {
        // If the product is already in the cart, log a message and return only if it is not clicked again
        if(!comingFormBuyNow){

          // informing navbar to hide cart if the popup comes
          this.backSVC.setSelectedOption('');

          // if the category side nav is opened then closing that so that it can be viewed propery in mobile view.
          this.showCategoryFilterOption = false;

          this.backSVC.openAlertDialogMessage(`The product "${product.title}" is already in your cart. Feel free to review it in your cart or continue shopping.`);
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
    this.router.navigate([`checkout/${encodedString}`]);
}


  onProductClick(product:any){
    this.router.navigate([`/ViewProduct/${product.id}`]);
  }

  onCategoryClick(node: any) {
    if(node.name.toLowerCase() == 'all'){
      this.treeControl.collapseAll()
    }
    this.applyFilters({ category: node.name.toLowerCase() == 'all' ? '' : node.name }, 'category');
  }
  
  onSubCategoryClick(node: any) {
    if(node.name.toLowerCase() == 'all'){
      this.treeControl.collapseAll()
    }
    if (!node.expandable) {
      this.applyFilters({ category: node.name.toLowerCase() == 'all' ? '' : node.name }, 'sub_category');
    }
  }
}
