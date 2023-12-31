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
import { SucursalOptionComponent } from './sucursal-option/sucursal-option.component';
import { HttpClientModule } from '@angular/common/http';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { NgChartsModule } from 'ng2-charts';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonCComponent } from './components/button-c/button-c.component';
import { BillsComponent } from './pages/expenses/expenses.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { ToastrModule } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { FormatoMonedaDirective } from './directivas/formato-moneda.directive';
import { NgxCurrencyDirective } from 'ngx-currency';
import { SupplierComponent } from './pages/supplier/supplier.component';
import { NoTextInputDirective } from './directivas/no-text-input.directive';
import { LoadingComponent } from './components/loading/loading.component';
import { SalesComponent } from './pages/sales/sales.component';
import { OptionPayComponent } from './components/option-pay/option-pay.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';


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
    SucursalOptionComponent,
    InventarioComponent,
    PrimaryButtonComponent,
    ButtonCComponent,
    BillsComponent,
    FormatoMonedaDirective,
    NoTextInputDirective,
    LoadingComponent,
    SalesComponent,
    OptionPayComponent,
    ProgressBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule,
    AccordionModule,
    BrowserAnimationsModule,
    ModalModule,
    ModalModule.forRoot(),
    SelectDropDownModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right'
    }),
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    BsDatepickerModule,
    BsDatepickerModule.forRoot(),
    SupplierComponent
  ],
  providers: [BsLocaleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
