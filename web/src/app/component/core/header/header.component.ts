import { Component, OnInit } from '@angular/core';
import { ApplicationService } from 'src/app/service/application.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  title$ = this.app.title$;

  constructor(private app: ApplicationService) { }

  ngOnInit() {
  }
}
