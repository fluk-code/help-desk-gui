import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { RoomId, SelfId, PeerId } from '../../types/type';
import { SIGNALING_SERVER_URL } from './room-client.service';

enum SignalingEventOptions {
  CONNECTED = 'connected',
  CALL = 'call',
  OFFER = 'offer',
  ANSWER = 'answer',
  CANDIDATE = 'candidate',
  DISCONNECT_USER = 'disconnect-user',
  DISCONNECTED = 'disconnected',
}

const pleaseConnectToTheRoomFirst = 'Please connect to the room first';

@Injectable({
  providedIn: 'root',
})
export class SignalingClientService {
  private readonly wsUrl = `${SIGNALING_SERVER_URL}/webrtc`;

  private readonly connections = new Map<
    RoomId,
    {
      socket: WebSocket;
      selfId: SelfId;
    }
  >();

  private readonly connectionSuccessfulSubject = new Map<RoomId, Subject<SelfId>>();

  private readonly incomingCallSubject = new Map<RoomId, Subject<PeerId>>();

  private readonly incomingPeerDisconnectionSubject = new Map<RoomId, Subject<PeerId>>();

  private readonly incomingOfferSubject = new Map<
    RoomId,
    Subject<{ peerId: PeerId; offer: RTCSessionDescriptionInit }>
  >();

  private readonly incomingAnswerSubject = new Map<
    RoomId,
    Subject<{ peerId: PeerId; answer: RTCSessionDescriptionInit }>
  >();

  private readonly incomingCandidateSubject = new Map<
    RoomId,
    Subject<{ peerId: PeerId; candidate: RTCIceCandidate }>
  >();

  connectionSuccessful$(room: RoomId): Observable<SelfId> {
    const subject = this.connectionSuccessfulSubject.get(room);

    if (!subject) {
      throw new Error(pleaseConnectToTheRoomFirst);
    }

    return subject.asObservable();
  }

  incomingCall$(room: RoomId): Observable<PeerId> {
    const subject = this.incomingCallSubject.get(room);

    if (!subject) {
      throw new Error(pleaseConnectToTheRoomFirst);
    }

    return subject.asObservable();
  }

  peerDisconnected$(room: RoomId): Observable<PeerId> {
    const subject = this.incomingPeerDisconnectionSubject.get(room);

    if (!subject) {
      throw new Error(pleaseConnectToTheRoomFirst);
    }

    return subject.asObservable();
  }

  incomingOffer$(room: RoomId): Observable<{
    peerId: PeerId;
    offer: RTCSessionDescriptionInit;
  }> {
    const subject = this.incomingOfferSubject.get(room);

    if (!subject) {
      throw new Error(pleaseConnectToTheRoomFirst);
    }

    return subject.asObservable();
  }

  incomingAnswer$(room: RoomId): Observable<{
    peerId: PeerId;
    answer: RTCSessionDescriptionInit;
  }> {
    const subject = this.incomingAnswerSubject.get(room);

    if (!subject) {
      throw new Error(pleaseConnectToTheRoomFirst);
    }

    return subject.asObservable();
  }

  incomingCandidate$(room: RoomId): Observable<{
    peerId: string;
    candidate: RTCIceCandidate;
  }> {
    const subject = this.incomingCandidateSubject.get(room);

    if (!subject) {
      throw new Error(pleaseConnectToTheRoomFirst);
    }

    return subject.asObservable();
  }

