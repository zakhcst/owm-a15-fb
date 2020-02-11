import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSnackBarInnerComponent } from './app-snack-bar-inner.component';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

describe('SnackBarInnerComponent', () => {
  let component: AppSnackBarInnerComponent;
  let fixture: ComponentFixture<AppSnackBarInnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppSnackBarInnerComponent],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: { message: 'Test Message' } }
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppSnackBarInnerComponent);
        component = fixture.componentInstance;
      });
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
