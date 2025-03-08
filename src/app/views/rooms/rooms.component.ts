import { filter, Subscription, tap } from 'rxjs';

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';

import { MediaStreamControlComponent } from '../../@shared/components/players/media-stream-control/media-stream-control.component';
import { PeerStreamPlayerComponent } from '../../@shared/components/players/peer-stream-player/peer-stream-player.component';
import { UserMediaStreamPlayerComponent } from '../../@shared/components/players/user-media-stream-player/user-media-stream-player.component';
import { ChatComponent } from '../../@shared/components/room/chat/chat.component';
import { ListRoomsComponent } from '../../@shared/components/room/list-rooms/list-rooms.component';
import { ScreenShareComponent } from '../../@shared/components/room/screen-share/screen-share.component';
import { BrowserService } from '../../@shared/services/browser/browser.service';
import { DisplayMediaStreamService } from '../../@shared/services/media/display-media-stream.service';
import { UserMediaStreamService } from '../../@shared/services/media/user-media-stream.service';
import { PeerConnectionService } from '../../@shared/services/p2p/peer-connection.service';
import { SelfIdService } from '../../@shared/services/p2p/self-id.service';
import { ActivatedRoomService } from '../../@shared/services/room/activated-room.service';
import { SignalingClientService } from '../../@shared/services/websocket/signaling-client.service';
import { RoomId, SelfId } from '../../@shared/types/type';

@Component({
  selector: 'fk-room',
  standalone: true,
  imports: [
    CommonModule,
    MediaStreamControlComponent,
    UserMediaStreamPlayerComponent,
    PeerStreamPlayerComponent,
    ChatComponent,
    ListRoomsComponent,
    ScreenShareComponent,
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent implements OnDestroy {
  peersOn = new Map<string, Set<string>>();
  activatedRoom!: string;

  isScreenShared = false;

  private userMediaStreamSubscription = new Subscription();

  constructor(
    private readonly cdRef: ChangeDetectorRef,
    private readonly browserService: BrowserService,
    private readonly userMediaStreamService: UserMediaStreamService,
    private readonly displayMediaStreamService: DisplayMediaStreamService,
    private readonly signalingClientServicer: SignalingClientService,
    private readonly peerConnectionService: PeerConnectionService,
    private readonly activatedRoomService: ActivatedRoomService,
    private readonly selfIdService: SelfIdService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.onActivatedRoom();
    this.onIsActiveWindow();
  }

  toggleShareScreen(room: string): void {
    if (this.isScreenShared) {
      this.displayMediaStreamService.deactivateDisplayMediaStream(room);
    } else {
      this.displayMediaStreamService.activateDisplayMediaStream(room);
    }
  }

  async connectRoom(room: RoomId) {
    try {
      await this.signalingClientServicer.connect(room);
      this.onConnectionSuccessfulPeer(room); // Chame após a conexão estar pronta
    } catch (error) {
      console.error('Erro ao conectar na sala:', error);
      // Lidar com o erro de conexão, por exemplo, exibir uma mensagem ao usuário
    }
  }

  disconnectRoom(roomId: string): void {
    this.displayMediaStreamService.deactivateDisplayMediaStream(roomId);
    this.signalingClientServicer.disconnect(roomId);
  }

  private onActivatedRoom(): void {
    this.activatedRoomService.activatedRoom$.subscribe((roomId) => {
      console.log('Activated room:', roomId);
      this.activatedRoom = roomId;
      this.onUserMediaStream();
    });
  }

  private onConnectionSuccessfulPeer(room: RoomId): void {
    const connectionSuccessful$ = this.signalingClientServicer.connectionSuccessful$(room);

    connectionSuccessful$.subscribe((data: SelfId) => {
      this.selfIdService.setSelfId(room, data);

      this.onIncomingCall(room);
      this.onIncomingOffer(room);
      this.onPeerDisconnecting(room);
      this.onIncomingCandidate(room);
      this.onIncomingAnswer(room);

      this.onIceStateConnected();
    });
  }

  private onIncomingCall(room: RoomId): void {
    const incomingCall$ = this.signalingClientServicer.incomingCall$(room);

    incomingCall$.subscribe(async (peerId) => {
      console.info(`Incoming call from peer ${peerId} in room ${room}`);
      await this.peerConnectionService.createOffer(room, peerId);
    });
  }

  private onPeerDisconnecting(room: RoomId): void {
    const peerDisconnected$ = this.signalingClientServicer.peerDisconnected$(room);

    peerDisconnected$.subscribe((peerId) => {
      this.peersOn.get(room)?.delete(peerId);
    });
  }

  private onIncomingOffer(room: RoomId): void {
    const incomingOffer$ = this.signalingClientServicer.incomingOffer$(room);

    incomingOffer$.subscribe(async (data) => {
      console.info(`Incoming offer from peer ${data.peerId} in room ${room}`);
      await this.peerConnectionService.createAnswer(room, data.peerId, data.offer);
    });
  }

  private onIncomingCandidate(room: RoomId): void {
    const incomingCandidate$ = this.signalingClientServicer.incomingCandidate$(room);

    incomingCandidate$.subscribe(async (data) => {
      console.info(`Incoming candidate from peer ${data.peerId} in room ${room}`);
      await this.peerConnectionService.addIceCandidate(room, data.peerId, data.candidate);
    });
  }

  private onIncomingAnswer(room: RoomId): void {
    const incomingAnswer$ = this.signalingClientServicer.incomingAnswer$(room);

    incomingAnswer$.subscribe(async (data) => {
      console.info(`Incoming answer from peer ${data.peerId} in room ${room}`);
      await this.peerConnectionService.addAnswer(room, data.peerId, data.answer);
    });
  }

  private onIceStateConnected(): void {
    this.peerConnectionService.iceState$.pipe().subscribe((data) => {
      for (const [room, peers] of data.entries()) {
        this.peersOn.set(room, peers);
        this.cdRef.detectChanges();
      }
    });
  }

  private onIsActiveWindow(): void {
    this.browserService.isActiveWindow$().subscribe((isActive) => {
      console.log('isActiveWindow:', isActive);
    });
  }

  private onUserMediaStream(): void {
    console.log('on user media stream', this.activatedRoom);

    this.userMediaStreamSubscription.unsubscribe();
    this.userMediaStreamSubscription = new Subscription();

    this.userMediaStreamService
      .mediaStream$(this.activatedRoom)

      .subscribe((mediaStream) => {
        this.peerConnectionService.addVideoTrack(this.activatedRoom, mediaStream);
      });
  }

  ngOnDestroy(): void {
    this.signalingClientServicer.disconnectAll();
  }
}
