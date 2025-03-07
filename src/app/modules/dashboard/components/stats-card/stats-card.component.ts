  import { Component, Input } from '@angular/core';

interface StatsCard {
  title: string;
  value: string;
  icon: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html'
})
export class StatsCardComponent {
  @Input() card!: StatsCard;
}
