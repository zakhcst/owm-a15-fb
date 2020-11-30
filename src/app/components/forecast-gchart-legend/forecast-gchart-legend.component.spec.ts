import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ForecastGchartLegendComponent } from './forecast-gchart-legend.component';

describe('ForecastGchartLegendComponent', () => {
  let component: ForecastGchartLegendComponent;
  let fixture: ComponentFixture<ForecastGchartLegendComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastGchartLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastGchartLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
