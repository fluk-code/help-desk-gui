/* eslint-disable sonarjs/no-duplicate-string */
import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { PeerId, RoomId } from '../../types/type';
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
  private readonly peers: Map<PeerId, BehaviorSubject<PeerConnectionSubject>> = new Map();
  private readonly iceStateSubject = new BehaviorSubject<Map<RoomId, Set<PeerId>>>(new Map());

  constructor(
    private readonly signalingClientService: SignalingClientService,
    private readonly p2pchatService: P2PChatService
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
    const peerSubjectAlreadyExists = this.peers.get(peerId);
    if (peerSubjectAlreadyExists) {
      console.error('Peer connection already exists');
      return;
    }

    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    isOfferCreator && this.p2pchatService.createDataChannel(room, peerId, peerConnection);

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
      console.log('ICE Connection State changed to:', peerConnection.iceConnectionState);

      if (
        peerConnection.iceConnectionState === 'completed' ||
        peerConnection.iceConnectionState === 'connected'
      ) {
        const peerCompleted = this.iceStateSubject.value;
        const peers = peerCompleted.get(room) || new Set<string>();
        peers.add(peerId);
        peerCompleted.set(room, peers);
        this.iceStateSubject.next(peerCompleted);
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

    console.log('Peer connection created:', peerId);
    console.log('Peers:', this.peers);

    this.peers.set(peerId, peerSubject);
  }

  async createOffer(room: string, peerId: string): Promise<void> {
    try {
      this.createPeerConnection(room, peerId, true);

      const peerSubject = this.peers.get(peerId);
      const peerConnection = peerSubject?.value.peerConnection;

      if (!peerConnection) {
        console.error('Peer connection not found');
        return;
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      peerSubject.next({ peerConnection, room });
      this.signalingClientService.sendOffer(room, peerId, offer);
    } catch (error) {
      console.error('Erro ao criar oferta:', error);
      // Trate o erro: feche a conexão, notifique o usuário, etc.
    }
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
      this.p2pchatService.configureChatDataChannel(room, peerId, dataChannel);
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
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingClientService.sendIceCandidate(room, peerId, event.candidate);
      } else {
        console.info('All ICE candidates have been sent');
      }
    };
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
