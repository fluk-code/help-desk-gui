import { filter } from 'rxjs';

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { DisplayMediaStreamService } from '../../../services/media/display-media-stream.service';
import { ActivatedRoomService } from '../../../services/room/activated-room.service';

@Component({
  selector: 'fk-screen-share',
  standalone: true,
  imports: [],
  templateUrl: './screen-share.component.html',
  styleUrl: './screen-share.component.scss',
})
export class ScreenShareComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('videoElement')
  private readonly videoElementRef!: ElementRef<HTMLVideoElement>;

  @Output()
  screenShared = new EventEmitter<{
    roomId: string;
    isShared: boolean;
  }>();

  activatedRoom!: string;

  constructor(
    private readonly displayMediaStreamService: DisplayMediaStreamService,
    private readonly activatedRoomService: ActivatedRoomService
  ) {}

  ngOnInit(): void {
    this.onActivatedRoom();
  }

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomId'] && changes['roomId'].currentValue !== changes['roomId'].previousValue) {
      this.onMediaStream();
    }
  }

  private onMediaStream(): void {
    this.displayMediaStreamService.mediaStream$(this.activatedRoom).subscribe((subject) => {
      if (!this.videoElementRef) {
        return;
      }

      this.videoElementRef.nativeElement.srcObject = subject.mediaStream;
    });
  }

  private onActivatedRoom(): void {
    this.activatedRoomService.activatedRoom$
      .pipe(filter((room) => typeof room === 'string'))
      .subscribe((room) => {
        this.activatedRoom = room;
      });
  }
}
