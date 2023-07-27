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

const routes: Routes = [
  {
    path: 'dashboard',
    component: ReportsViewComponent,
    children: [
      { path: 'inicio', component: DashboardComponent },
      { path: 'resultados', component: ResultsComponent },
      { path: 'indicadores', component: IndicatorsComponent },
      { path: 'flujo-efectivo', component: CashFlowComponent },
      { path: 'analisis-costo', component: CostAnalysisComponent },
      { path: 'estimaciones-profit', component:  ProfitEstimatesComponent},
      { path: 'negocios', component: NewBusinessComponent },
    ],
  },
  {
    path: 'dashboard', redirectTo: '/dashboard/inicio', pathMatch: 'full'
  },
  {
    path: '', redirectTo: '/dashboard/inicio', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
