import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MediaDevicesService } from '../../../services/media/media-devices.service';
import { UserMediaStreamService } from '../../../services/media/user-media-stream.service';
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

  isDisabled = false;
  deviceIdSelected!: string;

  constructor(
    private readonly mediaDevicesService: MediaDevicesService,
    private readonly userMediaStreamService: UserMediaStreamService
  ) {}

  ngOnInit() {
    this.loadDevices();
  }

  async toggleDisableVideo() {
    if (!this.isDisabled) {
      await this.userMediaStreamService.disableVideo();
    } else {
      this.getDeviceSelected();
    }

    this.isDisabled = !this.isDisabled;
  }

  async selectVideoDevice(deviceId: string) {
    await this.userMediaStreamService.changeVideoDevice(deviceId);
    this.deviceIdSelected = deviceId;
    this.isDisabled = false;
  }

  private getDeviceSelected() {
    this.selectVideoDevice(this.deviceIdSelected);
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
}
