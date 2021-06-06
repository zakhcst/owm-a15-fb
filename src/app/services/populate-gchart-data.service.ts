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
  graphsKeys = ConstantsService.graphsKeys;
  constructor() { }

  setGChartData(weatherDataListByDate: IListByDateModel, weatherDataDateKeys: string[], showGraphs): any {
    this.chart = {};
    const showGraphsKeys = Object.keys(showGraphs).filter((key) => !!showGraphs[key]);

    Object.entries(weatherDataListByDate).forEach(([dayK, day]) => {
      const hoursKeys: number[] = Object.keys(day)
        .map(Number)
        .sort((a, b) => Number(a > b));

      this.chart[dayK] = { type: 'LineChart' };
      this.chart[dayK].columnNames = this.setGChartColumnNames(showGraphsKeys);
      this.chart[dayK].data = this.setGChartDayData(
        dayK,
        day,
        weatherDataListByDate,
        weatherDataDateKeys,
        hoursKeys,
        showGraphsKeys
      );
      this.chart[dayK].icons = this.setGChartDayIcons(day, hoursKeys);
      this.chart[dayK].options = this.setGChartDayOptions(showGraphsKeys);
    });
    return this.chart;
  }

  setGChartColumnNames(showGraphsKeys) {
    const tooltip = { type: 'string', role: 'tooltip', p: { html: true } };
    const columnNames: any[] = ['Time'];
    showGraphsKeys.forEach((graphKey) => {
      columnNames.push(this.weatherParams[graphKey].title);
      columnNames.push(tooltip);
    });
    return columnNames;
  }

  setGChartDayData(
    dayK: string,
    day: IListDayByHourModel,
    weatherDataListByDate: IListByDateModel,
    weatherDataDateKeys: string[],
    hoursKeys: number[],
    showGraphsKeys
  ) {
    const data = [];

    this.addMissingSlotsAtTheBeginingOfTheDay(data, hoursKeys, showGraphsKeys);
    this.copyAvailabeSlots(data, day, showGraphsKeys);
    this.addMissingSlotsToTheEndOfTheDay(data, hoursKeys, showGraphsKeys);
    this.addAdditionalRow2359(data, weatherDataListByDate, weatherDataDateKeys, dayK, showGraphsKeys);
    return data;
  }

  addMissingSlotsAtTheBeginingOfTheDay(data, hoursKeys: number[], showGraphsKeys) {
    let i = 0;
    while (ConstantsService.timeTemplate[i].hour < hoursKeys[0]) {
      const row: any[] = [ConstantsService.timeTemplate[i++].hour + ':00'];
      this.setSlotNoData(row, showGraphsKeys);
      data.push(row);
    }
  }

  copyAvailabeSlots(data, day: IListDayByHourModel, showGraphsKeys) {
    Object.entries(day).forEach(([hourK, hour]) => {
      const row: any[] = [hourK + ':00'];
      this.setSlotData(row, hour, hourK + ':00', showGraphsKeys);
      data.push(row);
    });
  }

  addMissingSlotsToTheEndOfTheDay(data, hoursKeys: number[], showGraphsKeys) {
    const timeTemplate = ConstantsService.timeTemplate;
    let i = data.length;
    // when slot[0] is available only - duplicate it to render a line
    if (i === 1) {
      data.push(data[0].slice(0));
      data[1][0] = '3:00';
      i++;
    }
    while (i < timeTemplate.length && timeTemplate[i].hour > hoursKeys[hoursKeys.length - 1]) {
      const row: any[] = [timeTemplate[i++].hour + ':00'];
      this.setSlotNoData(row, showGraphsKeys);
      data.push(row);
    }
  }

  addAdditionalRow2359(data, weatherDataListByDate, weatherDataDateKeys, dayK, showGraphsKeys) {
    let last: any[];
    const dayKIndex = weatherDataDateKeys.indexOf(dayK);

    if (dayKIndex < weatherDataDateKeys.length - 1) {
      const nextDay = weatherDataListByDate[weatherDataDateKeys[dayKIndex + 1]];
      let nextDay1stSlot;
      if (nextDay['0']) {
        nextDay1stSlot = nextDay['0'];
      } else {
        const nextDay1stSlotKey = Object.keys(nextDay).sort((a, b) => +(+a > +b))[0];
        nextDay1stSlot = nextDay[nextDay1stSlotKey];
      }
      last = ['23:59'];
      this.setSlotData(last, nextDay1stSlot, '23:59', showGraphsKeys);
    } else {
      last = JSON.parse(JSON.stringify([...data[data.length - 1]]).replace(/21:00/g, '23:59'));
    }
    data.push(last);
  }

  setSlotNoData(row: any[], showGraphsKeys: string[]) {
    showGraphsKeys.forEach((graphKey: string) => {
      row.push(undefined);
      row.push(undefined);
    });
  }

  setSlotData(row: any[], slot: any, time: string, showGraphsKeys: string[]) {
    showGraphsKeys.forEach((graphKey: string) => {
      switch (graphKey) {
        case 'temperature':
          const roundTemp = Math.round(slot.main.temp);
          row.push(roundTemp);
          row.push(
            this.formatTooltipPoint(time, 'Temperature', roundTemp, 'C' + String.fromCodePoint(176))
          );
          break;
        case 'wind':
          const roundWind = Math.round(slot.wind.speed);
          row.push(roundWind);
          row.push(this.formatTooltipPoint(time, 'Wind', roundWind, '&nbsp;m/s'));
          break;
        case 'humidity':
          const roundHumidity = Math.round(slot.main.humidity);
          row.push(roundHumidity);
          row.push(this.formatTooltipPoint(time, 'Humidity', roundHumidity, '%'));
          break;
        case 'pressure':
          const roundPressure = Math.round(slot.main.pressure);
          row.push(roundPressure);
          row.push(this.formatTooltipPoint(time, 'Pressure', roundPressure, '&nbsp;hPa'));
          break;
      }
    });
  }

  setGChartDayOptions(showGraphsKeys) {
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
      series: {},
      legend: 'none',
      pointSize: 3,
      backgroundColor: 'transparent',
      tooltip: { isHtml: true },
    };
    let i = 0;
    showGraphsKeys.forEach((graphKey: string) => {
      options['series'][i++] = {
        color: this.weatherParams[graphKey].lineColor,
        targetAxisIndex: graphKey === 'pressure' ? 1 : 0,
      };
    });
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

  setGChartDayIcons(day: IListDayByHourModel, hoursKeys: number[]) {
    const icons = [];
    const iconSize = ConstantsService.iconsWeatherSize2;

    // add the missing slots at the begining of the day
    let i = 0;
    while (ConstantsService.timeTemplate[i].hour < hoursKeys[0]) {
      icons.push({
        hourK: ConstantsService.timeTemplate[i++].hour.toString(),
        iconStyle: { 'background-position': '0 ' + iconSize + 'px' },
      });
    }

    // copy existing slots
    Object.entries(day).forEach(([hourK, hour]) => {
      const iconCode = day[hourK].weather[0].icon;
      const iconIndex = ConstantsService.iconsWeatherMap[iconCode] ?? 0;
      const tooltipTxt = this.formatTooltipIcon(hour);
      const iconStyle = { 'background-position': '0 ' + iconIndex * (-iconSize) + 'px' };
      icons.push({ hourK, iconIndex, tooltipTxt, iconStyle });
    });

    // add the missing slots at the end of the day
    const timeTemplate = ConstantsService.timeTemplate;
    i = icons.length;

    while (i < timeTemplate.length && timeTemplate[i].hour > hoursKeys[hoursKeys.length - 1]) {
      icons.push({
        hourK: ConstantsService.timeTemplate[i++].hour.toString(),
        iconStyle: { 'background-position': '0 ' + iconSize + 'px' },
      });
    }

    return icons;
  }

  formatTooltipIcon(hour: IOwmDataModelTimeSlotUnit) {
    const description =
      hour.weather[0].description
        .split(' ')
        .map((word) => word[0].toUpperCase() + word.slice(1).toLocaleLowerCase())
        .join(' ') + '\n\n';
    const temperature =
      'Temperature'.padEnd(15, ' ') +
      (Math.round(hour.main.temp) + ' C' + String.fromCodePoint(176) + '  ').padStart(10, ' ') +
      '\n';
    const wind = 'Wind'.padEnd(21, ' ') + (Math.round(hour.wind.speed) + ' m/s').padStart(10, ' ') + '\n';
    const humidity = 'Humidity'.padEnd(17, ' ') + (hour.main.humidity + ' %  ').padStart(10, ' ') + '\n';
    const pressure = 'Pressure'.padEnd(15, ' ') + (hour.main.pressure + ' hPa').padStart(10, ' ');
    const txt = description + temperature + wind + humidity + pressure;

    return txt;
  }
}
