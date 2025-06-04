import * as THREE from "three";

import { RENDER_DEBUG, LATITUDE } from "./params.js";

export class CityScene {
  // 객체 내부 변수들
  scene;
  camera;
  dirLight;
  cube;
  axesHelper;
  dirLightHelper;

  constructor() {
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd0e0f0);

    // camera
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(2, 3, -4);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.updateProjectionMatrix();
    this.scene.add(this.camera);

    // directional light (태양 광원 역할)
    // 동쪽: +X, 서쪽: -X, 남쪽: +Z, 북쪽: -Z
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    // 초기에는 동쪽에서 빛이 오도록 설정
    this.dirLight.position.set(1, 0, 0);
    this.dirLight.castShadow = true;
    this.scene.add(this.dirLight);

    // 큐브 (샘플 오브젝트)
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xffeedd });
    this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    // 디버그 모드일 때만 헬퍼 추가
    if (RENDER_DEBUG) {
      // 축 헬퍼 (월드 기준 XYZ 축 표시)
      this.axesHelper = new THREE.AxesHelper(5);
      this.scene.add(this.axesHelper);

      // directional light 헬퍼 (광원 방향 시각화)
      this.dirLightHelper = new THREE.DirectionalLightHelper(this.dirLight, 1);
      this.scene.add(this.dirLightHelper);
    }
  }

  update(states) {
    // 최대 고도(고도각) 계산 (Latitude 기반)
    const maxElevationRad = (90 - LATITUDE) * (Math.PI / 180);

    // states.dayTime ∈ [0, 1]로 가정 → 0~1을 일일 사이클(2π)로 매핑
    const theta = states.dayTime * 2 * Math.PI;
    // 사인 값에 따라 고도각을 조절
    const phi = Math.sin(states.dayTime * 2 * Math.PI) * maxElevationRad;

    // 구 좌표계로 변환하여 x, y, z 얻기
    const x = Math.cos(phi) * Math.cos(theta);
    const y = Math.sin(phi);
    const z = Math.cos(phi) * Math.sin(theta);

    // directional light 위치 갱신
    this.dirLight.position.set(x, y, z);

    // 디버그 모드면 헬퍼도 함께 갱신
    if (RENDER_DEBUG && this.dirLightHelper) {
      this.dirLightHelper.update();
    }
  }
}
