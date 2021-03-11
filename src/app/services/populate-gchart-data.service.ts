import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import { IListByDateModel, IListDayByHourModel, IOwmDataModelTimeSlotUnit } from '../models/owm-data.model';

@Injectable({
  providedIn: 'root',
})
export class PopulateGchartDataService {
  chart = {};
  textColor = '#FFF';
  weatherParams = ConstantsService.weatherParams;

  constructor() {}

  setGChartData(weatherDataListByDate: IListByDateModel, weatherDataDateKeys: string[]): any {
    this.chart = {};
    Object.entries(weatherDataListByDate).forEach(([dayK, day]) => {
      const hoursKeys: number[] = Object.keys(day).map(Number).sort((a, b) => Number(a > b));

      this.chart[dayK] = { type: 'LineChart' };
      this.chart[dayK].columnNames = this.setGChartColumnNames();
      this.chart[dayK].data = this.setGChartDayData(dayK, day, weatherDataListByDate, weatherDataDateKeys, hoursKeys);
      this.chart[dayK].icons = this.setGChartDayIcons(dayK, day, hoursKeys);
      this.chart[dayK].options = this.setGChartDayOptions();
    });
    return this.chart;
  }

  setGChartColumnNames() {
    const tooltip = { type: 'string', role: 'tooltip', p: { html: true } };
    const columnNames = [
      'Time',
      'Temperature',
      tooltip,
      'Wind',
      tooltip,
      'Humidity',
      tooltip,
      'Pressure',
      tooltip,
    ];
    return columnNames;
  }

  setGChartDayData(
    dayK: string,
    day: IListDayByHourModel,
    weatherDataListByDate: IListByDateModel,
    weatherDataDateKeys: string[],
    hoursKeys: number[]
  ) {
    const data = [];

    this.addMissingSlotsAtTheBeginingOfTheDay(data, hoursKeys);
    this.copyAvailabeSlots(data, day);
    this.addMissingSlotsAtTheEndOfTheDay(data, hoursKeys);
    this.addAdditionalRow2359(data, weatherDataListByDate, weatherDataDateKeys, dayK);

    return data;
  }

