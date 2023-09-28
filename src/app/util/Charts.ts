
export class Charts {

    public static Donut(labels: string[], data: any[]) : any {
        
        return {
            labels: labels,
            datasets: [
              { data: data},
            ],
          };
    }
}