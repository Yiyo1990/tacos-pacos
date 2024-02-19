import { Component, Input } from '@angular/core';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
 // @Input() visible: boolean = true

  constructor(public loader: LoadingService){
    
  }
}
