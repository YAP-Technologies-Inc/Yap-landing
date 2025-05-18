import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  faqs = [
    {
      question: 'What is YAP?',
      answer: 'YAP (Yet Another Pronunciation) is an AI-powered language learning platform focused on helping users perfect their pronunciation through real-time feedback and interactive exercises.',
      expanded: false
    },
    {
      question: 'How does the pronunciation feedback work?',
      answer: 'Our advanced AI analyzes your speech in real-time, comparing it to native speaker patterns. It identifies specific areas for improvement and provides targeted exercises to help you sound more natural.',
      expanded: false
    },
    {
      question: 'Which languages are supported?',
      answer: 'During our beta phase, we support English (American & British), Spanish, French, Mandarin Chinese, and Japanese. We plan to expand to 50+ languages by our full launch.',
      expanded: false
    },
    {
      question: 'Is YAP free to use?',
      answer: 'YAP offers both free and premium tiers. The free tier gives you access to basic pronunciation exercises, while the premium subscription unlocks advanced features like detailed analytics, unlimited practice sessions, and specialized accent training.',
      expanded: false
    },
    {
      question: 'Do I need special equipment?',
      answer: 'No special equipment is needed! YAP works with your device\'s built-in microphone. For the best experience, we recommend using headphones with a microphone in a quiet environment.',
      expanded: false
    },
    {
      question: 'When will YAP be available?',
      answer: 'We\'re currently in private beta. Join our waitlist to get early access and be among the first to experience YAP when we launch our public beta in Q3 2023.',
      expanded: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].expanded = !this.faqs[index].expanded;
  }

  constructor() { }

  ngOnInit() {}
}
