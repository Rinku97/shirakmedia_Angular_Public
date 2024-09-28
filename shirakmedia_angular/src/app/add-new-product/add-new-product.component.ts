import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfigService } from '../config.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileItem, FileUploader } from 'ng2-file-upload';
import { CommonService } from '../common.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ShowLargeImageComponent } from '../popup/show-large-image/show-large-image.component';
import { MatChipInputEvent } from '@angular/material/chips';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-add-new-product',
  templateUrl: './add-new-product.component.html',
  styleUrls: ['./add-new-product.component.scss'],
  animations: [
    trigger('slideAnimation', [
        transition(':increment', [
            style({ transform: 'translateX(100%)' }),
            animate('500ms ease-in-out', style({ transform: 'translateX(0%)' }))
        ]),
        transition(':decrement', [
            style({ transform: 'translateX(-100%)' }),
            animate('500ms ease-in-out', style({ transform: 'translateX(0%)' }))
        ])
    ])
]

})
export class AddNewProductComponent {

  @ViewChild('fileInput') fileInput: ElementRef;

  productForm: FormGroup;
  formSections: any;

  uploader: FileUploader;
  files: File[] = [];

  productImages:any[] = [];

  // toggle button color
  color: ThemePalette = 'accent';

  // apiUrl = "http://localhost:4300/api/files/upload"
  apiUrl = "";

  separatorKeysCodes: number[] = [13, 188]; // Enter and comma keys

  addOnBlur = true;
  isLoading = false; 

  productId:any;

  constructor(private configService: ConfigService, private fb: FormBuilder, private backSvc:CommonService, private dialog:MatDialog) { 
    this.apiUrl = `${this.configService.decrypt(this.configService.apiUrl)}files/upload`;
    this.initializeImageUploader();
  }

  ngOnInit(): void {
    this.getConfig();
  }

  getConfig(){
    this.configService.getConfig().subscribe(
      data => {
        this.formSections = data.sections;
        this.initializeForm();
      },
      error => {
        console.error('Error fetching config:', error);
        this.backSvc.openAlertDialogMessage("Error fetching config");
      }
    );
  }

  initializeImageUploader() {
    const File_Extensions = "jpeg,jpg,png";
    const allowedExtensions = File_Extensions.split(',').map(ext => ext.toLowerCase());
  
    this.uploader = new FileUploader({
      authToken: 'jksdk3-nsdlflfshueheeee-12',
      url: this.apiUrl,
      itemAlias: 'files',
      autoUpload: false, 
      disableMultipart: false,
      filters: [
        {
          name: 'fileTypeAllowed',
          fn: (item, options) => {
            const itemType = item.name.substring(item.name.lastIndexOf('.') + 1).toLowerCase();
            return allowedExtensions.includes(itemType); // Return true or false based on the extension
          }
        }
      ]
    });
  
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      this.files.push(file._file);
    };
  
    this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
      if (filter.name === 'fileTypeAllowed') {
        this.backSvc.openAlertDialogMessage(`Only (${File_Extensions}) files can be uploaded. Please choose a valid file.`);
      } else {
        this.backSvc.openAlertDialogMessage('Invalid upload');
      }
    };

     // Add product ID to the upload request
    this.uploader.onBeforeUploadItem = (item) => {
      if (this.productId) {
          // Add product ID to headers
          item.headers.push({ name: 'productId', value: this.productId });
      } else {
        this.backSvc.openAlertDialogMessage('Product ID is not defined');
      }
  };
  }


  initializeForm(): void {
    const group: any = {};
  
    this.formSections.forEach(section => {
      section.fields.forEach(field => {
        const control = this.fb.control(field.field_value || '');
        if (field.isDisabled) {
          control.disable();
        }
        group[field.field_internal_name] = control;
      });
    });
  
    this.productForm = this.fb.group(group);
  }

onFileChange(event: any, field: any, upload): void {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (files && files instanceof FileList) {
    const fileArray = Array.from(files);

    // Flag to track if a duplicate was found
    let duplicateFound = false;

    // Check for duplicates and add files
    fileArray.forEach(file => {
      const isDuplicateIndex = upload.queue.findIndex(item => item.file.name === file.name);
      if (isDuplicateIndex !== -1 && !duplicateFound) {

        // Duplicate found, show an alert
        this.backSvc.openAlertDialogMessage(`Duplicate file: "${file.name}" is already uploaded.`);

        duplicateFound = true;

        return; // Skip adding this file
      }
    });
    
    if(!duplicateFound){
      // Add files to the queue
      upload.addToQueue(fileArray);
      
      // Generate previews (if applicable)
      this.generateImagePreviews(fileArray); // Call your function for previews
    }

    // Reset the file input to allow re-selection of the same file
    input.value = ''; 
  } else {
    this.backSvc.openAlertDialogMessage('No files selected or files object is not valid.');
    return;
  }
}

// generate the string as URL that will be used to show the image preview uploaded by user.
generateImagePreviews(fileArray: File[]) {
  fileArray.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let fileObj = {
        url:e.target?.result as string,
        name:file.name
      }
      this.productImages.push(fileObj);
    };
    reader.readAsDataURL(file);
  });
}

