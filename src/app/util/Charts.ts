
export class Charts {
  public static chartColors = { general: '#2b65ab', dinningRoom: "#3889EB", uber: "#31B968", rappi: "#F31A86", didi: "#F37D1A", ventas: '#3c8be6', gastos: '#f8a130', profit: '#60bb60' }

  public static Donut(labels: string[], data: any[], colors: any[]): any {

    return {
      labels: labels,
      datasets: [
        { data: data, backgroundColor: colors },
      ],
    };
  }
}