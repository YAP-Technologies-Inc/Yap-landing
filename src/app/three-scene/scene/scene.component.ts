import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
// Import Three.js with typing workaround
import * as THREE from 'three';
// Explicitly cast THREE as any to bypass TypeScript errors
const THREEjs = THREE as any;

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements OnInit, AfterViewInit {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;
  
  renderer = new THREEjs.WebGLRenderer();
  scene = new THREEjs.Scene();
  camera = new THREEjs.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  cube: any; // Using 'any' type to avoid TypeScript errors

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    
    const geometry = new THREEjs.BoxGeometry();
    const material = new THREEjs.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREEjs.Mesh(geometry, material);
    this.scene.add(this.cube);
    
    this.camera.position.z = 5;
    
    this.animate();
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    
    this.renderer.render(this.scene, this.camera);
  }
}
