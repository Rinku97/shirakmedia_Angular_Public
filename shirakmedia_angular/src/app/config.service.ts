import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as CryptoJS from "crypto-js";

interface AppConfig {
  apiUrl: string;
}


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

    private configSubject = new BehaviorSubject<AppConfig | null>(null);
    config$ = this.configSubject.asObservable();

    constructor(private http: HttpClient) {
      // this.initializeConfig();
    }
  
    private initializeConfig() {
      const storedConfig = localStorage.getItem('appConfig');
      if (storedConfig) {
        this.configSubject.next(JSON.parse(storedConfig));
      } else {
        this.loadConfig().subscribe();
      }
    }
  
    loadConfig():any{
      return this.http.get<AppConfig>('/assets/config/config.json').pipe(
        tap(config => {
          // let decryptedApi:Api = {} this.decrypt(config.apiUrl)
          this.configSubject.next(config);
          this.storeConfigInLocalStorage(config);
        })
      );
    }
  
    private storeConfigInLocalStorage(config: AppConfig) {
      localStorage.setItem('appConfig', JSON.stringify(config));
    }
  
    get apiUrl(): string | null {
      const config = this.configSubject.value;
      return config ? config.apiUrl : null;
    }

    decrypt(textToDecrypt: string): string {
      let key = "bbC2H19lkVbQDfakxcrtNMQdd0FloLyw"; // length == 32
      let iv = "gqLOHUioQ0QjhuvI"; // length == 16

      var key8 = CryptoJS.enc.Utf8.parse(key);
      var iv8 = CryptoJS.enc.Utf8.parse(iv);

      if (!textToDecrypt) {
          console.error("No text to decrypt");
          return "";
      }

      try {
          let eValue = CryptoJS.AES.decrypt(textToDecrypt, key8, {
              keySize: 32,
              iv: iv8,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7,
          }).toString(CryptoJS.enc.Utf8);
          return eValue;
      } catch (error) {
          console.error("Error decrypting text: ", error);
          return "";
      }
  }

  encrypt(textToEncrypt: string): string {
      let key = "bbC2H19lkVbQDfakxcrtNMQdd0FloLyw"; // length == 32
      let iv = "gqLOHUioQ0QjhuvI"; // length == 16

      var key8 = CryptoJS.enc.Utf8.parse(key);
      var iv8 = CryptoJS.enc.Utf8.parse(iv);

      let eValue = CryptoJS.AES.encrypt(textToEncrypt, key8, {
          keySize: 32,
          iv: iv8,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
      }).toString();
      return eValue;
  }
}
