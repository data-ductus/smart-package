import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import { Web3Service } from '../util/web3.service';
import { TransportService } from './transport.service';
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
  account;
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

  constructor(private http: HttpClient, private AmCharts: AmChartsService, private web3Service: Web3Service,
              private transportService: TransportService) { }

  ngOnInit() {
    this.getConfig();
    this.getGeoCodeDirection();
    this.initCharts();
    this.watchAccount();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.account = accounts[0];
    });
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
      this.AmCharts.updateChart(this.tempChart, () => {
        this.tempChart.dataProvider.push(this.transportService.randomTemp(i));
      });
      this.AmCharts.updateChart(this.accChart, () => {
        this.accChart.dataProvider.push(this.transportService.randomAcceleration(i));
      });
      this.AmCharts.updateChart(this.humidityChart, () => {
        this.humidityChart.dataProvider.push(this.transportService.randomHumidity(i));
      });
      this.AmCharts.updateChart(this.pressChart, () => {
        this.pressChart.dataProvider.push(this.transportService.randomPressure(i));
      });
      this.dir['origin'] = this.steps[i]['end_location'];
      await this.delay(1000);
    }
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
