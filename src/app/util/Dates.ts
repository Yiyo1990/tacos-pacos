import * as moment from 'moment'
import { firstUpperCase } from './util'

export class Dates {

    constructor() {
        moment.locale('es')
    }

    public getWeekDay(date: string) {
        try {
            const dateM = moment(date, 'DD-MM-yyyy HH:mm:ss')
            return dateM.format('dddd')
        } catch (e) {
            return ''
        }
    }

    formatDate(date: any) {
        const dateM = moment(date, 'DD-MM-yyyy HH:mm:ss')
        return dateM.format('DD-MM-yyyy')
    }

    convertToDate(date: any) {
        const dateM = moment(date, 'DD-MM-yyyy HH:mm:ss')
        return dateM.toDate()
    }

    getMonths(): any {
        const meses = [];
        for (let i = 0; i < 12; i++) {
            const mes = moment().month(i).format('MMMM');
            meses.push({id: i+1, name: firstUpperCase(mes)});
        }
        return meses
    }

    getFormatDate(date: any, format: string = 'YYYY-MM-DDTHH:mm:ss.SSSS') {
        const dateM = moment(date, format)
        return dateM.format('DD-MM-yyyy')
    }
}
