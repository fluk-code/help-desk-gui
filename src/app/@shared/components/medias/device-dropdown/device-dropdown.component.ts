import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fk-device-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './device-dropdown.component.html',
  styleUrl: './device-dropdown.component.scss',
})
export class DeviceDropdownComponent {
  @Input({ required: true }) devices = new Map<string, MediaDeviceInfo>();
  @Input({ required: true }) deviceIdSelected!: string;

  @Output() chanceDevice = new EventEmitter<string>();

  isOpen = false;

  onChanceDevice(deviceId: string) {
    this.chanceDevice.emit(deviceId);
  }

  toggleDropdown(isOpen?: boolean) {
    this.isOpen = isOpen ?? !this.isOpen;
  }
}
