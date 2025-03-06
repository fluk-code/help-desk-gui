/* eslint-disable sonarjs/no-duplicate-string */
import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { SignalingClientService } from '../websocket/signaling-client.service';
import { P2PChatService } from './p2p-chat.service';

type PeerConnectionSubject = {
  room: string;
  peerConnection?: RTCPeerConnection;
  remoteStream?: MediaStreamTrack;
};

// TODO: Move to environment
const rtcConfiguration: RTCConfiguration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class PeerConnectionService {
  private readonly peers: Map<string, BehaviorSubject<PeerConnectionSubject>> = new Map();
  private readonly iceStateSubject = new BehaviorSubject<Map<string, Set<string>>>(new Map());

  constructor(
    private readonly signalingClientService: SignalingClientService,
    private readonly p2pChatService: P2PChatService
  ) {}

  peerConnection$(peerId: string): Observable<PeerConnectionSubject> | undefined {
    const peerSubject = this.peers.get(peerId);

    if (!peerSubject) {
      console.error('Peer not found');
      return;
    }

    return peerSubject;
  }

  get iceState$(): Observable<Map<string, Set<string>>> {
    return this.iceStateSubject.asObservable();
  }

  createPeerConnection(room: string, peerId: string, isOfferCreator: boolean): void {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    isOfferCreator && this.p2pChatService.createDataChannel(room, peerId, peerConnection);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingClientService.sendIceCandidate(room, peerId, event.candidate);
      }
    };

    peerConnection.ontrack = (event) => {
      const peerSubject = this.peers.get(peerId);

      if (peerSubject) {
        peerSubject.next({ room, remoteStream: event.track, peerConnection });
      } else {
        console.error('Peer not found');
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(
        ` ICE connection state changed to: ${peerConnection.iceConnectionState} from: ${room}`
      );

      if (
        peerConnection.iceConnectionState === 'completed' ||
        peerConnection.iceConnectionState === 'connected'
      ) {
        const iceStateSubject = this.iceStateSubject.value;
        const peers = iceStateSubject.get(room) || new Set<string>();
        peers.add(peerId);
        iceStateSubject.set(room, peers);
        this.iceStateSubject.next(iceStateSubject);
      } else if (
        peerConnection.iceConnectionState === 'disconnected' ||
        peerConnection.iceConnectionState === 'failed' ||
        peerConnection.iceConnectionState === 'closed'
      ) {
        const peerCompleted = this.iceStateSubject.value;
        const peers = peerCompleted.get(room) || new Set<string>();
        peers.delete(peerId);
        peerCompleted.set(room, peers);
        this.iceStateSubject.next(peerCompleted);
      }
    };

    const peerSubject = new BehaviorSubject<PeerConnectionSubject>({
      peerConnection,
      room,
    });

    this.peers.set(peerId, peerSubject);
  }

  async createOffer(room: string, peerId: string): Promise<void> {
    this.createPeerConnection(room, peerId, true);

    const peerSubject = this.peers.get(peerId);
    const peerConnection = peerSubject?.value.peerConnection;

    if (!peerConnection) {
      console.error('Peer connection not found');
      return;
    }

    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);

    peerSubject.next({ peerConnection, room });
    this.signalingClientService.sendOffer(room, peerId, offer);
  }

  async createAnswer(
    room: string,
    peerId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    this.createPeerConnection(room, peerId, false);

    const peerSubject = this.peers.get(peerId);
    const peerConnection = peerSubject?.value.peerConnection;

    if (!peerConnection) {
      console.error('Peer connection not found');
      return;
    }

    peerConnection.ondatachannel = (event) => {
      console.log(`Data channel is being created by: ${peerId}`);
      const dataChannel = event.channel;
      this.p2pChatService.configureChatDataChannel(room, peerId, dataChannel);
    };

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    peerSubject.next({ peerConnection, room });
    this.signalingClientService.sendAnswer(room, peerId, answer);
  }

  async addIceCandidate(room: string, peerId: string, candidate: RTCIceCandidate): Promise<void> {
    const peerSubject = this.peers.get(peerId);
    const peerConnection = peerSubject?.value.peerConnection;

    if (!peerConnection) {
      console.error('Peer connection not found');
      return;
    }

    await peerConnection.addIceCandidate(candidate);
    // peerConnection.onicecandidate = (event) => {
    //   if (event.candidate) {
    //     this.signalingClientService.sendIceCandidate(room, peerId, event.candidate);
    //   } else {
    //     console.warn('All ICE candidates have been sent');
    //   }
    // };
    peerSubject.next({ peerConnection, room });
  }

  async addAnswer(room: string, peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerSubject = this.peers.get(peerId);
    const peerConnection = peerSubject?.value.peerConnection;

    if (!peerConnection) {
      console.error('Peer connection not found');
      return;
    }

    await peerConnection.setRemoteDescription(answer);
    peerSubject.next({ peerConnection, room });
  }
}
