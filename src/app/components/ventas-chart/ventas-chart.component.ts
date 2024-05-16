import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { ChartData, ChartOptions, ChartType } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { Charts } from "src/app/util/Charts";
import { Dates } from "src/app/util/Dates";
import { groupArrayByKey, pieChartOptions, barChartOptions } from "src/app/util/util";

@Component({
    selector: 'ventas-chart',
    templateUrl: './ventas-chart,component.html',
    styleUrls: ['./ventas-chart.component.scss']
})

export class VentasChartComponent implements OnChanges, OnInit {

    @Input() sales: any[] = []
    @Input() isResultadosScreen: boolean = false
    @Input() brandSelected: any
    @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;
    @Output() typeFilterEvent: EventEmitter<any> = new EventEmitter()
    public pieChartPlugins = [];
    dates = new Dates()

    private typeFilterBarChart = 2
    private typeFilterAppBarChart = 1

    isBtnMonthActive: boolean = false
    barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
    isBtnParrotActive: number = 2
    private chartColors = Charts.chartColors
    channelSales: any = {}
    salesDonutChartData: any
    paymentType: any = {}

    barChartOptions: ChartOptions = barChartOptions
    public barChartType: ChartType = 'bar';

    pieChartOptions: ChartOptions = pieChartOptions

    commerces: any[] = []
    salesChannel: Array<any> = []

    ngOnInit(): void {
        this.typeFilterBarChart = this.isResultadosScreen ? 1 : 2
    }


    ngOnChanges(changes: SimpleChanges): void {
        this.getPaymentType()
        this.fillDonughtChart()
        this.getCommerces()
    }


    fillBarChart(typeFilter: number = 1, type: number = 1) {
        this.typeFilterBarChart = typeFilter == 0 ? this.typeFilterBarChart : typeFilter
        this.typeFilterAppBarChart = type == 0 ? this.typeFilterAppBarChart : type
        this.isBtnMonthActive = this.typeFilterBarChart == 1
        let data: any[] = []
        this.barChartData.datasets = []
        this.barChartData.labels = []
        let grouped = !this.isBtnMonthActive ? groupArrayByKey(this.sales, 'day') : groupArrayByKey(this.sales, 'shortMonth')
        let barchartLabels = Object.keys(grouped)

        let listTotalDinningRoom: any = []
        let listTotalDidi: any = []
        let listTotalUber: any = []
        let listTotalRappi: any = []
        let listTotalVenta: any = []

        let months = this.dates.getMonths()
        if (this.isResultadosScreen) {

            months.map((m: any) => {
                this.barChartData.labels?.push(m.name.toUpperCase())
                listTotalDinningRoom.push(0)
                listTotalDidi.push(0)
                listTotalUber.push(0)
                listTotalRappi.push(0)
                listTotalVenta.push(0)
            })
        }
        barchartLabels.map((day: any) => {
            let monthIndex = 0
            if (this.isResultadosScreen) {
                monthIndex = months.find((m: any) => m.name.toUpperCase() == day).id - 1
            }

            let dataDay = grouped[day]
            let totalDinnigRoom = 0
            let totalDidi = 0
            let totalUber = 0
            let totalRappi = 0

            dataDay.map((d: any) => {
                totalDinnigRoom += Number(d.totalDinnigRoom)
                totalDidi += this.isBtnParrotActive == 2 ? Number(d.apps.didi.sale) : Number(d.apps.didi.income)
                totalUber += this.isBtnParrotActive == 2 ? Number(d.apps.uber.sale) : Number(d.apps.uber.income)
                totalRappi += this.isBtnParrotActive == 2 ? Number(d.apps.rappi.sale) : Number(d.apps.rappi.income)
            })

            if (!this.isResultadosScreen) {
                listTotalDinningRoom.push(totalDinnigRoom)
                listTotalDidi.push(totalDidi)
                listTotalUber.push(totalUber)
                listTotalRappi.push(totalRappi)
                listTotalVenta.push(totalDinnigRoom + totalDidi + totalUber + totalRappi)
            } else {
                listTotalDinningRoom[monthIndex] = totalDinnigRoom
                listTotalDidi[monthIndex] = totalDidi
                listTotalUber[monthIndex] = totalUber
                listTotalRappi[monthIndex] = totalRappi
                listTotalVenta[monthIndex] = totalDinnigRoom + totalDidi + totalUber + totalRappi
            }

            if (!this.isResultadosScreen)
                this.barChartData.labels?.push(day)
        })


        if (this.typeFilterAppBarChart == 1) {
            data.push({ data: listTotalDinningRoom, label: '', backgroundColor: this.chartColors.dinningRoom, stack: 'a' })
            data.push({ data: listTotalDidi, label: '', backgroundColor: this.chartColors.didi, stack: 'a' })
            data.push({ data: listTotalUber, label: '', backgroundColor: this.chartColors.uber, stack: 'a' })
            data.push({ data: listTotalRappi, label: '', backgroundColor: this.chartColors.rappi, stack: 'a' })
        } else if (this.typeFilterAppBarChart == 2) {
            data.push({ data: listTotalVenta, label: '', backgroundColor: this.chartColors.general, stack: 'a' })
        } else if (this.typeFilterAppBarChart == 3) {
            data.push({ data: listTotalDinningRoom, label: '', backgroundColor: this.chartColors.dinningRoom, stack: 'a' })
        } else if (this.typeFilterAppBarChart == 4) {
            data.push({ data: listTotalUber, label: '', backgroundColor: this.chartColors.uber, stack: 'a' })
        } else if (this.typeFilterAppBarChart == 5) {
            data.push({ data: listTotalRappi, label: '', backgroundColor: this.chartColors.rappi, stack: 'a' })
        } else if (this.typeFilterAppBarChart == 6) {
            data.push({ data: listTotalDidi, label: '', backgroundColor: this.chartColors.didi, stack: 'a' })
        }

        data.map(d => {
            this.barChartData.datasets.push(d)
        })

        this.charts?.forEach(c => {
            c.chart?.update()
        })

        this.typeFilterEvent.emit({ parrot: this.isBtnParrotActive, filter: this.typeFilterAppBarChart })

    }

