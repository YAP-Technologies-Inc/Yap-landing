import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  timelineEvents = [
    {
      date: 'Q2 2023',
      title: 'Private Beta',
      description: 'Limited access to our core pronunciation features with real-time feedback.'
    },
    {
      date: 'Q3 2023',
      title: 'Public Beta Launch',
      description: 'Open access to all features with initial language support for English, Spanish, and Mandarin.'
    },
    {
      date: 'Q4 2023',
      title: 'Mobile App Release',
      description: 'Native iOS and Android apps with offline pronunciation exercises.'
    },
    {
      date: 'Q1 2024',
      title: 'Full Launch',
      description: 'Complete platform with 20+ languages, advanced analytics, and community features.'
    },
    {
      date: 'Q2 2024',
      title: 'Enterprise Solutions',
      description: 'Dedicated plans for organizations, schools, and businesses.'
    }
  ];

  constructor() { }

  ngOnInit() {}
}
