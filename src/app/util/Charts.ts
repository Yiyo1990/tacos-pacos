
export class Charts {
  public static chartColors = { general: '#2b65ab', dinningRoom: "#3889EB", uber: "#31B968", rappi: "#F31A86", didi: "#F37D1A" }

  public static Donut(labels: string[], data: any[], colors: any[]): any {

    return {
      labels: labels,
      datasets: [
        { data: data, backgroundColor: colors },
      ],
    };
  }
}