    fillDonughtChart(type: number = 1) {
        this.isBtnParrotActive = type
        if (type == 1 || type == 2) {
            let data = this.sales

            let totalDinnigRoom = data.reduce((total, sale) => total + Number(sale.diningRoom), 0)
            let totalDelivery = data.reduce((total, sale) => total + Number(sale.delivery), 0)
            let totalPickUp = data.reduce((total, sale) => total + Number(sale.pickUp), 0)
            let totalTakeout = data.reduce((total, sale) => total + Number(sale.takeout), 0)

            let totalUber = type == 2 ? data.reduce((total, sale) => total + Number(sale.apps.uber.sale), 0) : data.reduce((total, sale) => total + Number(sale.apps.uber.income), 0)
            let totalDidi = type == 2 ? data.reduce((total, sale) => total + Number(sale.apps.didi.sale), 0) : data.reduce((total, sale) => total + Number(sale.apps.didi.income), 0)
            let totalRappi = type == 2 ? data.reduce((total, sale) => total + Number(sale.apps.rappi.sale), 0) : data.reduce((total, sale) => total + Number(sale.apps.rappi.income), 0)

            let total = totalDinnigRoom + totalDelivery + totalPickUp + totalTakeout + totalDidi + totalUber + totalRappi
            let percentDinningRoom = Math.round(((totalDinnigRoom) * 100) / total)
            let percentDelivery = Math.round(((totalDelivery) * 100) / total)
            let percentPickUp = Math.round(((totalPickUp) * 100) / total)
            let percentTakeOut = Math.round(((totalTakeout) * 100) / total)

            let percentDidi = Math.round((totalDidi * 100) / total)
            let percentUber = Math.round((totalUber * 100) / total)
            let percentRappi = Math.round((totalRappi * 100) / total)

            this.channelSales = [
                {
                    name: 'Total',
                    total: total,
                    percent: total > 0 ? 100 : 0,
                    color: "#fff"
                },
                {
                    name: 'Comedor',
                    total: totalDinnigRoom,
                    percent: percentDinningRoom ? percentDinningRoom : 0,
                    color: this.chartColors.dinningRoom
                },
                {
                    name: 'Para Llevar',
                    total: totalTakeout,
                    percent: percentTakeOut ? percentTakeOut : 0,
                    color: this.chartColors.dinningRoom
                },
                {
                    name: 'Recoger',
                    total: totalPickUp,
                    percent: percentPickUp ? percentPickUp : 0,
                    color: this.chartColors.dinningRoom
                },
                {
                    name: 'Domicilio',
                    total: totalDelivery,
                    percent: percentDelivery ? percentDelivery : 0,
                    color: this.chartColors.dinningRoom
                },
                {
                    name: 'Uber',
                    total: totalUber,
                    percent: percentUber ? percentUber : 0,
                    color: this.chartColors.uber
                },
                {
                    name: 'Didi',
                    total: totalDidi,
                    percent: percentDidi ? percentDidi : 0,
                    color: this.chartColors.didi
                },
                {
                    name: 'Rappi',
                    total: totalRappi,
                    percent: percentRappi ? percentRappi : 0,
                    color: this.chartColors.rappi
                }
            ]

            this.salesDonutChartData = Charts.Donut(['Comedor', 'ParaLlevar', 'Recoger', 'Domicilio', 'Uber', 'Didi', 'Rappi'], [percentDinningRoom, percentTakeOut, percentPickUp, percentDelivery, percentUber, percentDidi, percentRappi], [this.chartColors.dinningRoom, this.chartColors.dinningRoom, this.chartColors.dinningRoom, this.chartColors.dinningRoom, this.chartColors.uber, this.chartColors.didi, this.chartColors.rappi])
            this.fillBarChart(this.typeFilterBarChart, this.typeFilterAppBarChart)
        }

    }

    async getPaymentType() {

        let data = this.sales
        let totalParrot = data.reduce((total, sale) => total + Number(sale.apps.parrot.sale), 0)

        let paymentUber = data.reduce((total, sale) => total + Number(sale.apps.uber.income), 0)
        let paymentDidi = data.reduce((total, sale) => total + Number(sale.apps.didi.income), 0)
        let paymentRappi = data.reduce((total, sale) => total + Number(sale.apps.rappi.income), 0)
        let paymentParrot = data.reduce((total, sale) => total + Number(sale.apps.parrot.income), 0)

        let totalPayment = (paymentUber + paymentDidi + paymentRappi + paymentParrot)
        let percentParrot = (totalParrot * 100) / (totalParrot + totalPayment)
        let percentPayment = (totalPayment * 100) / (totalParrot + totalPayment)
        this.paymentType.totalParrot = Number(totalParrot.toFixed(2))
        this.paymentType.totalPayment = Number(totalPayment.toFixed(2))
        this.paymentType.percentParrot = percentParrot ? `${Math.round(percentParrot)}%` : '0%'
        this.paymentType.percentPayment = percentPayment ? `${Math.round(percentPayment)}%` : '0%'
    }

    getCommerces() {
        this.commerces = this.brandSelected?.commerces.map((c: any) => { return { ...c, total: 0, percent: '100%' } })
    }
}
