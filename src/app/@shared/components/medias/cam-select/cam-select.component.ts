import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MediaDevicesService } from '../../../services/media/media-devices.service';
import { UserMediaStreamService } from '../../../services/media/user-media-stream.service';
import { ActivatedRoomService } from '../../../services/room/activated-room.service';
import { RoomId } from '../../../types/type';
import { DeviceDropdownComponent } from '../device-dropdown/device-dropdown.component';

@Component({
  selector: 'fk-cam-select',
  standalone: true,
  imports: [CommonModule, DeviceDropdownComponent],
  templateUrl: './cam-select.component.html',
  styleUrl: './cam-select.component.scss',
})
export class CamSelectComponent implements OnInit {
  readonly videoDevices = new Map<string, MediaDeviceInfo>();

  activatedRoom!: RoomId;

  private readonly rooms = new Map<
    RoomId,
    {
      isDisabled: boolean;
      deviceIdSelected: string;
    }
  >();

  constructor(
    private readonly mediaDevicesService: MediaDevicesService,
    private readonly userMediaStreamService: UserMediaStreamService,
    private readonly activatedRoomService: ActivatedRoomService
  ) {}

  ngOnInit() {
    this.loadDevices();
    this.onActivatedRoom();
  }

  get isDisabled() {
    const room = this.rooms.get(this.activatedRoom);

    if (!room) {
      return true;
    }

    return room.isDisabled;
  }

  async toggleDisableVideo() {
    const room = this.rooms.get(this.activatedRoom);

    if (!room) {
      return;
    }

    if (!room.isDisabled) {
      room.isDisabled = true;
      await this.userMediaStreamService.disableVideo(this.activatedRoom);
    } else {
      room.isDisabled = false;
      this.getDeviceSelected();
    }
  }

  async selectVideoDevice(deviceId: string) {
    const room = this.rooms.get(this.activatedRoom);

    if (!room) {
      return;
    }

    await this.userMediaStreamService.changeVideoDevice(this.activatedRoom, deviceId);

    room.deviceIdSelected = deviceId;
    room.isDisabled = false;
  }

  private getDeviceSelected() {
    const room = this.rooms.get(this.activatedRoom);

    if (!room) {
      return;
    }

    this.selectVideoDevice(room.deviceIdSelected);
  }

  private loadDevices() {
    this.mediaDevicesService.videoDevices$().subscribe((devices: MediaDeviceInfo[]) => {
      devices.forEach((device) => {
        this.videoDevices.set(device.deviceId, device);
      });

      if (this.videoDevices.size === 0) {
        return;
      }

      this.getDeviceSelected();
    });
  }

  private onActivatedRoom() {
    return this.activatedRoomService.activatedRoom$.subscribe((room: RoomId) => {
      this.activatedRoom = room;
      const roomState = this.rooms.get(room);

      if (!roomState) {
        this.rooms.set(room, {
          isDisabled: true,
          deviceIdSelected: this.videoDevices.keys().next().value ?? '',
        });
      }
    });
  }
}
