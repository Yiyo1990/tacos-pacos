import { ReportChannel, firstUpperCase, groupArrayByKey } from "src/app/util/util"
import { SalesService } from "./sales-service.service"
import { Dates } from "@util/Dates"
import { group } from "@angular/animations"

export class Sale {
    dates = new Dates()

    constructor(private service: SalesService) { }

    /**
     * Llama servicio para obtener las ventas
     * @param startDate fecha inicio
     * @param endDate fecha fin
     * @param branchId id de la sucursal
     * @returns 
     */
    async salesService(startDate: string, endDate: string, branchId: number) {

        return new Promise((resolve, error) => {
            let salesByDay: Array<any> = []
            let days: Array<any> = []
            let sales: Array<any> = []
            this.service.getReportSalesByDateRange(branchId, startDate, endDate).subscribe({
                next: (data: any) => {
                    if (Array.isArray(data)) {
                        let salesData = data.map((s: any) => {
                            let diningRoom = s.diningRoom.toFixed(2)
                            let pickUp = s.pickUp.toFixed(2)
                            let takeout = s.takeout.toFixed(2)
                            let delivery = s.delivery.toFixed(2)
                            let totalDinnigRoom = Sale.totalDinningRoom(s) //s.diningRoom + s.pickUp + s.takeout + s.delivery

                            let day = firstUpperCase(s.day)
                            let month = this.dates.getMonthName(s.dateSale)
                            let shortMonth = this.dates.getMonthName(s.dateSale, 'MMM')
                            days.push(s.dateSale)

                            let apps = Sale.addPlatafformInData(s)//this.addPlatafformsData(s)

                            let totalApps = Sale.totalAppsParrot(apps)//(Number(apps.uber.sale) + Number(apps.didi.sale) + Number(apps.rappi.sale))
                            let totalIncomeApps = Sale.totalAppsIncome(apps) //(Number(apps.uber.income) + Number(apps.didi.income) + Number(apps.rappi.income))
                            let totalSale = (totalDinnigRoom + totalApps)
                            salesByDay.push((totalDinnigRoom + totalIncomeApps))
                            let channel = s.reportChannel.channel

                            return { ...s, totalSale: totalSale.toFixed(2), diningRoom, pickUp, takeout, delivery, totalDinnigRoom: totalDinnigRoom.toFixed(2), day, apps, totalApps: totalApps.toFixed(2), month, shortMonth: shortMonth.replace(".", ""), channel }
                        })

                        sales = salesData
                        resolve({ sales, salesByDay, days })
                    } else {
                        error("Ocurrio un error al intentar obtener las ventas")
                    }
                },
                error: (e) => {
                    error("Ocurrio un error al intentar obtener las ventas")
                }
            })
        })


    }


    /**
     * Agrega  los objetos plataformas a las ventas
     * @param sales 
     * @returns 
     */
    public static addPlatafformInData(sale: any): any {
        let parrot = sale.reportChannel.find((s: any) => s.channel == ReportChannel.PARROT)
        let uber = sale.reportChannel.find((s: any) => s.channel == ReportChannel.UBER_EATS)

        let didi = sale.reportChannel.find((s: any) => s.channel == ReportChannel.DIDI_FOOD)
        let rappi = sale.reportChannel.find((s: any) => s.channel == ReportChannel.RAPPI)

        return { parrot: this.fixedData(parrot), uber: this.fixedData(uber), didi: this.fixedData(didi), rappi: this.fixedData(rappi) }
    }

    /**
     * Obtiene el total de las ventas ingresos
     * @param sales 
     * @returns 
     */
    public static getTotalSalesIncome(sales: Array<any>): number {
        let totalDinnigRoom = sales.reduce((total: number, sale: any) => total + Number(sale.diningRoom), 0)
        let totalDelivery = sales.reduce((total: number, sale: any) => total + Number(sale.delivery), 0)
        let totalPickUp = sales.reduce((total: number, sale: any) => total + Number(sale.pickUp), 0)
        let totalTakeout = sales.reduce((total: number, sale: any) => total + Number(sale.takeout), 0)

        let totalUber = sales.reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
        let totalDidi = sales.reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
        let totalRappi = sales.reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)

