import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastOverlayComponent } from './toast-overlay.component';

describe('ToastOverlayComponent', () => {
  let component: ToastOverlayComponent;
  let fixture: ComponentFixture<ToastOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToastOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
