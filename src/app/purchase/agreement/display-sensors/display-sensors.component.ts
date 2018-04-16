import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-display-sensors',
  templateUrl: './display-sensors.component.html',
  styleUrls: ['./display-sensors.component.css']
})
export class DisplaySensorsComponent implements OnInit {

  @Input() gps;
  @Input() maxT;
  @Input() minT;
  @Input() acc;
  @Input() hum;
  @Input() press;

  constructor() { }

  ngOnInit() {
  }

}
