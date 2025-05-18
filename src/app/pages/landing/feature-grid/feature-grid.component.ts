import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feature-grid',
  templateUrl: './feature-grid.component.html',
  styleUrls: ['./feature-grid.component.scss'],
})
export class FeatureGridComponent implements OnInit {
  features = [
    {
      icon: 'mic-outline',
      title: 'Real-time Feedback',
      description: 'Get instant pronunciation feedback powered by advanced AI technology.'
    },
    {
      icon: 'game-controller-outline',
      title: 'Gamified Learning',
      description: 'Earn rewards and track your progress through interactive challenges.'
    },
    {
      icon: 'analytics-outline',
      title: 'Detailed Analytics',
      description: 'View your improvement over time with comprehensive reports.'
    },
    {
      icon: 'people-outline',
      title: 'Community Learning',
      description: 'Connect with other learners and practice in a supportive environment.'
    },
    {
      icon: 'globe-outline',
      title: '50+ Languages',
      description: 'Learn pronunciation for over 50 languages and hundreds of dialects.'
    },
    {
      icon: 'layers-outline',
      title: 'Customized Learning',
      description: 'Personalized learning paths based on your skill level and goals.'
    }
  ];

  constructor() { }

  ngOnInit() {}
}
