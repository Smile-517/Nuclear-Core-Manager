import * as THREE from "three";

import { RENDER_DEBUG } from "./params.js";

export class RoomScene {
  // 객체 내부 변수들
  scene;
  camera;
  pointLight;
  floor;
  axesHelper;
  pointLightHelper;

  constructor() {
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd0e0f0);

    // camera
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(2, 3, -6);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.updateProjectionMatrix();
    this.scene.add(this.camera);

    // point light (방 안의 조명)
    this.pointLight = new THREE.PointLight(0xffffff, 100.0);
    this.pointLight.position.set(0, 5, 0); // 방 안의 조명 위치 설정
    this.pointLight.castShadow = true; // 그림자 생성
    this.scene.add(this.pointLight);

    // 방 바닥
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xff8c00 });
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2; // 바닥을 수평으로 회전
    this.floor.receiveShadow = true; // 바닥이 그림자를 받도록 설정
    this.scene.add(this.floor);

    // 디버그 모드일 때만 헬퍼 추가
    if (RENDER_DEBUG) {
      // 축 헬퍼 (월드 기준 XYZ 축 표시)
      this.axesHelper = new THREE.AxesHelper(5);
      this.scene.add(this.axesHelper);

      // point light 헬퍼 (조명 위치 시각화)
      this.pointLightHelper = new THREE.PointLightHelper(this.pointLight, 1);
      this.scene.add(this.pointLightHelper);
    }
  }
}
