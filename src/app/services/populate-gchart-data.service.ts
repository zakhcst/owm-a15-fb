import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import { IOwmDataModelTimeSlotUnit, IListByDateModel } from '../models/owm-data.model';

@Injectable({
  providedIn: 'root',
})
export class PopulateGchartDataService {
  chart = {};
  textColor: string = '#FFF';
  weatherParams = ConstantsService.weatherParams;

  constructor() {}

  setGChartData(weatherDataListByDate: IListByDateModel, weatherDataDateKeys: string[]): any {
    Object.entries(weatherDataListByDate).forEach(([dayK, day]) => {
      this.setGChartDay(dayK);
      this.setGChartDayData(dayK, day, weatherDataListByDate, weatherDataDateKeys);
      this.setGChartDayOptions(dayK);
    });
    return this.chart;
  }

  setGChartDay(dayK: string) {
    this.chart[dayK] = {};
    this.chart[dayK].type = 'LineChart';
    this.chart[dayK].columnNames = ['Time', 'Temperature', 'Wind', 'Humidity', 'Pressure'];
    this.chart[dayK].data = [];
  }

  setGChartDayData(dayK: string, day: IOwmDataModelTimeSlotUnit, weatherDataListByDate, weatherDataDateKeys) {
    const hoursKeys = Object.keys(day).sort((a, b) => (a > b ? +a : +b));

    // add the missing slots at the begining of the day
    let i = 0;
    while (ConstantsService.timeTemplate[i].hour < +hoursKeys[0]) {
      this.chart[dayK].data.push([
        ConstantsService.timeTemplate[i++].hour + ':00',
        undefined,
        undefined,
        undefined,
        undefined,
      ]);
    }

    // copy existing slots
    Object.entries(day).forEach(([hourK, hour]) => {
      this.chart[dayK].data.push([
        hourK + ':00',
        hour.main.temp,
        hour.wind.speed,
        hour.main.humidity,
        hour.main.pressure,
      ]);
    });

    // add the missing slots at the end of the day
    const timeTemplate = ConstantsService.timeTemplate;
    i = this.chart[dayK].data.length;
    // when slot[0] is available only - duplicate it to render a line
    if (i++ === 1) {
      this.chart[dayK].data.push(this.chart[dayK].data[0].slice(0));
      this.chart[dayK].data[1][0] = '3:00';
    }
    while (i < timeTemplate.length && timeTemplate[i].hour > +hoursKeys[hoursKeys.length - 1]) {
      this.chart[dayK].data.push([timeTemplate[i++].hour + ':00', undefined, undefined, undefined, undefined]);
    }

    // add additional row to extend lines for the whole day
    let last = [];
    const dayKIndex = weatherDataDateKeys.indexOf(dayK);

    if (dayKIndex < weatherDataDateKeys.length - 1) {
      const nextDay0Hour = weatherDataListByDate[weatherDataDateKeys[dayKIndex + 1]]['0'];
      last = [
        '0:00',
        nextDay0Hour.main.temp,
        nextDay0Hour.wind.speed,
        nextDay0Hour.main.humidity,
        nextDay0Hour.main.pressure,
      ];
    } else {
      last = [...this.chart[dayK].data[this.chart[dayK].data.length - 1]];
      last[0] = '0:00';
    }

    this.chart[dayK].data.push(last);
  }

  setGChartDayOptions(dayK: string) {
    this.chart[dayK].options = {
      curveType: 'function',
      animation: {
        duration: 1000,
        easing: 'out',
        startup: true,
      },
      vAxes: {
        0: {
          textStyle: { color: this.textColor },
          maxValue: 100,
          format: '###',
          viewWindowMode: 'maximized',
        },
        1: {
          textStyle: { color: '#00FF00' },
          format: '####',
          viewWindowMode: 'maximized',
        },
      },
      vAxis: {
        textStyle: { color: this.textColor },
        titleTextStyle: { color: this.textColor },
        gridlines: { minSpacing: 1 },
        minorGridlines: { count: 0 },
      },
      hAxis: {
        textStyle: { color: this.textColor },
        viewWindowMode: 'maximized',
        gridlines: { minSpacing: 1 },
      },
      series: {
        0: {
          color: this.weatherParams.temperature.lineColor,
          targetAxisIndex: 0,
        },
        1: {
          color: this.weatherParams.wind.lineColor,
          targetAxisIndex: 0,
        },
        2: {
          color: this.weatherParams.humidity.lineColor,
          targetAxisIndex: 0,
        },
        3: {
          color: this.weatherParams.pressure.lineColor,
          targetAxisIndex: 1,
        },
      },
      legend: 'none',
      backgroundColor: 'transparent',
    };
  }
}
