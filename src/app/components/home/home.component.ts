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

  constructor() { }

  ngOnInit() {
    this.loaded = true;
  }
}
