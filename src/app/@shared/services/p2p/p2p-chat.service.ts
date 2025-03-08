import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

import { MessagesBehaviorKey, PeerId, RoomId, Timestamp } from '../../types/type';

export type P2PChatMessage = {
  peerId: string;
  message: string;
  timestamp: number;
  isSelf?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class P2PChatService {
  private readonly chatDataChannels = new Map<RoomId, Map<PeerId, RTCDataChannel>>();

  private readonly messageSubject = new Map<RoomId, Subject<P2PChatMessage>>();
  private readonly messagesBehavior = new Map<RoomId, Map<MessagesBehaviorKey, P2PChatMessage>>();

  chatMessages$(room: string): [Observable<P2PChatMessage>, P2PChatMessage[]] {
    const behaviorMessages =
      this.messagesBehavior.get(room) ?? new Map<Timestamp, P2PChatMessage>();

    let messageSubject = this.messageSubject.get(room);

    if (!messageSubject) {
      messageSubject = new Subject<P2PChatMessage>();
      this.messageSubject.set(room, messageSubject);
    }

    return [messageSubject.asObservable(), Array.from(behaviorMessages.values()).flat()];
  }

  createDataChannel(room: string, peerId: string, peerConnection: RTCPeerConnection): void {
    try {
      const dataChannel = peerConnection.createDataChannel('chatChannel');
      this.configureChatDataChannel(room, peerId, dataChannel);
    } catch (error) {
      console.error(`Failed to create data channel for peer ${peerId}:`, error);
    }
  }

  configureChatDataChannel(room: string, peerId: string, dataChannel: RTCDataChannel): void {
    const chatDataChannels = this.chatDataChannels.get(room) || new Map<string, RTCDataChannel>();

    dataChannel.onopen = () => {
      console.log('Data channel is open for peer:', peerId);
      console.log('Estado do canal de dados:', dataChannel.readyState);

      this.sendMessagesBehavior(room, peerId);
    };

    dataChannel.onmessage = (event) => {
      const { message, timestamp } = JSON.parse(event.data);
      let messageSubject = this.messageSubject.get(room);

      const p2pMessage = { peerId, message, timestamp, isSelf: false };
      const mapMessages =
        this.messagesBehavior.get(room) || new Map<MessagesBehaviorKey, P2PChatMessage>();
      mapMessages.set(`${p2pMessage.peerId}-${p2pMessage.timestamp}`, p2pMessage);
      this.messagesBehavior.set(room, mapMessages);

      if (!messageSubject) {
        messageSubject = new Subject<P2PChatMessage>();
        this.messageSubject.set(room, messageSubject);
      }

      messageSubject.next(p2pMessage);
    };

    dataChannel.onclose = () => {
      console.log('Data channel is closed for peer:', peerId);
      this.closeChatDataChannels(room, peerId);
    };

    dataChannel.onerror = (error) => {
      console.error(`Data channel error for peer ${peerId}:`, error);
      this.closeChatDataChannels(room, peerId);
    };

    chatDataChannels.set(peerId, dataChannel);
    this.chatDataChannels.set(room, chatDataChannels);
  }

  sendChatMessage(room: string, selfId: string, message: string): void {
    const channels = this.chatDataChannels.get(room);
    const messageSubject = this.messageSubject.get(room);

    const behaviorMessages =
      this.messagesBehavior.get(room) || new Map<MessagesBehaviorKey, P2PChatMessage>();

    const p2pMessage = { peerId: selfId, message, timestamp: Date.now(), isSelf: true };
    behaviorMessages.set(`${p2pMessage.peerId}-${p2pMessage.timestamp}`, p2pMessage);
    this.messagesBehavior.set(room, behaviorMessages);
    messageSubject?.next(p2pMessage);

    if (!channels) {
      // NENHUM PEER AINDA ESTRA CONECTADO SALVAR NO BEHAVIOR
      return;
    }

    channels.forEach((channel) => {
      if (channel.readyState !== 'open') {
        return;
      }
      channel.send(
        JSON.stringify({
          message,
          timestamp: Date.now(),
        })
      );
    });
  }

  sendMessagesBehavior(room: string, peerId: string): void {
    const messagesBehavior = this.messagesBehavior.get(room);

    if (!messagesBehavior) {
      return;
    }

    const selfMessages = Array.from(messagesBehavior.values()).filter((message) => message.isSelf);

    if (!selfMessages.length) {
      return;
    }

    const channels = this.chatDataChannels.get(room);

    if (!channels) {
      return;
    }

    const channel = channels.get(peerId);
    if (channel?.readyState !== 'open') {
      return;
    }

    selfMessages.forEach(({ message, timestamp }) => {
      channel.send(
        JSON.stringify({
          message,
          timestamp,
        })
      );
    });
  }

  closeChatDataChannels(room: string, peerId: string): void {
    const channels = this.chatDataChannels.get(room);

    if (!channels) {
      console.error('Data channels not found');
      return;
    }

    channels.delete(peerId);
  }
}
