import { Component, Input } from "@angular/core";

@Component({
    selector: 'tbl-sales-left', 
    templateUrl: './tbl-sales-left.component.html',
    styleUrls: ['./tbl-sales-left.component.scss']
})

export class TblSalesLeft {
    @Input() sales: Array<any> = []
}