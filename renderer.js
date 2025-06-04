import * as THREE from "three";

export class Renderer {
  // 객체 내부 변수들
  renderer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setScissorTest(true);
    document.body.appendChild(this.renderer.domElement);
  }

  getRenderer() {
    return this.renderer;
  }
}
