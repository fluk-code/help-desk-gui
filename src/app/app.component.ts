import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  // constructor(private readonly mediaService: MediaService) {}
  // ngOnInit(): void {
  //   this.mediaService.initializeLocalStream();
  // }
}
