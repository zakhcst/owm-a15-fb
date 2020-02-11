import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snack-bar-inner',
  templateUrl: './app-snack-bar-inner.component.html',
  styleUrls: ['./app-snack-bar-inner.component.css'],
})
export class AppSnackBarInnerComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  ngOnInit() {}

}

