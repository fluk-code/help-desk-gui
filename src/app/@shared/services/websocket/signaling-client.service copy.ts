import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { RoomId } from '../../types/type';
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

@Injectable({
  providedIn: 'root',
})
export class SignalingClientService {
  private readonly wsUrl = `${SIGNALING_SERVER_URL}/webrtc`;

  private readonly connections = new Map<
    RoomId,
    {
      socket: WebSocket;
      id?: string;
    }
  >();

  private readonly connectionSuccessfulSubject = new Subject<{
    id: string;
    room: string;
  }>();

  private readonly incomingCallSubject = new Subject<{
    peerId: string;
    room: string;
  }>();

  private readonly peerDisconnectedSubject = new Subject<{
    peerId: string;
    room: string;
  }>();

  private readonly incomingOfferSubject = new Subject<{
    peerId: string;
    room: string;
    offer: RTCSessionDescriptionInit;
  }>();

  private readonly incomingAnswerSubject = new Subject<{
    peerId: string;
    room: string;
    answer: RTCSessionDescriptionInit;
  }>();

  private readonly incomingCandidateSubject = new Subject<{
    peerId: string;
    room: string;
    candidate: RTCIceCandidate;
  }>();

  get connectionSuccessful$(): Observable<{
    id: string;
    room: string;
  }> {
    return this.connectionSuccessfulSubject.asObservable();
  }

  get incomingCall$(): Observable<{
    peerId: string;
    room: string;
  }> {
    return this.incomingCallSubject.asObservable();
  }

  get peerDisconnected$(): Observable<{
    peerId: string;
    room: string;
  }> {
    return this.peerDisconnectedSubject.asObservable();
  }

  get incomingOffer$(): Observable<{
    peerId: string;
    room: string;
    offer: RTCSessionDescriptionInit;
  }> {
    return this.incomingOfferSubject.asObservable();
  }

  get incomingAnswer$(): Observable<{
    peerId: string;
    room: string;
    answer: RTCSessionDescriptionInit;
  }> {
    return this.incomingAnswerSubject.asObservable();
  }

  get incomingCandidate$(): Observable<{
    peerId: string;
    room: string;
    candidate: RTCIceCandidate;
  }> {
    return this.incomingCandidateSubject.asObservable();
  }

  connect(room: string): void {
    const connection = this.connections.get(room);

    if (connection) {
      // Already connected
      return;
    }

    const socket = new WebSocket(`${this.wsUrl}?room=${room}`);
    this.connections.set(room, {
      socket,
    });
    this.onMessage(room, socket);
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
          this.incomingCallSubject.next({
            peerId: data.id,
            room: room,
          });
          break;
        case SignalingEventOptions.DISCONNECT_USER:
          this.peerDisconnectedSubject.next({
            peerId: data.id,
            room: room,
          });
          break;
        case SignalingEventOptions.OFFER:
          this.incomingOfferSubject.next({
            peerId: data.id,
            room: room,
            offer: data.offer,
          });
          break;
        case SignalingEventOptions.ANSWER:
          this.incomingAnswerSubject.next({
            peerId: data.id,
            room: room,
            answer: data.answer,
          });
          break;
        case SignalingEventOptions.CANDIDATE:
          this.incomingCandidateSubject.next({
            peerId: data.id,
            room: room,
            candidate: data.candidate,
          });
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
        id,
      });

    this.connectionSuccessfulSubject.next({
      id,
      room,
    });
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
