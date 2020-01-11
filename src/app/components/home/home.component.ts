import { Component, OnInit, AfterViewInit } from '@angular/core';
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
      version : 8,
      db: 'Firebase RTDB',
      hosted: 'Firebase',
      routedLink: '/toolbar/forecast-flex',
      sourceLink:'https://github.com/zakhcst/owm-a8-fb'
    },
    {
      version : 7,
      db: 'Firebase RTDB',
      hosted: 'Firebase',
      hostedLink: 'https://owm-a7-fb.firebaseapp.com/',
      sourceLink:'https://github.com/zakhcst/owm-a7-fb'
    },
    {
      version : 7,
      db: 'Firebase RTDB',
      hosted: 'GCP AE(f1)',
      hostedLink: 'https://owm-a7-fb.appspot.com/',
      sourceLink:'https://github.com/zakhcst/owm-a7-fb'
    },
    {
      version : 6,
      db: 'Firebase RTDB',
      hosted: 'Firebase',
      hostedLink: 'https://owm-a7-fb.firebaseapp.com/',
      sourceLink:'https://github.com/zakhcst/owm-a7-fb'
    },
    {
      version : 1.6,
      db: 'OWM Requests',
      hosted: 'Firebase',
      hostedLink: 'https://owm-a7-fb.firebaseapp.com/',
      sourceLink:'https://github.com/zakhcst/owm-a7-fb'
    }
  ]

  constructor() {}

  ngOnInit() {
    this.loaded = true;
  }
}
