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

import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';

import { ReturnedComponent } from './purchase/returned/returned.component';
import { ReviewComponent } from './purchase/review/review.component';

import { AgreementService} from './services/agreement.service';

import { AngularFontAwesomeModule} from 'angular-font-awesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DisplaySensorsComponent } from './purchase/agreement/display-sensors/display-sensors.component';
import { SetTermsComponent } from './purchase/set-terms/set-terms.component';
import { ClerkVoteComponent } from './purchase/clerk-vote/clerk-vote.component';
import { ClerkComponent } from './purchase/clerk/clerk.component';
import { AppealComponent } from './purchase/appeal/appeal.component';

const appRoutes: Routes = [
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
    ReturnedComponent,
    ReviewComponent,
    DisplaySensorsComponent,
    SetTermsComponent,
    ClerkVoteComponent,
    ClerkComponent,
    AppealComponent,
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCnD7Sr2wMskuqjxVGjP8EpDnd7Olf6fCg'
    }),
    AgmDirectionModule,
    AmChartsModule,
    AngularFontAwesomeModule,
    BrowserModule,
    ChartsModule,
    FormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [Web3Service, AgreementService],
  bootstrap: [AppComponent]
})
export class AppModule { }