  addMissingSlotsAtTheBeginingOfTheDay(data, hoursKeys: number[]) {
    let i = 0;
    while (ConstantsService.timeTemplate[i].hour < hoursKeys[0]) {
      data.push([
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
  }

  copyAvailabeSlots(data, day: IListDayByHourModel) {
    Object.entries(day).forEach(([hourK, hour]) => {
      data.push([
        hourK + ':00',
        hour.main.temp,
        this.formatTooltipPoint(hourK + ':00', 'Temperature', Math.round(hour.main.temp), 'C' + String.fromCodePoint(176)),
        hour.wind.speed,
        this.formatTooltipPoint(hourK + ':00', 'Wind', Math.round(hour.wind.speed), '&nbsp;m/s'),
        hour.main.humidity,
        this.formatTooltipPoint(hourK + ':00', 'Humidity', hour.main.humidity, '%'),
        hour.main.pressure,
        this.formatTooltipPoint(hourK + ':00', 'Pressure', hour.main.pressure, '&nbsp;hPa'),
      ]);
    });
  }

  addMissingSlotsAtTheEndOfTheDay(data, hoursKeys: number[]) {
    const timeTemplate = ConstantsService.timeTemplate;
    let i = data.length;
    // when slot[0] is available only - duplicate it to render a line
    if (i === 1) {
      data.push(data[0].slice(0));
      data[1][0] = '3:00';
    }
    i++;
    while (i < timeTemplate.length && timeTemplate[i].hour > hoursKeys[hoursKeys.length - 1]) {
      data.push([
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
  }

  addAdditionalRow2359(data, weatherDataListByDate, weatherDataDateKeys, dayK) {
    let last = [];
    const dayKIndex = weatherDataDateKeys.indexOf(dayK);

    if (dayKIndex < weatherDataDateKeys.length - 1) {
      const nextDay0Hour = weatherDataListByDate[weatherDataDateKeys[dayKIndex + 1]]['0'];
      last = [
        '23:59',
        nextDay0Hour.main.temp,
        this.formatTooltipPoint('23:59', 'Temperature', Math.round(nextDay0Hour.main.temp), 'C' + String.fromCodePoint(176)),
        nextDay0Hour.wind.speed,
        this.formatTooltipPoint('23:59', 'Wind', Math.round(nextDay0Hour.wind.speed), '&nbsp;m/s'),
        nextDay0Hour.main.humidity,
        this.formatTooltipPoint('23:59', 'Humidity', nextDay0Hour.main.humidity, '%'),
        nextDay0Hour.main.pressure,
        this.formatTooltipPoint('23:59', 'Pressure', nextDay0Hour.main.pressure, '&nbsp;hPa'),
      ];
    } else {
      last = JSON.parse(JSON.stringify([...data[data.length - 1]]).replace(/21:00/g, '23:59'));
    }
    data.push(last);
  }

  setGChartDayOptions() {
    const options = {
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
      pointSize: 3,
      backgroundColor: 'transparent',
      tooltip: { isHtml: true },
    };

    return options;
  }

  formatTooltipPoint(hour: string, type: string, data: number, unit: string) {
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

  setGChartDayIcons(dayK: string, day: IListDayByHourModel, hoursKeys: number[]) {
    const icons = [];
    const iconSize = ConstantsService.iconsWeatherSize2;

    // add the missing slots at the begining of the day
    let i = 0;
    while (ConstantsService.timeTemplate[i].hour < hoursKeys[0]) {
      icons.push({
        hourK: ConstantsService.timeTemplate[i++].hour.toString(),
        iconStyle: { 'background-position': '0 ' + iconSize + 'px' }
      });
    }

    // copy existing slots
    Object.entries(day).forEach(([hourK, hour]) => {
      const iconCode = day[hourK].weather[0].icon;
      const iconIndex = ConstantsService.iconsWeatherMap[iconCode];
      const tooltipTxt = this.formatTooltipIcon(hour);
      const iconStyle = {
        'background-position': 
        '0 ' + (iconIndex ? '-' : '') + (iconIndex === undefined ? 1 : iconIndex) * iconSize + 'px',
      };
      icons.push({ hourK, iconIndex, tooltipTxt, iconStyle });
    });

    // add the missing slots at the end of the day
    const timeTemplate = ConstantsService.timeTemplate;
    i = icons.length;

    while (i < timeTemplate.length && timeTemplate[i].hour > hoursKeys[hoursKeys.length - 1]) {
      icons.push({
        hourK: ConstantsService.timeTemplate[i++].hour.toString(),
        iconStyle: { 'background-position': '0 ' + iconSize + 'px' }
      });
    }

    return icons;
  }

  formatTooltipIcon(hour: IOwmDataModelTimeSlotUnit) {
    const description = hour.weather[0].description.split(' ').map((word) => word[0].toUpperCase() + word.slice(1).toLocaleLowerCase()).join(' ') + '\n\n';
    const temperature ='Temperature'.padEnd(15, ' ') +(Math.round(hour.main.temp) + ' C' + String.fromCodePoint(176) + '  ').padStart(10, ' ') + '\n';
    const wind = 'Wind'.padEnd(21, ' ') + (Math.round(hour.wind.speed) + ' m/s').padStart(10, ' ') + '\n';
    const humidity = 'Humidity'.padEnd(17, ' ') + (hour.main.humidity + ' %  ').padStart(10, ' ') + '\n';
    const pressure = 'Pressure'.padEnd(15, ' ') + (hour.main.pressure + ' hPa').padStart(10, ' ');
    const txt = description + temperature + wind + humidity + pressure;

    return txt;
  }
}
