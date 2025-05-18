import { ChangeDetectionStrategy, Component, NgZone, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

// Import Three.js
import * as THREE from 'three';

// Using any for Three.js to avoid TypeScript errors
const THREEjs = THREE as any;

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
export class HeroComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private geometry!: THREE.PlaneGeometry;
  private material!: THREE.ShaderMaterial;
  private mesh!: THREE.Mesh;

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
    { text: 'Привет', language: 'Russian', flagUrl: 'assets/flags/ru.svg' }
  ];

  constructor(private zone: NgZone) {}

  ngOnInit() {
    // Double the greetings array to create a continuous effect
    this.greetings = [...this.greetings, ...this.greetings];
  }

  ngAfterViewInit() {
    // Run animation outside Angular to keep Change Detection cheap
    this.zone.runOutsideAngular(() => {
      this.setupThreeJS();
      this.animate();
    });
  }

  private setupThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    
    // Create scene
    this.scene = new THREEjs.Scene();
    
    // Create camera
    this.camera = new THREEjs.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 4;
    
    // Create renderer
    this.renderer = new THREEjs.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create geometry
    this.geometry = new THREEjs.PlaneGeometry(8, 8, 256, 256);
    
    // Create shader material
    this.material = new THREEjs.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREEjs.Color(0.98, 0.93, 0.85).toArray() },
        uColorB: { value: new THREEjs.Color(0.25, 0.26, 0.3).toArray() }
      },
      vertexShader: `
        varying vec2 vUv; 
        uniform float uTime;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.z += sin(pos.x*2.0 + uTime)*0.1;
          gl_Position = projectionMatrix*modelViewMatrix*vec4(pos,1.);
        }
      `,
      fragmentShader: `
        varying vec2 vUv; 
        uniform vec3 uColorA; 
        uniform vec3 uColorB;
        
        void main() {
          vec3 c = mix(uColorA, uColorB, vUv.y);
          gl_FragColor = vec4(c, 0.55);
        }
      `,
      transparent: true
    });
    
    // Create mesh
    this.mesh = new THREEjs.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      // Update camera
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      
      // Update renderer
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  private animate() {
    const loop = () => {
      // Update uniforms
      const time = performance.now() / 1000;
      this.material.uniforms.uTime.value = time;
      
      // Render
      this.renderer.render(this.scene, this.camera);
      
      // Request next frame
      requestAnimationFrame(loop);
    };
    
    loop();
  }
}
