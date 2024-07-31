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
import { HeaderTblSalesComponent } from './components/header-tbl-sales/header-tbl-sales.component';
import { VentasChartComponent } from './components/ventas-chart/ventas-chart.component';
import { GastosChartComponent } from './components/gastos-chart/gastos-chart.component';
import { GastosCheckComponent } from './components/gastos-check/gastos-check.component';
import { RowTotalNegocioComponent } from './components/row-total-negocio/row-total-negocio.component';
import { CategorySupplierCardComponent } from './components/category-supplier-card/category-supplier-card.component';
import { CurrencyPipe } from '@angular/common';
import { ProfitEstimatesComponent } from './pages/profit-estimates/profit-estimates.component';
import { InputTextComponent } from './components/input-text/input-text.component';
import { InsumosComponent } from './pages/insumos/insumos.component';
import { TipoPagoChartComponent } from './components/tipo-pago-chart/tipo-pago-chart.component';
import { TblSalesLeft } from './components/tbl-sales-left/tbl-sales-left.component';
import { HeaderTblLeftComponent } from './components/header-tbl-left/header-tbl-left.component';
import { RowGuisadoComponent } from './components/row-guisado/row-guisado.component';
import { HeaderTblGuisadoComponent } from './components/header-tbl-guisado/header-tbl-guisado.component';
import { ModalGuisadoComponent } from './components/modal-guisado/modal-guisado.component';
import { DecimalOnlyDirective } from './directivas/decimal-only.directive';
import { LoaderComponent } from './components/loader/loader.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

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
    ProgressBarComponent,
    HeaderTblSalesComponent,
    VentasChartComponent,
    GastosChartComponent,
    GastosCheckComponent,
    RowTotalNegocioComponent,
    CategorySupplierCardComponent,
    SupplierComponent,
    ProfitEstimatesComponent,
    InputTextComponent,
    InsumosComponent,
    TipoPagoChartComponent,
    TblSalesLeft,
    HeaderTblLeftComponent,
    RowGuisadoComponent,
    HeaderTblGuisadoComponent,
    ModalGuisadoComponent,
    DecimalOnlyDirective,
    LoaderComponent,
    SpinnerComponent
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
    BsDatepickerModule.forRoot()
  ],
  providers: [BsLocaleService, CurrencyPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
