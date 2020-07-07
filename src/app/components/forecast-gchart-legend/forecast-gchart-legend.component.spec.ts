import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastGchartLegendComponent } from './forecast-gchart-legend.component';

describe('ForecastGchartLegendComponent', () => {
  let component: ForecastGchartLegendComponent;
  let fixture: ComponentFixture<ForecastGchartLegendComponent>;

  beforeEach(async(() => {
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
