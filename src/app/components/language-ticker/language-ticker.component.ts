import { Component, OnInit } from '@angular/core';

interface Greeting {
  text: string;
  language: string;
  flagUrl: string;
}

@Component({
  selector: 'app-language-ticker',
  templateUrl: './language-ticker.component.html',
  styleUrls: ['./language-ticker.component.scss']
})
export class LanguageTickerComponent implements OnInit {
  greetings: Greeting[] = [
    { text: 'Hello', language: 'English', flagUrl: 'assets/flags/gb.svg' },
    { text: 'Hola', language: 'Spanish', flagUrl: 'assets/flags/es.svg' },
    { text: 'Bonjour', language: 'French', flagUrl: 'assets/flags/fr.svg' },
    { text: 'Ciao', language: 'Italian', flagUrl: 'assets/flags/it.svg' },
    { text: 'Hallo', language: 'German', flagUrl: 'assets/flags/de.svg' },
    { text: '你好', language: 'Chinese', flagUrl: 'assets/flags/cn.svg' },
    { text: 'こんにちは', language: 'Japanese', flagUrl: 'assets/flags/jp.svg' },
    { text: '안녕하세요', language: 'Korean', flagUrl: 'assets/flags/kr.svg' },
    { text: 'Olá', language: 'Portuguese', flagUrl: 'assets/flags/pt.svg' },
    { text: 'Привет', language: 'Russian', flagUrl: 'assets/flags/ru.svg' }
  ];

  constructor() {}

  ngOnInit() {
    // Double the greetings array to create a seamless loop
    this.greetings = [...this.greetings, ...this.greetings];
  }
}
