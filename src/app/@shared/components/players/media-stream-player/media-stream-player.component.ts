import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { UserMediaStreamService } from '../../../services/media/user-media-stream.service';
import { MediaStreamControlComponent } from '../media-stream-control/media-stream-control.component';

@Component({
  selector: 'fk-media-stream-player',
  standalone: true,
  imports: [MediaStreamControlComponent],
  templateUrl: './media-stream-player.component.html',
  styleUrl: './media-stream-player.component.scss',
})
export class MediaStreamPlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement')
  private readonly videoElementRef!: ElementRef<HTMLVideoElement>;

  constructor(private readonly mediaStreamService: UserMediaStreamService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMediaStream();
  }

  private async initMediaStream() {
    this.mediaStreamService.mediaStream$().subscribe((mediaStream) => {
      this.videoElementRef.nativeElement.srcObject = mediaStream;
    });
  }
}
