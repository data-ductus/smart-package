import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Web3Service } from "./util/web3.service";

import { AppComponent } from './app.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { CreateContractComponent } from './purchase/create-contract/create-contract.component';
import { AgreementComponent } from './purchase/agreement/agreement.component';

@NgModule({
  declarations: [
    AppComponent,
    PurchaseComponent,
    CreateContractComponent,
    AgreementComponent
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