        return (totalDinnigRoom + totalDelivery + totalPickUp + totalTakeout + totalUber + totalDidi + totalRappi)
    }

    /**
     * Agrega decimales a los tipos de ventas
     * @param data 
     * @returns 
     */
    private static fixedData(data: any): any {
        data.commission = data.commission.toFixed(2)
        data.sale = data.sale.toFixed(2)
        let percent = ((Number(data.income) * 100) / Number(data.sale))
        data.tax = percent ? (percent).toFixed(1) : (data.tax * 100).toFixed(1)
        data.income = data.income ? data.income.toFixed(2) : '0.00'

        return data
    }

    /**
     * Obtiene el total de ventas Parrot
     * @param sales listaod de ventas
     * @returns 
     */
    public static getTotalParrot(sales: Array<any>): number {
        return sales.reduce((total: number, sale: any) => total + Number(sale.apps.parrot.sale), 0)
    }

    /**
     * Total de las ventas con tarjeta
     * @param sales listado de ventas
     * @returns 
     */
    public static getTotalCard(sales: Array<any>): number {
        return sales.filter((a: any) => a.apps.parrot.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.parrot.income), 0)
    }

    /**
     * Total de las ventas ingreso de las applicaciones que ya han sido Pagadas
     * @param sales 
     * @returns 
     */
    public static totalAppsIncomePaid(sales: Array<any>): number {
        let totalApps = 0
        totalApps = totalApps + sales.filter((s: any) => s.apps.uber.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
        totalApps = totalApps + sales.filter((s: any) => s.apps.didi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
        totalApps = totalApps + sales.filter((s: any) => s.apps.rappi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)
        return totalApps
    }

    /**
     * Total de las ventas ingreso de las applicaciones que no han sido Pagadas
     * @param sales 
     * @returns 
     */
    public static totalAppsIncomeNoPaid(sales: Array<any>): number {
        let totalApps = 0
        totalApps = totalApps + sales.filter((s: any) => !s.apps.uber.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
        totalApps = totalApps + sales.filter((s: any) => !s.apps.didi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
        totalApps = totalApps + sales.filter((s: any) => !s.apps.rappi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)
        return totalApps
    }


    /**
     * Obtiene el total y porcentaje de las ventas Parrot agrupado por el tipo de pago Tarjeta y Efectivo
     * @param sales 
     * @returns 
     */
    public static getPaymentType(sales: Array<any>): any {

        //let data = this.sales
        let totalParrot = sales.reduce((total, sale) => total + Number(sale.apps.parrot.sale), 0)

        let paymentUber = sales.reduce((total, sale) => total + Number(sale.apps.uber.income), 0)
        let paymentDidi = sales.reduce((total, sale) => total + Number(sale.apps.didi.income), 0)
        let paymentRappi = sales.reduce((total, sale) => total + Number(sale.apps.rappi.income), 0)
        let paymentParrot = sales.reduce((total, sale) => total + Number(sale.apps.parrot.income), 0)

        let totalPayment = (paymentUber + paymentDidi + paymentRappi + paymentParrot)
        let percentParrot = (totalParrot * 100) / (totalParrot + totalPayment)
        let percentPayment = (totalPayment * 100) / (totalParrot + totalPayment)

        return {
            totalParrot: Number(totalParrot.toFixed(2)),
            totalPayment: Number(totalPayment.toFixed(2)),
            percentParrot:  percentParrot ? `${Math.round(percentParrot)}%` : '0%',
            percentPayment:  percentPayment ? `${Math.round(percentPayment)}%` : '0%'
        }
    }

    /**
     * Total de las ventas en Comedor
     * @param sale venta
     * @returns 
     */
    public static totalDinningRoom(sale: any): number {
        return sale.diningRoom + sale.pickUp + sale.takeout + sale.delivery
    }

    /**
     * Suma el total de las ventas Parrot por aplicación 
     * @param apps 
     * @returns 
     */
    public static totalAppsParrot(apps: any): number {
        return (Number(apps.uber.sale) + Number(apps.didi.sale) + Number(apps.rappi.sale))
    }

    /**
     * Suma el total de las ventas Ingreso por aplicaciones
     */
    public static totalAppsIncome(apps: any): number {
        return (Number(apps.uber.income) + Number(apps.didi.income) + Number(apps.rappi.income))
    }

}