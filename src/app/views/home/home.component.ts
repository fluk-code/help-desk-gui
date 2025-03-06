import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MediaStreamPlayerComponent } from '../../@shared/components/players/media-stream-player/media-stream-player.component';
import { SelectRoomComponent } from '../../@shared/components/room/select-room/select-room.component';

@Component({
  selector: 'fk-home',
  standalone: true,
  imports: [RouterModule, MediaStreamPlayerComponent, SelectRoomComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
