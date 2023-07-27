import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ResultsComponent } from './pages/results/results.component';
import { IndicatorsComponent } from './pages/indicators/indicators.component';
import { ReportsViewComponent } from './reports-view/reports-view.component';

const routes: Routes = [
  {
    path: '/dashboard',
    component: ReportsViewComponent,
    children: [
      { path: 'main', component: DashboardComponent },
      { path: 'resultados', component: ResultsComponent },
      { path: 'indicadores', component: IndicatorsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
