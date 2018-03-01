import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import {} from '@types/googlemaps';


class SearchItem {
  constructor(public track: string,
              public artist: string,
              public link: string,
              public thumbnail: string,
              public artistId: string) {
  }
}


@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.css']
})
export class TransportComponent implements OnInit {
  private chart: AmChart;
  stdTemp = 20;
  currTemp = 20;
  notStdTemp = false;
  tempData = [{data: [], label: 'temperature'}];
  time = [];
  lineChartType = 'line';
  chartData = [];

  loc = {
    lat: 24.799448,
    lng: 120.979021,
  };

  steps: any[];
  dir = undefined;
  configUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=Stockholm&key=AIzaSyCnD7Sr2wMskuqjxVGjP8EpDnd7Olf6fCg';
  directionUrl = 'https://maps.googleapis.com/maps/api/directions/json?origin=Stockholm&destination=Skellefteå&key=AIzaSyCnD7Sr2wMskuqjxVGjP8EpDnd7Olf6fCg';

  constructor(private http: HttpClient, private AmCharts: AmChartsService) { }

  ngOnInit() {
    this.getConfig();
    // this.mapInit();
    this.getGeoCodeDirection();
    this.chart = this.AmCharts.makeChart( 'chartdiv', {
      'type': 'serial',
      'dataProvider': this.chartData,
      'categoryField': 'time',
      'graphs': [ {
        'valueField': 'temp',
        'type': 'column'
      } ]
    } );
  }

  async step() {
    for (let i = 0; i < this.steps.length; i++) {
      this.randomTemp(i);
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
    this.currTemp = this.currTemp + Math.random() * 2 - 1;
    this.AmCharts.updateChart(this.chart, () => {
      // Change whatever properties you want
      this.chart.dataProvider.push({'temp': this.currTemp, 'time': i});
    });
    // this.tempData[0].data.push(this.currTemp);
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
