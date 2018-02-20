import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Web3Service } from "./util/web3.service";

import { AppComponent } from './app.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { CreateContractComponent } from './purchase/create-contract/create-contract.component';
import { AgreementComponent } from './purchase/agreement/agreement.component';
import { AcceptComponent } from './purchase/accept/accept.component';
import { SimulationComponent } from './purchase/simulation/simulation.component';
import { ConfirmComponent } from './purchase/confirm/confirm.component';

@NgModule({
  declarations: [
    AppComponent,
    PurchaseComponent,
    CreateContractComponent,
    AgreementComponent,
    AcceptComponent,
    SimulationComponent,
    ConfirmComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  providers: [Web3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
