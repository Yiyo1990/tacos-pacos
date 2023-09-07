
export class Charts {

    public static Donut(labels: string[], data: number[]) : any {
        
        return {
            labels: labels,
            datasets: [
              { data: data},
            ],
          };
    }
}