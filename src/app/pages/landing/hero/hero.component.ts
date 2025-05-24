import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

interface Greeting {
  text: string;
  language: string;
  flagUrl: string;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements OnInit {
  // Greetings in different languages with their flags
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
    { text: 'Привет', language: 'Russian', flagUrl: 'assets/flags/ru.svg' },
    { text: 'Saluton', language: 'Esperanto', flagUrl: 'assets/flags/es.svg' },
    { text: 'Salve', language: 'Latin', flagUrl: 'assets/flags/it.svg' },
    { text: 'Γειά σου', language: 'Greek', flagUrl: 'assets/flags/gr.svg' },
    { text: 'سلام', language: 'Persian', flagUrl: 'assets/flags/ir.svg' },
    { text: 'Здравейте', language: 'Bulgarian', flagUrl: 'assets/flags/bg.svg' },
    { text: 'Xin chào', language: 'Vietnamese', flagUrl: 'assets/flags/vn.svg' }
  ];

  constructor() {}

  ngOnInit() {
    // No need to duplicate greetings as we're using two identical containers in the template
  }
}
