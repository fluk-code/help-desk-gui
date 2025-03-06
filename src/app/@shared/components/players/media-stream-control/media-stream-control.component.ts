import { Component } from '@angular/core';

import { CamSelectComponent } from '../../medias/cam-select/cam-select.component';
import { MicSelectComponent } from '../../medias/mic-select/mic-select.component';
import { SoundSelectComponent } from '../../medias/sound-select/sound-select.component';

@Component({
  selector: 'fk-media-stream-control',
  standalone: true,
  imports: [MicSelectComponent, SoundSelectComponent, CamSelectComponent],
  templateUrl: './media-stream-control.component.html',
  styleUrl: './media-stream-control.component.scss',
})
export class MediaStreamControlComponent {}
