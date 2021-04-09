import { Component, OnInit } from '@angular/core';
import { ConstantsService } from '../../services/constants.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constants = ConstantsService;
  loaded = false;
  data = [
    {
      version: 11,
      db: 'Firebase RTDB',
      hosted: 'Firebase',
      routedLink: '/v1/' + ConstantsService.toolbarElements.forecastFlex.path,
      sourceLink: 'https://github.com/zakhcst/owm-a11-fb'
    },
    {
      version: 10,
      db: 'Firebase RTDB',
      hosted: 'Firebase',
      hostedLink: 'https://owm-a10-fb.firebaseapp.com/v1/forecast-detail',
      sourceLink: 'https://github.com/zakhcst/owm-a10-fb'
    },
    {
      version: 9,
      db: 'Firebase RTDB',
      hosted: 'Firebase',
      hostedLink: 'https://owm-a9-fb.firebaseapp.com/v1/forecast-flex',
      sourceLink: 'https://github.com/zakhcst/owm-a9-fb'
    },
    {
      version: 8,
      db: 'Firebase RTDB',
      hosted: 'Firebase',
      hostedLink: 'https://owm-a8-fb.firebaseapp.com/v1/forecast-flex',
      sourceLink: 'https://github.com/zakhcst/owm-a8-fb'
    },
    {
      version: 7,
      db: 'Firebase RTDB',
      hosted: 'Firebase',
      hostedLink: 'https://owm-a7-fb.firebaseapp.com/v1/forecast-detail',
      sourceLink: 'https://github.com/zakhcst/owm-a7-fb'
    },
    {
      version: 6,
      db: 'Firebase RTDB',
      hosted: 'Firebase',
      hostedLink: 'https://owm-a6-fb.firebaseapp.com/',
      sourceLink: 'https://github.com/zakhcst/owm-a6-fb'
    },
    {
      version: 1.6,
      db: 'OWM Requests',
      hosted: 'Firebase',
      hostedLink: 'https://owm-weather-forecast.firebaseapp.com/',
      sourceLink: 'https://github.com/zakhcst/owm-weather-forecast'
    }
  ];

  constructor() { }

  ngOnInit() {
    this.loaded = true;
  }
}
