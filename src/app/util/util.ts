const configDropdown = {
  displayFn: (item: any) => { return item.name; }, //a replacement ofr displayKey to support flexible text displaying for each item
  displayKey: "name", //if objects array passed which key to be displayed defaults to description
  search: false, //true/false for the search functionlity defaults to false,
  height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
  placeholder: 'Select', // text to be displayed when no item is selected defaults to Select,
  customComparator: () => { return 0 }, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
  limitTo: 0, // number thats limits the no of options displayed in the UI (if zero, options will not be limited)
  moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
  noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
  searchPlaceholder: 'Buscar', // label thats displayed in search input,
  searchOnKey: 'id', // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
  clearOnSelection: true,
  inputDirection: 'ltr'
}

const firstUpperCase = (str: string) => {
  if (str === '') return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}


const groupArrayByKey = (sales: Array<any>, keyName: string): Array<any> => {
  const grouped = sales.reduce((result, item) => {
    let key = item[keyName]
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {})
  return grouped
}

const sortByKey = (array: Array<any>, keyName: string): Array<any> => {
  return array.sort((a: any, b: any) => { return a[keyName] < b[keyName] ? 0 : -1 })
}

const convertObjectToArray  = (obj: any) => {
  let res: any = []
  let keys = Object.keys(obj)
  keys.map((k:any, id: any) => {
    res.push({id: id++, name: k, data: obj[k]})
  })
  return res
}

const fixedData = (data: any) => {
  data.commission = data.commission.toFixed(2)
  data.sale = data.sale.toFixed(2)
  let percent = ((Number(data.income) * 100) / Number(data.sale))
  data.tax = percent ? (percent).toFixed(1) : (data.tax * 100).toFixed(1)
  data.income = data.income ? data.income.toFixed(2) : '0.00'

  return data
}

/**
 * Obtiene el total de las ventas ingresos
 * @param sales 
 * @returns 
 */
const totalSalesByDelivery = (sales: Array<any>) => {
  let totalDinnigRoom = sales.reduce((total: number, sale: any) => total + Number(sale.diningRoom), 0)
  let totalDelivery = sales.reduce((total: number, sale: any) => total + Number(sale.delivery), 0)
  let totalPickUp = sales.reduce((total: number, sale: any) => total + Number(sale.pickUp), 0)
  let totalTakeout = sales.reduce((total: number, sale: any) => total + Number(sale.takeout), 0)

  let totalUber = sales.reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
  let totalDidi = sales.reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
  let totalRappi = sales.reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)

  return (totalDinnigRoom + totalDelivery + totalPickUp + totalTakeout + totalUber + totalDidi + totalRappi)
}

const addPlatafformInData = (sales: any) => {
  let parrot = sales.reportChannel.find((s: any) => s.channel == ReportChannel.PARROT)
  let uber = sales.reportChannel.find((s: any) => s.channel == ReportChannel.UBER_EATS)

  let didi = sales.reportChannel.find((s: any) => s.channel == ReportChannel.DIDI_FOOD)
  let rappi = sales.reportChannel.find((s: any) => s.channel == ReportChannel.RAPPI)

  return { parrot: fixedData(parrot), uber: fixedData(uber), didi: fixedData(didi), rappi: fixedData(rappi) }
}

/**
   * Indicadores de los kpis por categoria 
   *  :::::: TODO: ESTOS DATOS SE MODIFICARAN O SE ENVIARAN DESDE LA BD ::::::
   */
/*const kpisIndicators =
  [
    { code: 'sale', value: 450000, chart: '<$' },
    { code: 'food.alimentos', value: 40, chart: '>%' },
    { code: 'food.sueldos', value: 115000, chart: '>$' },
    { code: 'food.renta', value: 33000, chart: '>$' },
    { code: 'food.servicios', value: 35000, chart: '>$' },
    { code: 'food.comisiones', value: 1.5, chart: '>%' },
    { code: 'food.transporte', value: 12000, chart: '>$' },
    { code: 'food.desechables', value: 2, chart: '>%' },
    { code: 'food.limpieza', value: 1, chart: '>%' },
    { code: 'food.publicidad', value: 7500, chart: '>$' },
    { code: 'food.repartos', value: 15000, chart: '>$' },
    { code: 'food.otros', value: 10000, chart: '>$' },
    { code: 'profit', value: 15, chart: '<%' },
    { code: 'food.impuestos.1', value: 10000, chart: '>$' },
  ]
  */

/**
   * Regresa el color que se pinta en la tabla dependiendo a las reglas del kpi
   * @param kpiIndicator indicador delkpi
   * @param total total a comparar
   * @param totalSale total de la venta
   * @returns 
   */
