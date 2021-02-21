import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import { IOwmDataModelTimeSlotUnit, IListByDateModel, IListDayByHourModel } from '../models/owm-data.model';

@Injectable({
  providedIn: 'root',
})
export class PopulateGchartDataService {
  chart = {};
  textColor = '#FFF';
  weatherParams = ConstantsService.weatherParams;

  constructor() { }

  setGChartData(weatherDataListByDate: IListByDateModel, weatherDataDateKeys: string[]): any {
    Object.entries(weatherDataListByDate).forEach(([dayK, day]) => {
      this.setGChartDay(dayK);
      this.setGChartDayData(dayK, day, weatherDataListByDate, weatherDataDateKeys);
      this.setGChartDayIcons(dayK, day);
      this.setGChartDayOptions(dayK);
    });
    return this.chart;
  }

  setGChartDay(dayK: string) {
    this.chart[dayK] = {};
    this.chart[dayK].type = 'LineChart';
    this.chart[dayK].columnNames = [
      'Time',
      'Temperature',
      { type: 'string', role: 'tooltip', 'p': { 'html': true } },
      'Wind',
      { type: 'string', role: 'tooltip', 'p': { 'html': true } },
      'Humidity',
      { type: 'string', role: 'tooltip', 'p': { 'html': true } },
      'Pressure',
      { type: 'string', role: 'tooltip', 'p': { 'html': true } },
    ];
    this.chart[dayK].data = [];
  }

  setGChartDayData(dayK: string, day: IListDayByHourModel, weatherDataListByDate: IListByDateModel, weatherDataDateKeys: string[]) {
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
        this.formatTooltip(hourK + ':00', 'Temperature', Math.floor(hour.main.temp), 'C' + String.fromCodePoint(176)),
        hour.wind.speed,
        this.formatTooltip(hourK + ':00', 'Wind', Math.floor(hour.wind.speed), '&nbsp;m/s'),
        hour.main.humidity,
        this.formatTooltip(hourK + ':00', 'Humidity', hour.main.humidity, '%'),
        hour.main.pressure,
        this.formatTooltip(hourK + ':00', 'Pressure', hour.main.pressure, '&nbsp;hPa'),
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
      this.chart[dayK].data.push([
        timeTemplate[i++].hour + ':00',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ]);
    }

    // add additional row to extend lines for the whole day
    let last = [];
    const dayKIndex = weatherDataDateKeys.indexOf(dayK);

    if (dayKIndex < weatherDataDateKeys.length - 1) {
      const nextDay0Hour = weatherDataListByDate[weatherDataDateKeys[dayKIndex + 1]]['0'];
      last = [
        '23:59',
        nextDay0Hour.main.temp,
        this.formatTooltip('23:59', 'Temperature', Math.floor(nextDay0Hour.main.temp), 'C' + String.fromCodePoint(176)),
        nextDay0Hour.wind.speed,
        this.formatTooltip('23:59', 'Wind', Math.floor(nextDay0Hour.wind.speed), '&nbsp;m/s'),
        nextDay0Hour.main.humidity,
        this.formatTooltip('23:59', 'Humidity', nextDay0Hour.main.humidity, '%'),
        nextDay0Hour.main.pressure,
        this.formatTooltip('23:59', 'Pressure', nextDay0Hour.main.pressure, '&nbsp;hPa')
      ];
    } else {
      last = JSON.parse(JSON.stringify([...this.chart[dayK].data[this.chart[dayK].data.length - 1]]).replace(/21:00/g, '23:59'));
    }

    this.chart[dayK].data.push(last);
  }
  


  setGChartDayOptions(dayK: string) {
    this.chart[dayK].options = {
      curveType: 'function',
      animation: {
        duration: 1500,
        easing: 'out',
        startup: true,
      },
      vAxes: {
        0: {
          textStyle: { color: this.textColor },
          // maxValue: 100,
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
      pointSize: 2,
      backgroundColor: 'transparent',
      tooltip: { isHtml: true },
    };
  }

  formatTooltip(hour: string, type: string, data: number, unit: string) {
    return `
    <div style="display: flex; color: white; background-color: #33425c; padding: 8px;">
      <b>${hour}</b>&nbsp;&nbsp;
      <svg 
        style="display:inline" 
        xmlns="http://www.w3.org/2000/svg" 
        stroke="none" 
        fill="${this.weatherParams[type.toLocaleLowerCase()].lineColor}" 
        viewBox="0 0 10 10" 
        width="10" 
        height="10">
        <circle cx="5" cy="5" r="4"/>
      </svg>&nbsp;${type}:&nbsp;<b>${data}</b>
      ${unit}
    </div>
    `;
  }


  setGChartDayIcons(dayK: string, day: IListDayByHourModel) {
    const hoursKeys = Object.keys(day).sort((a, b) => (a > b ? +a : +b));
    this.chart[dayK].icons = [];
    // add the missing slots at the begining of the day
    let i = 0;
    while (ConstantsService.timeTemplate[i].hour < +hoursKeys[0]) {
      this.chart[dayK].icons.push({
        hourK : ConstantsService.timeTemplate[i++].hour 
      });
    }

    // copy existing slots
    Object.entries(day).forEach(([hourK, hour]) => {
      const iconCode = day[hourK].weather[0].icon;
      const iconIndex = ConstantsService.iconsWeatherMap[iconCode];
      this.chart[dayK].icons.push({ hourK, iconIndex});
    });

    // add the missing slots at the end of the day
    const timeTemplate = ConstantsService.timeTemplate;
    i = this.chart[dayK].icons.length;
    
    while (i < timeTemplate.length && timeTemplate[i].hour > +hoursKeys[hoursKeys.length - 1]) {
      this.chart[dayK].icons.push({
        hourK : ConstantsService.timeTemplate[i++].hour 
      });
    }
  }

}
