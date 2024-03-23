import { ReportChannel } from "src/app/util/util"

export class Sale {

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
            card: { total: Number(totalPayment.toFixed(2)), percent: percentPayment ? `${Math.round(percentPayment)}%` : '0%' },
            cash: { total: Number(totalParrot.toFixed(2)), percent: percentParrot ? `${Math.round(percentParrot)}%` : '0%' }
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