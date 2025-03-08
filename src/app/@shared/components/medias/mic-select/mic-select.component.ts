import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

import { MediaDevicesService } from '../../../services/media/media-devices.service';
import { UserMediaStreamService } from '../../../services/media/user-media-stream.service';
import { RoomId } from '../../../types/type';
import { DeviceDropdownComponent } from '../device-dropdown/device-dropdown.component';

@Component({
  selector: 'fk-mic-select',
  standalone: true,
  imports: [CommonModule, DeviceDropdownComponent],
  templateUrl: './mic-select.component.html',
  styleUrl: './mic-select.component.scss',
})
export class MicSelectComponent implements OnInit {
  readonly audioDevices = new Map<string, MediaDeviceInfo>();

  @Input({ required: true })
  activatedRoom!: RoomId;

  constructor(
    private readonly mediaDevicesService: MediaDevicesService,
    private readonly userMediaStreamService: UserMediaStreamService
  ) {}

  ngOnInit() {
    this.loadDevices();
  }

  isDisabled() {
    // return !!this.userMediaStreamService.getAudioDeviceRoom(this.activatedRoom);
    return true;
  }

  getDeviceSelected() {
    // const deviceSelected = this.userMediaStreamService.getAudioDeviceRoom(this.activatedRoom);

    // if (typeof deviceSelected === 'boolean') {
    //   return 'default';
    // }

    // return (deviceSelected.deviceId as ConstrainDOMStringParameters).exact as string;

    return 'default';
  }

  async toggleDisableAudio() {
    const isDisabled = this.isDisabled();

    if (!isDisabled) {
      await this.userMediaStreamService.disableAudio(this.activatedRoom);
    } else {
      this.getDeviceSelected();
    }
  }

  async selectAudioDevice(deviceId: string) {
    await this.userMediaStreamService.changeAudioDevice(this.activatedRoom, deviceId);
  }

  private loadDevices() {
    this.mediaDevicesService.audioInputDevices$().subscribe((devices: MediaDeviceInfo[]) => {
      devices.forEach((device) => {
        this.audioDevices.set(device.deviceId, device);
      });
      if (this.audioDevices.size === 0) {
        return;
      }
      // const selectedDevice = this.userMediaStreamService.getAudioDeviceRoom(this.activatedRoom);

      // if (!selectedDevice) {
      //   this.selectAudioDevice(devices[0].deviceId);
      // }
    });
  }
}
