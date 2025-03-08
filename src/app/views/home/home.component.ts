import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UserMediaStreamPlayerComponent } from '../../@shared/components/players/user-media-stream-player/user-media-stream-player.component';
import { SelectRoomComponent } from '../../@shared/components/room/select-room/select-room.component';

@Component({
  selector: 'fk-home',
  standalone: true,
  imports: [RouterModule, UserMediaStreamPlayerComponent, SelectRoomComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
