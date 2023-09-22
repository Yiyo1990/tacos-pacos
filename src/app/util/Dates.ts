import * as moment from 'moment'

export class Dates {

    constructor() {
        moment.locale('es')
    }

    public getWeekDay(date: string) {
        try {
            const dateM = moment(date, 'DD-MM-yyyy HH:mm:ss')
            return dateM.format('dddd')
        } catch(e) {
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

    isDate(fecha: any) {
        fecha = new Date(fecha)
        console.log("valida", fecha)
        return Object.prototype.toString.call(fecha) === '[object Date]' && !isNaN(fecha.getTime())
    }
}
