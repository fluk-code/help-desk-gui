import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RoomClientService } from '../../../services/websocket/room-client.service';

@Component({
  selector: 'fk-select-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select-room.component.html',
  styleUrl: './select-room.component.scss',
})
export class SelectRoomComponent implements OnInit {
  form!: FormGroup;

  roomList = new Set<string>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly roomServerService: RoomClientService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      room: [null, [Validators.required, Validators.nullValidator]],
    });

    this.loadRooms();
  }

  onSubmit(): void {
    this.router.navigate(['/room', this.form.value.room]);
  }

  createRoom(): void {
    const roomId = this.gerarCodigoSala();
    this.router.navigate(['/room', roomId]);
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

  private loadRooms(): void {
    this.roomServerService.rooms$.subscribe((rooms) => {
      this.roomList.add(rooms.room);
    });

    this.roomServerService.connect();
  }
}
