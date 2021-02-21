import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngxs/store';
import { RequiredModules } from 'src/app/modules/required.module';
import { DataCellExpandedComponent } from './data-cell-expanded.component';
import { getNewDataObject } from '../../services/testing.services.mocks';


describe('DataCellExpandedComponent', () => {
  let component: DataCellExpandedComponent;
  let fixture: ComponentFixture<DataCellExpandedComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ RequiredModules, MatSnackBarModule ],
        declarations: [DataCellExpandedComponent],
        
        providers: [ Store, 
          { provide: MatDialogRef, useValue: { close: function (){}} },
          { provide: MAT_DIALOG_DATA, useValue: { timeSlotData: getNewDataObject().list[0]} },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCellExpandedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
