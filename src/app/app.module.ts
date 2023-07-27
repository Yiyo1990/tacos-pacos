import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { MenuComponent } from './components/menu/menu.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ResultsComponent } from './pages/results/results.component';
import { IndicatorsComponent } from './pages/indicators/indicators.component';
import { CashFlowComponent } from './pages/cash-flow/cash-flow.component';
import { CostAnalysisComponent } from './pages/cost-analysis/cost-analysis.component';
import { ReportsViewComponent } from './reports-view/reports-view.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    MenuComponent,
    DashboardComponent,
    ResultsComponent,
    IndicatorsComponent,
    CashFlowComponent,
    CostAnalysisComponent,
    ReportsViewComponent  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
