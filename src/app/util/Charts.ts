
export class Charts {

  public static Donut(labels: string[], data: any[], colors: any[]): any {

    return {
      labels: labels,
      datasets: [
        { data: data, backgroundColor: colors },
      ],
    };
  }
}