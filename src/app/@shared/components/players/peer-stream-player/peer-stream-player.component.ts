import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

import { PeerConnectionService } from '../../../services/p2p/peer-connection.service';

@Component({
  selector: 'fk-peer-stream-player',
  standalone: true,
  imports: [],
  templateUrl: './peer-stream-player.component.html',
  styleUrl: './peer-stream-player.component.scss',
})
export class PeerStreamPlayerComponent implements AfterViewInit {
  @Input({ required: true })
  peerId!: string;

  @ViewChild('videoElement')
  private readonly videoElementRef!: ElementRef<HTMLVideoElement>;

  constructor(private readonly peerConnectionService: PeerConnectionService) {}

  ngAfterViewInit(): void {
    this.onPeerConnection();
  }

  onPeerConnection(): void {
    this.peerConnectionService.peerConnection$(this.peerId)?.subscribe((peerConnection) => {
      if (peerConnection.remoteStream) {
        this.videoElementRef.nativeElement.srcObject = new MediaStream([
          peerConnection.remoteStream,
        ]);
      }
    });
  }
}