uploadFiles() {
  const upload = this.uploader;
  let allDocumentUploadedCount = 0;
  if (upload.queue.length > 0) {
    upload.uploadAll(); // Start the upload process

    upload.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      let resObj;

      if (response) {
        resObj = JSON.parse(response);
      }

      if (resObj && resObj.Success) {
        allDocumentUploadedCount += 1;
        if(allDocumentUploadedCount == upload.queue.length){
          this.productImages = [];
          this.productForm.reset();
          this.backSvc.openAlertDialogMessage("Info: Product and images have been added successfully!",null,true,false,'home');
        }
        this.productImages.splice(allDocumentUploadedCount, 1);

      } else {
        this.backSvc.openAlertDialogMessage(resObj.Message);
      }
    };

    upload.onErrorItem = (item: any, response: any, status: any, headers: any) => {
      this.backSvc.openAlertDialogMessage('Upload failed.');
    };
  } else {
    this.backSvc.openAlertDialogMessage('No files to upload.');
  }
}

// remove the uploaded images on local
  removeImage(index: number): void {
    this.productImages.splice(index, 1);
    this.uploader.queue.splice(index, 1);
  }

  // to enlarge the image
  enlargeImage(index: number): void {
    const image = this.productImages[index];

    const dialogRef = this.dialog.open(ShowLargeImageComponent, {
      data: image,
      width: '80%',
      maxWidth: '600px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(data => {
    });
  }

  toggleBrowseFile(fileInput:ElementRef){
    fileInput.nativeElement.click()
  }

  async addProduct(){
    try {
      
      let postObj:any = this.productForm.value;

      let response = await this.backSvc.addNewProduct(postObj);
      
      if (!response.Success) {
        this.backSvc.openAlertDialogMessage(response.Message);
        return;
      }
      
      this.productId = response.Data;

      this.uploadFiles();
      
    } catch (error) {
      this.backSvc.openAlertDialogMessage(error.error.Message);
    }
  }

  submitForm() {

    if(!this.productImages){
      this.backSvc.openAlertDialogMessage("Please upload the images of the product before continue.", "Shirak Medida");
      return;
    }

    if (this.productForm.valid) {
      this.addProduct();
    } else {

      this.productForm.markAllAsTouched();
      this.backSvc.openAlertDialogMessage("Please fill into all the mandatory fields before submission.", "Shirak Medida");
    }
  }

  onRadioChange(event: any, field:any): void {
    const input = event.target as HTMLInputElement;

    if(field.DependentFields && field.DependentFields.length > 0){
      // this.showHideField(field);
    }
  }

  showHideField(field:any, showOrHide:any){
    field.DependentFields.forEach(fld => {
      let f = this.getFieldByFieldInternalName(fld.Dependent_Field_Name);
      if(showOrHide == "show"){
        f.IncludeOnForm = 1;
        f.isRequired = true;
      }else{
        f.IncludeOnForm = 0;
        f.isRequired = false;

        let fieldName = f.field_internal_name;
        f.Chips_Array = [];
        this.productForm.get(fieldName).reset();
      }

      this.updateFieldValidators(f.field_internal_name, showOrHide, f.isRequired);
    });

  }

   // Method to update validators based on showOrHide
   updateFieldValidators(fieldName: string, showOrHide: string, isRequired: boolean) {
    const control = this.productForm.get(fieldName);
    if (showOrHide === 'show') {
      control.setValidators(isRequired ? [Validators.required] : []);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity();
  }

  getFieldByFieldInternalName(internalName:string){
    let field:any;
    this.formSections.forEach(obj => {
      field = obj.fields.find(x => x.field_internal_name == internalName);
    });

    return field;
  }

  addChip(event: MatChipInputEvent, field: any): void {
    const input = event.input;
    const value = event.value.trim();
    let fieldName = field.field_internal_name;
    if (value) {
      const control = this.productForm.get(fieldName);
      field.Chips_Array.push({ name: value });
      control.setValue(field.Chips_Array);
    }
    if (input) {
      input.value = '';
    }
  }

  removeChip(chip: any, field: any): void {
    let fieldName = field.field_internal_name;
    const control = this.productForm.get(fieldName);
    const index = field.Chips_Array.indexOf(chip);
    if (index >= 0) {
      field.Chips_Array.splice(index, 1);
      control.setValue(field.Chips_Array);
    }
  }

  onToggleChange(event: any, field: any){
    field.field_value = event.checked;
    if(field.DependentFields && field.DependentFields.length > 0){
      let showOrHide = event.checked ? "show" : "hide";
      this.showHideField(field, showOrHide);
    }
  }

  isFieldRequired(field: any){
    const control = this.productForm.get(field.field_internal_name);
    if(control.hasError('required') && (control.touched || control.dirty)){
      return true;
    }
    return false;
  }

  getDisplayName(field: any){
    return field.field_internal_name == "color" ? "Color" : "Size";
  }
}
