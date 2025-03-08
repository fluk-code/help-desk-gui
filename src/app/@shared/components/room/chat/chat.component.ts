import { interval, Subject, Subscription, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { timeAgo } from '../../../pipes/functions/time-ago';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { P2PChatMessage, P2PChatService } from '../../../services/p2p/p2p-chat.service';
import { SelfIdService } from '../../../services/p2p/self-id.service';
import { ActivatedRoomService } from '../../../services/room/activated-room.service';
import { RoomId } from '../../../types/type';

type ChatMessage = P2PChatMessage & {
  timeAgo: string;
};

@Component({
  selector: 'fk-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TimeAgoPipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit {
  activatedRoom!: RoomId;

  messages: ChatMessage[] = [];

  form!: FormGroup;

  private chatSub = new Subscription();

  private ngUnsubscribe = new Subject();

  constructor(
    private readonly cdRef: ChangeDetectorRef,
    private readonly formBuilder: FormBuilder,
    private readonly p2pChatService: P2PChatService,
    private readonly activatedRoomService: ActivatedRoomService,
    private readonly selfIdService: SelfIdService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      message: [null, [Validators.required]],
    });

    this.onActivatedRoom();
    this.updateChangeDetectionInterval();
  }

  sendMessage(): void {
    const message = this.form.get('message');

    if (message) {
      const selfId = this.selfIdService.getSelfId(this.activatedRoom) as string;
      this.p2pChatService.sendChatMessage(this.activatedRoom, selfId, message.value);
      message.reset();
    }
  }

  private onRoomMessages(): void {
    this.chatSub.unsubscribe();
    this.chatSub = new Subscription();

    const [chatMessages$, messages] = this.p2pChatService.chatMessages$(this.activatedRoom);
    this.messages = messages.map((message) => ({
      ...message,
      timeAgo: timeAgo(message.timestamp),
    }));

    this.chatSub.add(
      chatMessages$.subscribe((message) => {
        this.messages.push({
          ...message,
          timeAgo: timeAgo(message.timestamp),
        });

        this.messages = [...this.messages].sort((a, b) => a.timestamp - b.timestamp);

        this.cdRef.detectChanges();
      })
    );
  }

  private onActivatedRoom(): void {
    this.activatedRoomService.activatedRoom$.subscribe((room) => {
      this.activatedRoom = room;

      this.onRoomMessages();
    });
  }

  private updateChangeDetectionInterval(): void {
    const inOneMinute = 60 * 1000;

    interval(inOneMinute)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.messages = this.messages.map((message) => ({
          ...message,
          timeAgo: timeAgo(message.timestamp),
        }));

        this.cdRef.detectChanges();
      });
  }
}
