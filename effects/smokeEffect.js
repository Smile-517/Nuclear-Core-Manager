import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SmokeEffect {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.options = {
      position: [0, 0, 0],
      scale: 1,
      count: 5,
      speed: 0.5,
      spread: 2,
      lifetime: 5,
      ...options
    };

    this.smokeModels = [];
    this.init();
  }

  async init() {
    const loader = new GLTFLoader();
    
    try {
      // smoke.glb 모델 로드
      const gltf = await loader.loadAsync('./assets/models/smoke.glb');
      const smokeModel = gltf.scene;
      
      // 모델의 모든 메시에 대해 설정
      smokeModel.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = 0.6;
          child.material.depthWrite = false;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // 여러 개의 연기 모델 생성
      for (let i = 0; i < this.options.count; i++) {
        const smoke = smokeModel.clone();
        
        // 랜덤 위치 설정
        const angle = (i / this.options.count) * Math.PI * 2;
        const radius = Math.random() * this.options.spread;
        
        smoke.position.set(
          this.options.position[0] + Math.cos(angle) * radius,
          this.options.position[1],
          this.options.position[2] + Math.sin(angle) * radius
        );
        
        // 랜덤 회전 설정
        smoke.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        
        // 크기 설정
        const scale = this.options.scale * (0.8 + Math.random() * 0.4);
        smoke.scale.set(scale, scale, scale);
        
        this.scene.add(smoke);
        this.smokeModels.push({
          model: smoke,
          velocity: new THREE.Vector3(
            Math.cos(angle) * 0.05,
            Math.random() * this.options.speed,
            Math.sin(angle) * 0.05
          ),
          lifetime: Math.random() * this.options.lifetime,
          age: Math.random() * this.options.lifetime,
          initialPosition: smoke.position.clone()
        });
      }
    } catch (error) {
      console.error('Error loading smoke model:', error);
    }
  }

  update() {
    for (const smoke of this.smokeModels) {
      // 위치 업데이트
      smoke.model.position.x += smoke.velocity.x;
      smoke.model.position.y += smoke.velocity.y;
      smoke.model.position.z += smoke.velocity.z;

      // 수명 업데이트
      smoke.age += 0.016;
      if (smoke.age >= smoke.lifetime) {
        // 연기 재생성
        smoke.model.position.copy(smoke.initialPosition);
        smoke.age = 0;
        
        // 새로운 랜덤 속도 설정
        const angle = Math.random() * Math.PI * 2;
        smoke.velocity.set(
          Math.cos(angle) * 0.05,
          Math.random() * this.options.speed,
          Math.sin(angle) * 0.05
        );
      }

      // 투명도 업데이트
      const alpha = 1 - (smoke.age / smoke.lifetime);
      smoke.model.traverse((child) => {
        if (child.isMesh) {
          child.material.opacity = alpha * 0.6;
        }
      });

      // 회전 업데이트
      smoke.model.rotation.y += 0.01;
    }
  }

  dispose() {
    for (const smoke of this.smokeModels) {
      this.scene.remove(smoke.model);
      smoke.model.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
    }
    this.smokeModels = [];
  }
} 