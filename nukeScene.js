import * as THREE from "three";

import { RENDER_DEBUG } from "./params.js";

export class NukeScene {
  // 객체 내부 변수들
  scene;
  camera;
  renderer;
  spotLight;
  reactor;
  axesHelper;
  spotLightHelper;

  constructor() {
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // 배경색을 검은색으로 설정

    // camera
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(2, 3, -5); // 초기 위치 설정
    this.camera.lookAt(new THREE.Vector3(0, 1, 0));
    this.camera.updateProjectionMatrix();
    this.scene.add(this.camera);

    // ambient light (전체 조명)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.025); // 약한 전체 조명
    this.scene.add(ambientLight);

    // spotlight (원자로를 비추는 조명)
    this.spotLight = new THREE.SpotLight(0xffffff, 1.0);
    this.spotLight.position.set(0, 10, 0); // 원자로 위에서 비추도록 설정
    this.spotLight.castShadow = true;
    this.spotLight.angle = Math.PI / 4; // 조명의 각도 설정
    this.spotLight.penumbra = 0.4; // 페넘브라 설정 (부드러운 그림자)
    this.spotLight.intensity = 200; // 조명 강도 설정
    this.scene.add(this.spotLight);

    // 바닥
    const floorGeometry = new THREE.PlaneGeometry(128, 128);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // 바닥을 수평으로 회전
    floor.receiveShadow = true; // 그림자 받기
    this.scene.add(floor);

    // 원자로 모델 (샘플로 간단한 실린더 사용)
    const reactorGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    const reactorMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    this.reactor = new THREE.Mesh(reactorGeometry, reactorMaterial);
    this.reactor.castShadow = true;
    this.reactor.position.set(0, 1.001, 0); // 원자로 위치 설정
    this.scene.add(this.reactor);

    // 디버그 모드일 때만 헬퍼 추가
    if (RENDER_DEBUG) {
      // 축 헬퍼 (월드 기준 XYZ 축 표시)
      this.axesHelper = new THREE.AxesHelper(5);
      this.scene.add(this.axesHelper);

      // spotlight 헬퍼 (조명 방향 시각화)
      this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
      this.scene.add(this.spotLightHelper);
    }
  }
}
