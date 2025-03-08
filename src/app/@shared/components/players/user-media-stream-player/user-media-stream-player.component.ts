import { Subscription } from 'rxjs';

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { UserMediaStreamService } from '../../../services/media/user-media-stream.service';
import { ActivatedRoomService } from '../../../services/room/activated-room.service';
import { RoomId } from '../../../types/type';
import { MediaStreamControlComponent } from '../media-stream-control/media-stream-control.component';

@Component({
  selector: 'fk-media-stream-player',
  standalone: true,
  imports: [MediaStreamControlComponent],
  templateUrl: './user-media-stream-player.component.html',
  styleUrl: './user-media-stream-player.component.scss',
})
export class UserMediaStreamPlayerComponent implements OnInit, AfterViewInit {
  activatedRoom!: RoomId;

  private mediaStreamSub = new Subscription();

  @ViewChild('videoElement')
  private readonly videoElementRef!: ElementRef<HTMLVideoElement>;

  constructor(
    private readonly userMediaStreamService: UserMediaStreamService,
    private readonly activatedRoomService: ActivatedRoomService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.onActivatedRoom();
  }

  private onActivatedRoom(): void {
    this.activatedRoomService.activatedRoom$.subscribe((room) => {
      console.log(room);

      this.OnMediaStream(room);
    });
  }

  private async OnMediaStream(room: RoomId) {
    this.mediaStreamSub.unsubscribe();
    this.mediaStreamSub = new Subscription();

    this.mediaStreamSub.add(
      this.userMediaStreamService.mediaStream$(room).subscribe((mediaStream) => {
        this.videoElementRef.nativeElement.srcObject = mediaStream;
      })
    );
  }
}
