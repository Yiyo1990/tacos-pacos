import { OperationType, groupArrayByKey, sortByKey } from "@util/util"
import { ExpenseService } from "./expenses.service"
import { Dates } from "@util/Dates"

export class Expense {
    private dates = new Dates()
    constructor(private service: ExpenseService, private branchSelected: any) { }
    /**
       * Regresa total de gastos
       */
    public static totalExpenses(expenses: Array<any>): number {
        let totalSum = expenses.reduce((total: any, value: any) => total + value.amount, 0)
        return Number(totalSum.toFixed(2))
    }


    /**
     * Regresa el total de gastos mediante efectivo
     */
    public static totalByCash(expenses: Array<any>): number {
        return expenses.filter((e: any) => e.operationType.code == OperationType.CASH || e.operationType.code == OperationType.BOX)
            .reduce((total: number, obj: any) => total + obj.amount, 0)
    }

    /**
    * Regresa total de gastos mediante transferencia
    */
    public static totalByTransfer(expenses: Array<any>): number {
        return expenses.filter((e: any) => e.operationType.code == OperationType.TRANSFER)
            .reduce((total: number, obj: any) => total + obj.amount, 0)
    }

    /**
     * 
     * @param expensesList 
     * @param categorycode 
     * @param groupedBy 
     * @returns 
     */
    public static getFoodSupplier(expensesList: Array<any>, categorycode: string, groupedBy: string) {
        let foodSupplier: Array<any> = []

        let expenses = categorycode == 'ALL' ? expensesList.map((e: any) => { return { ...e, provider: e.providerCategories.name, foodCategory: e.foodCategories.name } })
            : expensesList.filter((e: any) => e.foodCategories.code == categorycode).map((e: any) => { return { ...e, provider: e.providerCategories.name, foodCategory: e.foodCategories.name } })

        let groupedByKey = groupArrayByKey(expenses, groupedBy)

        Object.keys(groupedByKey).map((k: any) => {
            let provider: Array<any> = groupedByKey[k]
            let providerGrouped = groupArrayByKey(provider, 'provider')
            let providers: Array<any> = []

            Object.keys(providerGrouped).map((pk: any) => {
                let total = providerGrouped[pk].reduce((total: number, obj: any) => total + obj.amount, 0)
                providers.push({ name: pk, total: Math.round(total) })
            })

            let total = provider.reduce((total: number, obj: any) => total + obj.amount, 0)
            foodSupplier.push({ name: k, total, providers: sortByKey(providers, 'total') })
        })

        return sortByKey(foodSupplier, 'total')
    }

    /**
    * Servicio para obtener los gastos
    * @param start fecha de inicio
    * @param end fecha final
    * @param search texto filtro
    */
    async callServiceSearchExpenses(start: string, end: string, search: string = "") {
        return new Promise((resolve, error) => {
            this.service.searchExpense(this.branchSelected.id, start, end, search).subscribe({
                next: (res: any) => {
                    if (Array.isArray(res)) {
                        res = res.map((e: any) => {
                            let monthNumber = this.dates.getMonthNumber(e.expenseDate)
                            let month = this.dates.getMonthName(e.expenseDate, 'MMMM')
                            let shortMonth = this.dates.getMonthName(e.expenseDate, 'MMM')
                            let category = e.foodCategories.name
                            let categoryCode = e.foodCategories.code

                            return { ...e, month, monthNumber, shortMonth, category, categoryCode }
                        })
                        resolve(res)
                    } else {
                        error("Ocurrio un error al obtener los Gastos, la respuesta no es una lista.")
                    }
                    
                },
                error: (e) => {
                    error("Ocurrio un error al obtener los Gastos.")
                }
            })
        })
    }

    /**
     * Agrupar gastos por una Key
     * @param expenses  listado de los gastos
     * @param keySort Property/Key por la que se va a agrupar
     * @returns listado agrupado
     */
    public static group(expenses: Array<any>, keySort: string): Array<any> {
        let sort: any = groupArrayByKey(expenses, keySort)
        let expensesGrouped: any = []

        Object.keys(sort).map((k: string) => {
            expensesGrouped.push({id: k, data: sort[k]})
        })
        return expensesGrouped
    }

    /**
     * * Suma el total de los gastos por categoria agrupada
     * @param expenses listado de gastos
     * @param key clave a agrupar
     * @returns total de los gastos por clave agrupada
     */
    public static sumTotalExpenseGrouped(expenses: Array<any>, key: string): Array<any> {
        let expensesGrouped = this.group(expenses, key)
        let sumTotalData: Array<any> = []
        expensesGrouped.map((d: any) => {
            let total = d.data.reduce((total: number, obj: any) => total + obj.amount, 0)
            sumTotalData.push({name: d.id, total: Number(total.toFixed(2))})
        })

        return sumTotalData
    }
}