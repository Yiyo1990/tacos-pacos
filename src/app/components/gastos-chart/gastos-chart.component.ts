import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
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
  @Output() onChangeCategoryEvent : EventEmitter<any> = new EventEmitter()

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  barChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: '', backgroundColor: '#F06D2C' }] };
  barChartOptions: ChartOptions = barChartOptions

  facturationChartData: any
  donutChartOptions: ChartConfiguration['options'] = donutChartOptions

  operationsType: any[] = []

  billingChartData: any = {}
  expensesByCategory: any[] = []
  expensesFiltered: any[] = []

  ngOnChanges(changes: SimpleChanges): void {
    this.expensesByCategory = this.addPropertiesOnExpenses(this.expenses)
    this.fillOperationsType()
    this.fillCategoriesChart(this.expensesByCategory)
    this.fillBillingChart(this.expensesByCategory)
  }

  getTotalGastos() {
    let totalSum = this.expensesByCategory.reduce((total: any, value: any) => total + value.amount, 0)
    return Number(totalSum.toFixed(2))
  }

  fillCategoriesChart(expenses: any) {
    let categoriesName: any = []
    let amountCategories: any = []

    let categoriesArray: any[] = []
    this.foodCategories.map((category: any) => {
      let expCategories = expenses.filter((e: any) => e.foodCategories.id == category.id)
      let sum = expCategories.reduce((total: any, value: any) => total + value.amount, 0)
      categoriesArray.push({ name: category.name, total: sum })
    })

    let categories: any[] = []
    categories = categoriesArray.sort((a: any, b: any) => b.total - a.total)

    categories.map(a => {
      categoriesName.push(a.name)
      amountCategories.push(a.total)
    })

    this.barChartData.labels = categoriesName
    this.barChartData.datasets[0].data = amountCategories
    this.chart?.update()
  }

  addPropertiesOnExpenses(expenses: any[]) {
    expenses = expenses.map((e: any) => {
      return { ...e, operation: e.operationType.name }
    })
    return expenses
  }

  fillOperationsType() {
    this.operationsType = []
    let grouped = groupArrayByKey(this.expensesByCategory, 'operation')

    Object.keys(grouped).map((name: any) => {
      let data = grouped[name]
      let amount = data.reduce((sum: number, d: any) => sum + d.amount, 0)
      let percent = Math.round((amount * 100) / this.getTotalGastos())
      this.operationsType.push({ name, amount: Number(amount.toFixed(2)), percent: `${percent}%`, isChecked: true })
    })
  }

  async fillBillingChart(expenses: any[]) {
    let billing = expenses.filter((e: any) => e.billing == 'SI').reduce((sum: number, item: any) => sum + item.amount, 0)
    let noBilling = expenses.filter((e: any) => e.billing == 'NO').reduce((sum: number, item: any) => sum + item.amount, 0)

    let billingPercent = billing == 0 ? '0.2%' : ((billing * 100) / this.getTotalGastos()).toFixed(2).concat('%')
    let noBillingPercent = noBilling == 0 ? '0.2%' : ((noBilling * 100) / this.getTotalGastos()).toFixed(2).concat('%')

    this.billingChartData = { billing: Number(billing.toFixed(2)), noBilling: Number(noBilling.toFixed(2)), billingPercent, noBillingPercent }
  }

  onOperationChecked(e: any) {
    let expenses = this.getOperationChecked(e, this.expensesByCategory)
    this.fillCategoriesChart(expenses)
    this.fillBillingChart(expenses)
  }

  getOperationChecked(e: any = null, expenses: any[]) {
    let grouped = groupArrayByKey(expenses, 'operation')
    if (e) {
      this.operationsType = this.operationsType.map((op: any) => {
        let checked = e.name == op.name ? e.target : op.isChecked
        return { ...op, isChecked: checked }
      })
    }

    let dataArray: any[] = []
    this.operationsType.filter((s: any) => s.isChecked).map((s: any) => {
      let filter = grouped[s.name]
      if (filter) {
        dataArray = dataArray.concat(filter)
      }
    })

    return dataArray
  }

  onChangeCategory(value: any) {
    this.onChangeCategoryEvent.emit(value)
    if (value == 0) {
      let expenses = this.addPropertiesOnExpenses(this.expenses)
      this.expensesByCategory = expenses
      this.fillCategoriesChart(this.expensesByCategory)
      this.fillBillingChart(this.expensesByCategory)
      this.fillOperationsType()
    } else {
      let expenses = this.expenses.filter((e: any) => e.foodCategories.id == value)
      expenses = this.addPropertiesOnExpenses(expenses)
      this.expensesByCategory = expenses
      this.fillCategoriesChart(this.expensesByCategory)
      this.fillBillingChart(this.expensesByCategory)
      this.fillOperationsType()
    }
  }
}
