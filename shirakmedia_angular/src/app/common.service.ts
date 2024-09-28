import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from './popup/alert/alert.component';
import { BehaviorSubject } from 'rxjs';
import { ConfirmationAlertComponent } from './popup/confirmation-alert/confirmation-alert.component';
import { ConfigService } from './config.service';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'text/plain',
  }),
};

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  // apiURL = "http://localhost:4300/api/";
  apiURL = "";
  
  private selectedOptionSubject = new BehaviorSubject<string>('Home');
  private addToCardCount = new BehaviorSubject<number>(0);
  selectedOption$ = this.selectedOptionSubject.asObservable();
  countOfCartProducts = this.addToCardCount.asObservable();

  constructor(private http: HttpClient, private dialog:MatDialog, private configService: ConfigService, private router:Router, private ngZone: NgZone) {
    this.apiURL = this.configService.decrypt(this.configService.apiUrl);
    const cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];
    this.updateCartCount(cartProducts.length);
   }

  setSelectedOption(option: string): void {
    this.selectedOptionSubject.next(option);
  }

  updateCartCount(option: number): void {
    this.addToCardCount.next(option);
  }

  base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    var rawLength = binaryString.length;

    for (let i = 0; i < rawLength; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  /** popups for confirmations and alerts */
  openAlertDialogMessage(_message, title?, requireClose?, loadHomeScreen?, loadUrl?, keepOnSameScreen?:any): void {
    const dialogRef = this.dialog.open(AlertComponent, {
      // height: '300px',
      // width: '500px',
      data: { message: _message }
    });

    if (requireClose) {
      this.handleDialogClose(dialogRef, loadHomeScreen, loadUrl, requireClose, keepOnSameScreen);
    }

    if (loadHomeScreen && !requireClose) {
      dialogRef.afterClosed().subscribe((data) => {
        this.navigateToHome();
      });
    }
  }

  navigateToHome(){
    this.ngZone.run(() => {
      this.router.navigate(['']);
    });
  }

  openConfirmationDialogMessage(_message, title?, requireClose?, loadHomeScreen?, loadUrl?,keepOnSameScreen?): void {
    const dialogRef = this.dialog.open(ConfirmationAlertComponent, {
      // height: '300px',
      // width: '500px',
      data: { message: _message }
    });

    if (requireClose) {
      this.handleDialogClose(dialogRef, loadHomeScreen, loadUrl, requireClose, keepOnSameScreen);
    }

    if (loadHomeScreen && !requireClose) {
      dialogRef.afterClosed().subscribe((data) => {
        this.navigateToHome();
      });
    }
  }


  handleDialogClose(dialogRef, loadHomeScreen?, loadUrl?, requireClose?, keepOnSameScreen?) {
    dialogRef.afterClosed().subscribe((data) => {
      if (requireClose && data.toLowerCase() === 'no') {
        return;
      }
      
      if (keepOnSameScreen) {
        return;
      }
  
      if (loadUrl) {
        if (loadUrl.toLowerCase() === 'reload') {
          location.reload();
        } else {
          this.ngZone.run(() => {
            this.router.navigate([loadUrl]);
          });
        }
      } else if (loadHomeScreen) {
        this.navigateToHome();
      } else {
        this.ngZone.run(() => {
          this.router.navigate([this.router.url]);
        });
      }
    });
  }
  /** popups for confirmations and alerts */

  /** Only GET Methods */

  async getAllFiles(): Promise<any> {

    let url = this.apiURL + 'files/getAllFiles';
    return await this.http.get<any>(url).toPromise();
    
  }

  async getAllProducts(): Promise<any> {

    let url = this.apiURL + 'products/getAllProducts';
    return await this.http.get<any>(url).toPromise();
    
  }

  async getCategroies(): Promise<any> {

    let url = this.apiURL + 'products/getCategroies';
    return await this.http.get<any>(url).toPromise();
    
  }

  /** The GET Methods Will Always Define In The Above Section */

  /** ########################################################################################################################### **/

  /** Only POST Methods */

  async addNewProduct(postObj:any): Promise<any> {

    let url = this.apiURL + 'products/create';
    return await this.http.post<any>(url, postObj).toPromise();
    
  }

  async getProductById(productId): Promise<any> {
    let postObj = {
      id:productId
    }
    let url = this.apiURL + 'products/getProductById';
    return await this.http.post<any>(url, postObj).toPromise();
    
  }

  async getProductReviews(productId): Promise<any> {
    let postObj = {
      id:productId
    }
    let url = this.apiURL + 'products/getProductReviews';
    return await this.http.post<any>(url, postObj).toPromise();
    
  }

  async addProductReviews(newReview): Promise<any> {
    let postObj = newReview;
    let url = this.apiURL + 'products/addProductReviews';
    return await this.http.post<any>(url, postObj).toPromise();
    
  }

  /** The POST Methods Will Always Define In The Above Section */

}
