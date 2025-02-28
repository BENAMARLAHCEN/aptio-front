  import { Component, Input } from '@angular/core';

interface StatsCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html'
})
export class StatsCardComponent {
  @Input() card!: StatsCard;

  getChangeIconClass(): string {
    return this.card.changeType === 'increase'
      ? 'text-status-success'
      : this.card.changeType === 'decrease'
        ? 'text-status-error'
        : 'text-neutral';
  }

  getChangeIcon(): string {
    return this.card.changeType === 'increase'
      ? 'arrow_upward'
      : this.card.changeType === 'decrease'
        ? 'arrow_downward'
        : 'remove';
  }
}
