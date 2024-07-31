import { Component, Input } from '@angular/core';
import { LoadingService } from '../loading/loading.service';

@Component({
  selector: 'loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  @Input() isLoading: boolean = true

 constructor(){
 
 }
}
