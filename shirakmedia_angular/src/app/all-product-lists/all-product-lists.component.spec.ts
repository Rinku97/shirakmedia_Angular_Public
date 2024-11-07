import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllProductListsComponent } from './all-product-lists.component';

describe('AllProductListsComponent', () => {
  let component: AllProductListsComponent;
  let fixture: ComponentFixture<AllProductListsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllProductListsComponent]
    });
    fixture = TestBed.createComponent(AllProductListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