  connect(room: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const connection = this.connections.get(room);

      if (connection) {
        // Already connected
        console.warn(`Já conectado na sala ${room}. Ignorando.`);
        resolve();
        return;
      }

      // Crie os Subjects ANTES de conectar
      this.connectionSuccessfulSubject.set(room, new Subject<SelfId>());
      this.incomingCallSubject.set(room, new Subject());
      this.incomingPeerDisconnectionSubject.set(room, new Subject());
      this.incomingOfferSubject.set(room, new Subject());
      this.incomingAnswerSubject.set(room, new Subject());
      this.incomingCandidateSubject.set(room, new Subject());

      const socket = new WebSocket(`${this.wsUrl}?room=${room}`);

      socket.onopen = () => {
        console.log(`Conectado ao WebSocket para a sala ${room}`);

        this.connections.set(room, {
          socket,
          selfId: '',
        });

        this.onMessage(room, socket);
        resolve(); // Resolva apenas APÓS a conexão ser estabelecida
      };

      socket.onerror = (error) => {
        console.error(`Erro ao conectar no WebSocket para a sala ${room}:`, error);
        reject(error);
        this.connections.delete(room);
      };

      socket.onclose = () => {
        console.log(`Conexão WebSocket fechada para a sala ${room}`);
        this.connections.delete(room);
        this.connectionSuccessfulSubject.delete(room); // Limpe também
        this.incomingCallSubject.delete(room);
        this.incomingPeerDisconnectionSubject.delete(room);
        this.incomingOfferSubject.delete(room);
        this.incomingAnswerSubject.delete(room);
        this.incomingCandidateSubject.delete(room);
      };
    });
  }

  onMessage(room: string, socket: WebSocket): void {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.event) {
        case SignalingEventOptions.CONNECTED:
          console.log(data);
          this.emitConnectionSuccessful(room, data.id);
          break;
        case SignalingEventOptions.CALL:
          this.emitIncomingCall(room, data.id);
          break;
        case SignalingEventOptions.DISCONNECT_USER:
          this.emitIncomingDisconnection(room, data.id);
          break;
        case SignalingEventOptions.OFFER:
          this.emitIncomingOffer(room, data.id, data.offer);
          break;
        case SignalingEventOptions.ANSWER:
          this.emitIncomingAnswer(room, data.id, data.answer);
          break;
        case SignalingEventOptions.CANDIDATE:
          this.emitIncomingCandidate(room, data.id, data.candidate);
          break;
        default:
          console.log('Unknown event', data);
      }
    };
  }

  emitConnectionSuccessful(room: string, id: string): void {
    const connection = this.connections.get(room);
    connection &&
      this.connections.set(room, {
        socket: connection.socket,
        selfId: id,
      });

    const subject = this.connectionSuccessfulSubject.get(room);
    subject && subject.next(id);
  }

  emitIncomingDisconnection(room: string, peerId: string): void {
    const subject = this.incomingPeerDisconnectionSubject.get(room);
    subject && subject.next(peerId);
  }

  emitIncomingCall(room: string, peerId: string): void {
    const subject = this.incomingCallSubject.get(room);
    subject && subject.next(peerId);
  }

  emitIncomingOffer(room: string, peerId: string, offer: RTCSessionDescriptionInit): void {
    const subject = this.incomingOfferSubject.get(room);
    subject && subject.next({ peerId, offer });
  }

  emitIncomingAnswer(room: string, peerId: string, answer: RTCSessionDescriptionInit): void {
    const subject = this.incomingAnswerSubject.get(room);
    subject && subject.next({ peerId, answer });
  }

  emitIncomingCandidate(room: string, peerId: string, candidate: RTCIceCandidate): void {
    const subject = this.incomingCandidateSubject.get(room);
    subject && subject.next({ peerId, candidate });
  }

  sendIceCandidate(room: string, peerId: string, candidate: RTCIceCandidate): void {
    this.sendMessage(SignalingEventOptions.CANDIDATE, room, peerId, { candidate });
  }

  sendOffer(room: string, peerId: string, offer: RTCSessionDescriptionInit): void {
    this.sendMessage(SignalingEventOptions.OFFER, room, peerId, { offer });
  }

  sendAnswer(room: string, peerId: string, answer: RTCSessionDescriptionInit): void {
    this.sendMessage(SignalingEventOptions.ANSWER, room, peerId, { answer });
  }

  private sendMessage<T = unknown>(event: string, room: string, peerId: string, data: T): void {
    const connection = this.connections.get(room);

    if (connection?.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(
        JSON.stringify({
          event,
          data: {
            id: peerId,
            ...data,
          },
        })
      );
    } else {
      console.error('Socket not open');
    }
  }

  disconnect(room: string): void {
    const connection = this.connections.get(room);
    connection && connection.socket.close();
  }

  disconnectAll(): void {
    this.connections.forEach((connection) => {
      connection.socket.close();
    });
  }
}