const getKpiColorAndPercent = (kpiIndicator: any, total: number, totalSale: number = 0) =>  {
  let backgroundColor = '#92d04f'
  let color = '#212529'
  let percent = 100
  if (kpiIndicator.chart.includes("%")) {
    let percentKpi = (kpiIndicator.value / 100);
    let percentTotal = totalSale * percentKpi
    let calc = ((total * 100) / totalSale)
    percent = calc > 1 ? Math.round(calc) : Number(calc.toFixed(1))
    percent = percent ? percent : 0

    if (kpiIndicator.chart.includes(">")) {
      if (total > percentTotal) {
        backgroundColor = "#eb1331"
        color = '#fff'
      }
    } else {
      if (total < percentTotal) {
        backgroundColor = "#eb1331"
        color = '#fff'
      }
    }
  } else {
    percent = Math.round((total * 100) / kpiIndicator.value)
    if (kpiIndicator.chart.includes(">")) {
      if (total > kpiIndicator.value) {
        backgroundColor = "#eb1331"
        color = '#fff'
      }
    } else {
      if (total < kpiIndicator.value) {
        backgroundColor = "#eb1331"
        color = '#fff'
      }
    }
  }

  return {backgroundColor, color, percent};
}

const isNumber = (input: any) => {
  return /^-?\d+(\.\d+)?$/.test(input)
}

const foodPercents = [{selected: true, id: 1, value: 30},{selected: false, id: 2, value: 31},{selected: false, id: 2, value: 32},{selected: false, id: 3, value: 33},{selected: false, id: 4, value: 34},{selected: false, id: 5, value: 35},{selected: false, id: 6, value: 36},{selected: false, id: 7, value: 37},{selected: false, id: 8, value: 38},{selected: false, id: 9, value: 39},{selected: false, id: 10, value: 40}]

const lineChartOptions = {
  responsive: true,
  legend: {
    display: false,
  },
  plugins: {
    legend: {
      display: false,
    }
  },
  scales: {
  },
  curvature: 1
};

const barChartOptions = {
  responsive: true,
  scales: {
    x: {},
    y: {
      min: 10,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
      font: {
        size: 20,
      }
    },
    tooltip: {
      callbacks: {
        title: () => '' // or function () { return null; }
      }
    }
  },
};

const donutChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    datalabels: {
      formatter: (value: any, ctx: any) => {
        if (ctx.chart.data.labels) {
          return ctx.chart.data.labels[ctx.dataIndex];
        }
      },
    },
  },
};

enum ReportChannel {
  PARROT = 'PARROT',
  UBER_EATS = 'UBER_EATS',
  RAPPI = 'RAPPI',
  DIDI_FOOD = 'DIDI_FOOD'
}

enum OperationType {
  TRANSFER = 'type.operation.transferencia',
  CASH = 'type.operation.efectivo',
  BOX = 'type.operation.caja'
}

enum BalanceType {
  VENTAS = 'VENTAS',
  GASTOS = 'GASTOS',
  PROFIT = 'PROFIT'
}

enum Pages {
  MAIN = 'Inicio',
  RESULT = 'Resultados',
  INDICATOR = 'Indicadores KPI´S',
  CASH = 'Cash Flow',
  ESTIMATES = 'Estimaciones',
  ANALISIS = 'Análisis',
  EXPENSES = 'Gastos',
  SUPPLIER = 'Proveedores',
  SALES = 'Ventas',
  INVENTARIO = 'Inventarios',
  INSUMOS = 'Insumos'
}

enum TypeModules {
  MAIN = "MAIN",
  CASH_FLOW = "CASH_FLOW"
}

enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD"
}

export enum GuisoCanal {
  CHANNEL_COMEDOR = 'CHANNEL_COMEDOR',
  CHANNEL_APLICACION = 'CHANNEL_APLICACION'
}

export enum GuisoPresentacion {
  TACO = 'TACO',
  GORDITA = 'GORDITA',
}

export class GuisadoCalculadora {
  id: any = null
  venta: number = 0
  guisoPresentacion = GuisoPresentacion.GORDITA
  guisoCanal = GuisoCanal.CHANNEL_COMEDOR
  costo: number = 0
  percent60: number = 0
  percent = 0
  utilidad = 0

  constructor(presentacion: GuisoPresentacion, canal: GuisoCanal){
    this.guisoPresentacion = presentacion
    this.guisoCanal = canal
  }
}

export class GuisoVenta {
  id!: number
  venta!: number
  ingreso!: number
  guisoPresentacion!: any
  guisoCanal!: any
}

export class GuisoDetalle {
  insumoId!: number
  cantidad!: number
}

export class Guisado {
  id!: number
  nombreGuiso!: string
  cantidad!: number
  unidadMedidaId!: number
  piezas!: number
  guisoDetalle!: any[]
  guisoVenta!: any[]
  branchId!: number
}

export {
  configDropdown, firstUpperCase, sortByKey, barChartOptions, donutChartOptions, pieChartOptions, lineChartOptions,
  groupArrayByKey, ReportChannel, fixedData, OperationType, BalanceType, Pages, totalSalesByDelivery, addPlatafformInData, 
  getKpiColorAndPercent, foodPercents, TypeModules, PaymentMethod, isNumber, convertObjectToArray
}
