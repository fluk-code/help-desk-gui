import { Component, OnInit } from '@angular/core';

import { MediaDevicesService } from '../../../services/media/media-devices.service';
import { DeviceDropdownComponent } from '../device-dropdown/device-dropdown.component';

@Component({
  selector: 'fk-sound-select',
  standalone: true,
  imports: [DeviceDropdownComponent],
  templateUrl: './sound-select.component.html',
  styleUrl: './sound-select.component.scss',
})
export class SoundSelectComponent implements OnInit {
  readonly soundDevices = new Map<string, MediaDeviceInfo>();
  deviceIdSelected!: string;

  constructor(private readonly mediaDevicesService: MediaDevicesService) {}

  ngOnInit() {
    this.loadDevices();
  }

  loadDevices() {
    this.mediaDevicesService.audioOutputDevices$().subscribe((devices: MediaDeviceInfo[]) => {
      devices.forEach((device) => {
        this.soundDevices.set(device.deviceId, device);
      });
      if (this.soundDevices.size === 0) {
        return;
      }
      const selectedDevice = this.getDeviceSelected();
      if (!selectedDevice) {
        this.selectDevice(devices[0].deviceId);
      }
    });
  }

  selectSoundDevice(deviceId: string) {
    this.selectDevice(deviceId);
  }

  private getDeviceSelected() {
    return this.soundDevices.get(this.deviceIdSelected) ?? null;
  }

  private selectDevice(deviceId: string) {
    this.deviceIdSelected = deviceId;
  }
}
