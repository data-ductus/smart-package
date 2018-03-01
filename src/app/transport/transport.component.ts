import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import {} from '@types/googlemaps';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.css']
})
export class TransportComponent implements OnInit {
  private tempChart: AmChart;
  private pressChart: AmChart;
  private accChart: AmChart;
  private humidityChart: AmChart;
  stdTemp = 20;
  currTemp = 20;
  pressure = 1;
  humidity = 20;
  notStdTemp = false;
  time = [];
  tempData = [];
  accData = [];
  pressData = [];
  humidityData = [];

  loc = {
    lat: 24.799448,
    lng: 120.979021,
  };

  steps: any[];
  dir = undefined;
  configUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=Stockholm&key=AIzaSyCnD7Sr2wMskuqjxVGjP8EpDnd7Olf6fCg';
  directionUrl = 'https://maps.googleapis.com/maps/api/directions/json?origin=Stockholm&destination=' +
    'Skellefteå&key=AIzaSyCnD7Sr2wMskuqjxVGjP8EpDnd7Olf6fCg';

  constructor(private http: HttpClient, private AmCharts: AmChartsService) { }

  ngOnInit() {
    this.getConfig();
    this.getGeoCodeDirection();
    this.initCharts();
  }

  private initCharts() {
    this.tempChart = this.AmCharts.makeChart( 'tempChartDiv', {
      'type': 'serial',
      'dataProvider': this.tempData,
      'categoryField': 'time',
      'graphs': [ {
        'valueField': 'temp',
        'type': 'column'
      } ]
    } );
    this.pressChart = this.AmCharts.makeChart( 'pressChartDiv', {
      'type': 'serial',
      'dataProvider': this.pressData,
      'categoryField': 'time',
      'graphs': [ {
        'valueField': 'press',
        'type': 'column'
      } ]
    } );
    this.accChart = this.AmCharts.makeChart( 'accChartDiv', {
      'type': 'serial',
      'dataProvider': this.accData,
      'categoryField': 'time',
      'graphs': [ {
        'valueField': 'acc',
        'type': 'column'
      } ]
    } );
    this.humidityChart = this.AmCharts.makeChart( 'humidityChartDiv', {
      'type': 'serial',
      'dataProvider': this.humidityData,
      'categoryField': 'time',
      'graphs': [ {
        'valueField': 'humidity',
        'type': 'column'
      } ]
    } );
  }
  async step() {
    for (let i = 0; i < this.steps.length; i++) {
      this.randomTemp(i);
      this.randomAcceleration(i);
      this.randomHumidity(i);
      this.randomPressure(i);
      this.dir['origin'] = this.steps[i]['end_location'];
      await this.delay(1000);
    }
  }

  private randomTemp(i) {
    if (this.notStdTemp && Math.floor(Math.random() * 2) === 0) {
      this.currTemp = this.stdTemp + Math.random() * 3 - 1;
      this.notStdTemp = false;
    }
    if (Math.floor(Math.random() * 100) === 99) {
      this.currTemp = Math.random() * 80 - 40;
      this.notStdTemp = true;
    }
    this.currTemp = this.currTemp + Math.random() - 0.5;
    this.AmCharts.updateChart(this.tempChart, () => {
      this.tempChart.dataProvider.push({'temp': this.currTemp, 'time': i});
    });
  }

  private randomAcceleration(i) {
    let acc = 0;
    if (Math.floor(Math.random() * 20) === 0) {
      acc = Math.random() * 10 - 5;
    } else {
      acc = Math.random() * 0.01 - 0.005;
    }
    this.AmCharts.updateChart(this.accChart, () => {
      this.accChart.dataProvider.push({'acc': acc, 'time': i});
    });
  }

  private randomPressure(i) {
    if (Math.floor(Math.random() * 20) === 0) {
      this.pressure = Math.random() * 100000;
    } else {
      this.pressure = Math.random() * 5;
    }
    this.AmCharts.updateChart(this.pressChart, () => {
      this.pressChart.dataProvider.push({'press': this.pressure, 'time': i});
    });
  }

  private randomHumidity(i) {
    if (Math.floor(Math.random() * 20) === 0) {
      this.humidity = Math.random() * 100;
    } else {
      this.humidity += Math.random() - 0.5;
      if (this.humidity < 0) {
        this.humidity = 0;
      }
    }
    this.AmCharts.updateChart(this.humidityChart, () => {
      this.humidityChart.dataProvider.push({'humidity': this.humidity, 'time': i});
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getGeoCodeDirection() {
    return this.http.get(this.directionUrl)
      .subscribe(data => {
        console.log(data);
        this.dir = {
          origin: data['routes'][0]['legs'][0]['start_location'],
          destination: data['routes'][0]['legs'][0]['end_location']
        };
        this.steps = data['routes'][0]['legs'][0]['steps'];
        this.step();
      });
  }

  getConfig() {
    return this.http.get(this.configUrl)
      .subscribe(data => {
        this.loc = {lat: data['results'][0].geometry.location.lat, lng: data['results'][0].geometry.location.lng};
        console.log('location ', data);
      });
  }

}
