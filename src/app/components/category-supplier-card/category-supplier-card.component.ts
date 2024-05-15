import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'category-supplier-card',
  templateUrl: './category-supplier-card.component.html',
  styleUrls: ['./category-supplier-card.component.scss']
})
export class CategorySupplierCardComponent {
  @Input() isEditable: boolean = false
  @Input() data: Array<any> = []
  @Input() nameCategory: string = ""
  @Output() onActionEvent: EventEmitter<any> = new EventEmitter()
  @Output() onAddCategoryEvent: EventEmitter<any> = new EventEmitter()
  @Input() isInsumo: boolean = false


  onClickActions(type: number, item: any) {
    this.onActionEvent.emit({type: type, item: item})
  }

  onClickAddCategory() {
    this.onAddCategoryEvent.emit()
  }
}


