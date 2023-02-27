import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Store } from '@ngxs/store';
import { RequiredModules } from 'src/app/modules/required.module';
import { DataCellExpandedComponent } from './data-cell-expanded.component';
import { getNewDataObject } from '../../services/testing.services.mocks';
import { InitModules } from 'src/app/modules/init.module';
import { SharedModule } from 'src/app/modules/shared.module';

export class MatDialogRefMock {
  close() { }
  open() { }
  updatePosition() { }
  updateSize() { }
}


describe('DataCellExpandedComponent', () => {
  let component: DataCellExpandedComponent;
  let fixture: ComponentFixture<DataCellExpandedComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [InitModules, RequiredModules, SharedModule],
        declarations: [DataCellExpandedComponent],

        providers: [Store,
          { provide: MatDialogRef, useClass: MatDialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { 
            timeSlotData: getNewDataObject().list[0],
            bgColor: '#30509050'
          } },
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
    expect(component).toBeDefined();
  });

  it('should setBackground image', () => {
    component.setBackground(true);
    fixture.detectChanges();
    expect(component.timeSlotBgStyle['background-image']).toBeTruthy();
  });
  it('should setBackground color', () => {
    component.setBackground(false);
    fixture.detectChanges();
    expect(component.timeSlotBgStyle['background-color']).toBeTruthy();
  });

  it('should close dialog', () => {
    const spyOnClose = spyOn(component.dialogRef, 'close');
    component.closeDialog();
    expect(spyOnClose).toHaveBeenCalled();
  });


});
