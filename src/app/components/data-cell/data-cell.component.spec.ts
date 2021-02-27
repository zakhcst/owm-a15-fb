import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { DataCellComponent } from './data-cell.component';
import { getNewDataObject } from '../../services/testing.services.mocks';
import { ConstantsService } from 'src/app/services/constants.service';

describe('DataCellComponent', () => {
  let component: DataCellComponent;
  let fixture: ComponentFixture<DataCellComponent>;
  // let data: IOwmDataModel;
  const mockData = getNewDataObject();

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      imports: [ AppModule ],
      declarations: [ DataCellComponent ],

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCellComponent);
    component = fixture.componentInstance;
    component.dataDaily = mockData.list[0];
    component.timeSlot = ConstantsService.timeTemplate[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

