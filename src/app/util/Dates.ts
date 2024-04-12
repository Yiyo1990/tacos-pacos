import * as moment from 'moment'
import { firstUpperCase } from './util'

export class Dates {
    private startYear: number = 2022;

    constructor() {
        moment.locale('es')
    }

    public getWeekDay(date: string) {
        try {
            const dateM = moment(date, 'DD-MM-yyyy HH:mm:ss')
            return firstUpperCase(dateM.format('dddd'))
        } catch (e) {
            return ''
        }
    }

    public getMonthName(date: string, format: string = "MMMM") {
        try {
            const dateM = moment(date, 'DD-MM-yyyy')
            return dateM.format(format).toUpperCase()
        } catch (e) {
            return ''
        }
    }

    formatDate(date: any, formatTo: string = 'DD-MM-yyyy', formatOf: string = 'DD-MM-yyyy HH:mm:ss') {
        const dateM = moment(date, formatOf)
        return dateM.format(formatTo)
    }

    convertToDate(date: any) {
        const dateM = moment(date, 'DD-MM-yyyy HH:mm:ss')
        return dateM.toDate()
    }

    getMonths(shortName: boolean = true): any[] {
        const meses = [];
        let format = shortName ? 'MMM': 'MMMM'
        for (let i = 0; i < 12; i++) {
            const mes = moment().month(i).format(format);
            const mFormat = moment().month(i).format("DD-MM-YYYY")
            meses.push({id: i+1, name: firstUpperCase(mes.replace(".","")), mFormat});
        }
        return meses
    }

    getFormatDate(date: any, format: string = 'YYYY-MM-DDTHH:mm:ss.SSSS') {
        const dateM = moment(date, format)
        return dateM.format('DD-MM-yyyy')
    }

    getStartAndEndDayMonth(month: number, year: number) {
        month = month == 0 ? 1 : month
        let monthDate = moment(new Date(year, month-1))
        const startOfMonth = monthDate.startOf('month').format('DD-MM-YYYY');
        const endOfMonth   = monthDate.endOf('month').format('DD-MM-YYYY');
        return {start: startOfMonth, end: endOfMonth}
    }

    getStartAndEndYear(year: number) {
        year = year == 0 ? moment().year() : year
        const startOfYear = moment(new Date(year, 0, 1)).format('DD-MM-YYYY');
        const endOfYear   = moment(new Date(year, 11, 31)).format('DD-MM-YYYY');
        return {start: startOfYear, end: endOfYear} 
    }

    getYears() : number[] {
        let years: number[] = []
        let year = moment().year()
        while(this.startYear <= year) {
            years.push(this.startYear)
            this.startYear += 1
        }
        return years.sort((a,b) => { return b - a})
    }

    getCurrentYear(){
        return moment().year()
    }

    getCurrentMonth() {
        return moment().month()
    }

    getWeekNumberDay(date: string) {
        let r = new Date(date)
        return r.getDay()
    }

    public getMonthNumber(date: string, format: string = "M") {
        try {
            const dateM = moment(date, 'DD-MM-yyyy')
            return dateM.format(format)
        } catch (e) {
            return 0
        }
    }
}

