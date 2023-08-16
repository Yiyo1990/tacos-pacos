import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ResultsComponent } from './pages/results/results.component';
import { IndicatorsComponent } from './pages/indicators/indicators.component';
import { CashFlowComponent } from './pages/cash-flow/cash-flow.component';
import { CostAnalysisComponent } from './pages/cost-analysis/cost-analysis.component';
import { ReportsViewComponent } from './reports-view/reports-view.component';
import { NewBusinessComponent } from './pages/new-business/new-business.component';
import { FormsModule } from '@angular/forms';
import { MainComponent } from './main/main.component';
import { AlertMessageComponent } from './components/alert-message/alert-message.component';
import { SucursalOptionComponent } from './sucursal-option/sucursal-option.component';
import { HttpClientModule } from '@angular/common/http';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { NgChartsModule } from 'ng2-charts';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    DashboardComponent,
    ResultsComponent,
    IndicatorsComponent,
    CashFlowComponent,
    CostAnalysisComponent,
    ReportsViewComponent,
    NewBusinessComponent,
    MainComponent,
    AlertMessageComponent,
    SucursalOptionComponent,
    InventarioComponent,
    PrimaryButtonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
