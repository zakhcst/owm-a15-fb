import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCellExpandedComponent } from './data-cell-expanded.component';

describe('DataCellExpandedComponent', () => {
  let component: DataCellExpandedComponent;
  let fixture: ComponentFixture<DataCellExpandedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataCellExpandedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCellExpandedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
