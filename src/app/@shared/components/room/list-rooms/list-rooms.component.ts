import { Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ActivatedRoomService } from '../../../services/room/activated-room.service';
import {
  RoomClientService,
  RoomEventOptions,
} from '../../../services/websocket/room-client.service';

@Component({
  selector: 'fk-list-rooms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-rooms.component.html',
  styleUrl: './list-rooms.component.scss',
})
export class ListRoomsComponent implements OnInit, OnDestroy {
  rooms = new Set<string>();
  activatedRoom: string | null = null;

  roomFollowed: string[] = [];

  @Output()
  followRoom = new EventEmitter<string>();

  @Output()
  unfollowRoom = new EventEmitter<string>();

  private readonly ngUnsubscribe = new Subject();

  constructor(
    private readonly roomServerService: RoomClientService,
    private readonly activatedRoomService: ActivatedRoomService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  isFollowed(room: string): boolean {
    return this.roomFollowed.includes(room);
  }

  private loadRooms(): void {
    this.roomServerService.rooms$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ event, room }) => {
        event === RoomEventOptions.NEW && this.rooms.add(room);
        event === RoomEventOptions.REMOVE && this.rooms.delete(room);
      });

    this.roomServerService.connect();
  }

  toggleFollowRoom(room: string): void {
    if (this.isFollowed(room)) {
      this.emitUnfollowRoom(room);
    } else {
      this.emitFollowRoom(room);
    }
  }

  private emitFollowRoom(room: string): void {
    this.roomFollowed.push(room);
    this.followRoom.emit(room);
  }

  private emitUnfollowRoom(room: string): void {
    this.roomFollowed = this.roomFollowed.filter((r) => r !== room);
    this.unfollowRoom.emit(room);
  }

  private emitActivateRoom(room: string): void {
    this.activatedRoom = room;
    this.activatedRoomService.changeActivatedRoom(room);
  }

  openRoom(room: string): void {
    this.emitActivateRoom(room);
    !this.isFollowed(room) && this.emitFollowRoom(room);
  }

  createNewRoom(): void {
    const room = this.gerarCodigoSala();
    this.emitActivateRoom(room);
    this.emitFollowRoom(room);
  }

  private gerarCodigoSala(tamanho = 6) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < tamanho; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres.charAt(indiceAleatorio);
    }
    return codigo;
  }

  ngOnDestroy(): void {
    this.roomServerService.disconnect();
  }
}
