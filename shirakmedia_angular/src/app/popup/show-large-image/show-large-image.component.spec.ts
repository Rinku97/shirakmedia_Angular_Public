import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowLargeImageComponent } from './show-large-image.component';

describe('ShowLargeImageComponent', () => {
  let component: ShowLargeImageComponent;
  let fixture: ComponentFixture<ShowLargeImageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowLargeImageComponent]
    });
    fixture = TestBed.createComponent(ShowLargeImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
