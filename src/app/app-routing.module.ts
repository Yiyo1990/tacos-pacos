import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ResultsComponent } from './pages/results/results.component';
import { IndicatorsComponent } from './pages/indicators/indicators.component';
import { ReportsViewComponent } from './reports-view/reports-view.component';
import { CashFlowComponent } from './pages/cash-flow/cash-flow.component';
import { CostAnalysisComponent } from './pages/cost-analysis/cost-analysis.component';
import { ProfitEstimatesComponent } from './pages/profit-estimates/profit-estimates.component';
import { NewBusinessComponent } from './pages/new-business/new-business.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { authGuard } from './auth/auth.guard';
import { SucursalOptionComponent } from './sucursal-option/sucursal-option.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { BillsComponent } from './pages/expenses/expenses.component';
import { SupplierComponent } from './pages/supplier/supplier.component';
import { SalesComponent } from './pages/sales/sales.component';
import { InsumosComponent } from './pages/insumos/insumos.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: MainComponent,
    children: [
      { path: 'inicio', component: DashboardComponent },
      { path: 'resultados', component: ResultsComponent },
      { path: 'indicadores', component: IndicatorsComponent },
      { path: 'flujo-efectivo', component: CashFlowComponent },
      { path: 'analisis-costo', component: CostAnalysisComponent },
      { path: 'estimaciones-profit', component:  ProfitEstimatesComponent},
      { path: 'negocios', component: NewBusinessComponent },
      { path: 'inventarios', component: InventarioComponent},
      { path: 'gastos', component: BillsComponent},
      { path: 'proveedores', component: SupplierComponent},
      { path: 'ventas', component: SalesComponent},
      { path: 'insumos', component: InsumosComponent}
    ],
    canActivate: [authGuard]
  },
  {
    path: 'sucursal',
    component: SucursalOptionComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard', redirectTo: '/dashboard/inicio', pathMatch: 'full'
  },
  {
    path: '', redirectTo: '/dashboard/inicio', pathMatch: 'full'
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: '**', redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
