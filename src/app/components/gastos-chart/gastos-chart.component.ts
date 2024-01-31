import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { barChartOptions, donutChartOptions, groupArrayByKey } from 'src/app/util/util';

@Component({
  selector: 'gastos-chart',
  templateUrl: './gastos-chart.component.html',
  styleUrls: ['./gastos-chart.component.scss']
})
export class GastosChartComponent implements OnChanges {
  @Input() foodCategories: any = []
  @Input() expenses: any = []

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  barChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: '', backgroundColor: '#F06D2C' }] };
  barChartOptions: ChartOptions = barChartOptions

  facturationChartData: any
  donutChartOptions: ChartConfiguration['options'] = donutChartOptions

  operationsType: any[] = []

  billingChartData: any = {}

  ngOnChanges(changes: SimpleChanges): void {
    
    this.fillOperationsType()
    this.fillCategoriesChart(this.expenses)
    this.fillBillingChart(this.expenses)
  }

  getTotalGastos() {
    let totalSum = this.expenses.reduce((total: any, value: any) => total + value.amount, 0)
    return Number(totalSum.toFixed(2))
  }

  fillCategoriesChart(data: any) {
    let categoriesName: any = []
    let amountCategories: any = []
    let categories: any[] = []
    this.foodCategories.map((category: any) => {
      let expCategories = data.filter((e: any) => e.foodCategories.id == category.id)
      let sum = expCategories.reduce((total: any, value: any) => total + value.amount, 0)
      categories.push({ name: category.name, total: sum })
    })

    categories = categories.sort((a: any, b: any) => b.total - a.total)
    categories.map(a => {
      categoriesName.push(a.name)
      amountCategories.push(a.total)
    })
    this.barChartData.labels = categoriesName
    this.barChartData.datasets[0].data = amountCategories
    this.chart?.update()
  }

  async fillOperationsType() {
    this.operationsType = []
    this.expenses = this.expenses.map((e: any) => {
      return { ...e, operation: e.operationType.name }
    })

    let grouped = groupArrayByKey(this.expenses, 'operation')

    Object.keys(grouped).map((name: any) => {
      let data = grouped[name]
      let amount = data.reduce((sum: number, d: any) => sum + d.amount, 0)
      let percent = Math.round((amount * 100) / this.getTotalGastos())
      this.operationsType.push({ name, amount: Number(amount.toFixed(2)), percent: `${percent}%`, isChecked: true })
    })
  }

  async fillBillingChart(data: any) {
    let billing = this.expenses.filter((e: any) => e.billing == 'SI').reduce((sum: number, item: any) => sum + item.amount, 0)
    let noBilling = this.expenses.filter((e: any) => e.billing == 'NO').reduce((sum: number, item: any) => sum + item.amount, 0)

    let billingPercent = billing == 0 ? '0.2%' : ((billing * 100) / this.getTotalGastos()).toFixed(2).concat('%')
    let noBillingPercent = noBilling == 0 ? '0.2%' : ((noBilling * 100) / this.getTotalGastos()).toFixed(2).concat('%')

    this.billingChartData = { billing: Number(billing.toFixed(2)), noBilling: Number(noBilling.toFixed(2)), billingPercent, noBillingPercent }
  }

  onOperationChecked(e: any) {
    let grouped = groupArrayByKey(this.expenses, 'operation')
    this.operationsType = this.operationsType.map((op: any) => {
      let checked = e.name == op.name ? e.target : op.isChecked
      return { ...op, isChecked: checked }
    })

    let dataArray: any[] = []
    this.operationsType.filter((s: any) => s.isChecked).map((s: any) => {
      let filter = grouped[s.name]
      dataArray = dataArray.concat(filter)
    })

    this.fillCategoriesChart(dataArray)
  }

  onchangeCategory(value: any) {
    
  }
}
