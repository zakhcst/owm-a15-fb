import { TestBed } from '@angular/core/testing';

import { PopulateGchartDataService } from './populate-gchart-data.service';
import { getNewDataObject } from './testing.services.mocks';

describe('PopulateGchartDataService', () => {
  let service: PopulateGchartDataService;
  let owmData;
  
  beforeEach(() => {
    owmData = getNewDataObject();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopulateGchartDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should addMissingSlotsToTheEndOfTheDay', () => {
    const owmDataDaysKeys = Object.keys(owmData.listByDate);
    const owmDataLastDay = owmData.listByDate[owmDataDaysKeys[owmDataDaysKeys.length - 1]];
    const hoursKeys = Object.keys(owmDataLastDay).map(k => +k);
    const showGraphs = { wind: true, humidity: true, temperature: true, pressure: true };
    const showGraphsKeys = Object.keys(showGraphs);
    const data = Object.keys(owmDataLastDay);

    service.addMissingSlotsToTheEndOfTheDay(data, hoursKeys, showGraphsKeys);
    expect(data.length).toBe(8);
  });
  
  it('should addMissingSlotsToTheEndOfTheDay duplicating 0 slot when 0 slot only', () => {
    const owmDataDaysKeys = Object.keys(owmData.listByDate);
    const owmDataLastDay = owmData.listByDate[owmDataDaysKeys[owmDataDaysKeys.length - 1]];
    const hoursKeys = [ Object.keys(owmDataLastDay).map(k => +k)[0] ];
    const showGraphs = { wind: true, humidity: true, temperature: true, pressure: true };
    const showGraphsKeys = Object.keys(showGraphs);
    const data = [ [Object.keys(owmDataLastDay)['0'], 'test data'] ];
    
    service.addMissingSlotsToTheEndOfTheDay(data, hoursKeys, showGraphsKeys);
    expect(data[0][1]).toBe(data[1][1]);
    expect(data.length).toBe(8);
  });

  it('should addAdditionalRow2359 not last', () => {
    const owmDataDaysKeys = Object.keys(owmData.listByDate).sort();
    const owmDataLastDay = owmData.listByDate[owmDataDaysKeys[0]];
    const hoursKeys = [ Object.keys(owmDataLastDay).map(k => +k)[0] ];
    const showGraphs = {  temperature: true, wind: true, humidity: true, pressure: true };
    const showGraphsKeys = Object.keys(showGraphs);
    const weatherDataListByDate = owmData.listByDate;
    const weatherDataDateKeys = Object.keys(weatherDataListByDate).sort();
    const dayK = weatherDataDateKeys[0];
    const day = weatherDataListByDate[dayK]
    const data = service.setGChartDayData(dayK, day, weatherDataListByDate, weatherDataDateKeys, hoursKeys, showGraphsKeys);

    expect(data[data.length-1][0]).toBe('23:59');
    const nextDay = owmData.listByDate[owmDataDaysKeys[1]][0].main;
    expect(data[data.length-1][1]).toBe(Math.round(nextDay.temp));
    expect(data[data.length-1][5]).toBe(Math.round(nextDay.humidity));
    expect(data[data.length-1][7]).toBe(Math.round(nextDay.pressure));
  });

  it('should addAdditionalRow2359 not last and next 0 is not existing', () => {
    const owmDataDaysKeys = Object.keys(owmData.listByDate).sort();
    const owmDataLastDay = owmData.listByDate[owmDataDaysKeys[0]];
    const hoursKeys = [ Object.keys(owmDataLastDay).map(k => +k)[0] ];
    const showGraphs = {  temperature: true, wind: true, humidity: true, pressure: true };
    const showGraphsKeys = Object.keys(showGraphs);
    const weatherDataListByDate = owmData.listByDate;
    const weatherDataDateKeys = Object.keys(weatherDataListByDate).sort();
    const dayK = weatherDataDateKeys[0];
    const day = weatherDataListByDate[dayK]
    delete owmData.listByDate[owmDataDaysKeys[1]][0];
    const data = service.setGChartDayData(dayK, day, weatherDataListByDate, weatherDataDateKeys, hoursKeys, showGraphsKeys);

    expect(data[data.length-1][0]).toBe('23:59');
    const nextDay = owmData.listByDate[owmDataDaysKeys[1]][3].main;
    expect(data[data.length-1][1]).toBe(Math.round(nextDay.temp));
    expect(data[data.length-1][5]).toBe(Math.round(nextDay.humidity));
    expect(data[data.length-1][7]).toBe(Math.round(nextDay.pressure));
  });

  it('should addAdditionalRow2359 last', () => {
    const owmDataDaysKeys = Object.keys(owmData.listByDate).sort();
    const owmDataLastDay = owmData.listByDate[owmDataDaysKeys[owmDataDaysKeys.length - 1]];
    const hoursKeys = [ Object.keys(owmDataLastDay).map(k => +k)[0] ];
    const showGraphs = {  temperature: true, wind: true, humidity: true, pressure: true };
    const showGraphsKeys = Object.keys(showGraphs);
    const weatherDataListByDate = owmData.listByDate;
    const weatherDataDateKeys = Object.keys(weatherDataListByDate).sort();
    const dayK = weatherDataDateKeys[weatherDataDateKeys.length - 1];
    const day = weatherDataListByDate[dayK];

    const data = service.setGChartDayData(dayK, day, weatherDataListByDate, weatherDataDateKeys, hoursKeys, showGraphsKeys);
    expect(data[data.length-1][0]).toBe('23:59');
    expect(data[data.length-1][1]).toBeNull();
    expect(data[data.length-1][5]).toBeNull();
    expect(data[data.length-1][7]).toBeNull();
  });

  it('should setGChartDayIcons when icon index is mising', () => {
    const owmDataDaysKeys = Object.keys(owmData.listByDate).sort();
    const owmDataLastDay = owmData.listByDate[owmDataDaysKeys[1]];
    const hoursKeys = [ Object.keys(owmDataLastDay).map(k => +k)[0] ];
    const weatherDataListByDate = owmData.listByDate;
    const weatherDataDateKeys = Object.keys(weatherDataListByDate).sort();
    const dayK = weatherDataDateKeys[1];
    const day = weatherDataListByDate[dayK];
    delete day['3'].weather[0].icon;

    const icons = service.setGChartDayIcons(dayK, day, hoursKeys);
    expect(icons[1].iconIndex).toBe(0);
    expect(icons[1].iconStyle['background-position']).toContain('0px');
  });

});
