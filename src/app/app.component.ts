import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BrowserService } from './@shared/services/browser/browser.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  constructor(private readonly browserService: BrowserService) {}

  ngOnInit(): void {
    this.browserService.initZone();
  }
}
