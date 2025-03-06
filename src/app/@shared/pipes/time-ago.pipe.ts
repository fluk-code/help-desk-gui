import { Pipe, PipeTransform } from '@angular/core';

import { timeAgo } from './functions/time-ago';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(timestamp: number | Date | string): string {
    return timeAgo(timestamp);
  }
}
