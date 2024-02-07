import { Component, Input } from '@angular/core';

@Component({
  selector: 'category-supplier-card',
  templateUrl: './category-supplier-card.component.html',
  styleUrls: ['./category-supplier-card.component.scss']
})
export class CategorySupplierCardComponent {
  @Input() isEditable: boolean = false
  @Input() providers: Array<any> = []
  @Input() nameCategory: string = ""
}
