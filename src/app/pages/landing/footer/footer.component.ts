import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  
  footerLinks = [
    {
      category: 'Product',
      links: [
        { text: 'Features', url: '#features' },
        { text: 'Roadmap', url: '#roadmap' },
        { text: 'FAQ', url: '#faq' },
        { text: 'Pricing', url: '#' }
      ]
    },
    {
      category: 'Company',
      links: [
        { text: 'About', url: '#' },
        { text: 'Blog', url: '#' },
        { text: 'Careers', url: '#' },
        { text: 'Contact', url: '#' }
      ]
    },
    {
      category: 'Resources',
      links: [
        { text: 'Documentation', url: '#' },
        { text: 'Support', url: '#' },
        { text: 'Privacy Policy', url: '#' },
        { text: 'Terms of Service', url: '#' }
      ]
    }
  ];

  socialLinks = [
    { icon: 'logo-twitter', url: 'https://twitter.com' },
    { icon: 'logo-facebook', url: 'https://facebook.com' },
    { icon: 'logo-instagram', url: 'https://instagram.com' },
    { icon: 'logo-linkedin', url: 'https://linkedin.com' }
  ];

  constructor() { }

  ngOnInit() {}
}
