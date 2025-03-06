import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MediaDevicesService } from '../../../services/media/media-devices.service';
import { UserMediaStreamService } from '../../../services/media/user-media-stream.service';
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

  isDisabled = false;
  deviceIdSelected!: string;

  constructor(
    private readonly mediaDevicesService: MediaDevicesService,
    private readonly userMediaStreamService: UserMediaStreamService
  ) {}

  ngOnInit() {
    this.loadDevices();
  }

  loadDevices() {
    this.mediaDevicesService.audioInputDevices$().subscribe((devices: MediaDeviceInfo[]) => {
      devices.forEach((device) => {
        this.audioDevices.set(device.deviceId, device);
      });
      if (this.audioDevices.size === 0) {
        return;
      }
      const selectedDevice = this.getDeviceSelected();
      if (!selectedDevice) {
        this.selectAudioDevice(devices[0].deviceId);
      }
    });
  }

  async toggleDisableAudio() {
    if (!this.isDisabled) {
      await this.userMediaStreamService.disableAudio();
    } else {
      this.getDeviceSelected();
    }

    this.isDisabled = !this.isDisabled;
  }

  async selectAudioDevice(deviceId: string) {
    await this.userMediaStreamService.changeVideoDevice(deviceId);
    this.deviceIdSelected = deviceId;
    this.isDisabled = false;
  }

  private getDeviceSelected() {
    return this.audioDevices.get(this.deviceIdSelected) ?? null;
  }
}
