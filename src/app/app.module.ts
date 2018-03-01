import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Web3Service } from './util/web3.service';
import { RouterModule, Routes } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { AmChartsModule } from '@amcharts/amcharts3-angular';

import { AppComponent } from './app.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { CreateContractComponent } from './purchase/create-contract/create-contract.component';
import { AgreementComponent } from './purchase/agreement/agreement.component';
import { AcceptComponent } from './purchase/accept/accept.component';
import { SimulationComponent } from './purchase/simulation/simulation.component';
import { ConfirmComponent } from './purchase/confirm/confirm.component';
import { TransportComponent } from './transport/transport.component';

import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';

import { TransportService } from './transport/transport.service';

const appRoutes: Routes = [
  { path: 'transport', component: TransportComponent },
  { path: '', component: PurchaseComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    PurchaseComponent,
    CreateContractComponent,
    AgreementComponent,
    AcceptComponent,
    SimulationComponent,
    ConfirmComponent,
    TransportComponent,
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCnD7Sr2wMskuqjxVGjP8EpDnd7Olf6fCg'
    }),
    AgmDirectionModule,
    AmChartsModule,
    BrowserModule,
    ChartsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [Web3Service, TransportService],
  bootstrap: [AppComponent]
})
export class AppModule { }
