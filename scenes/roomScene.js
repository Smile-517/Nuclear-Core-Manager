import * as THREE from "three";

import { RENDER_DEBUG } from "../params.js";

// 객체 내부 변수들
export let scene;
export let camera;
export let pointLight;
let floor;
let axesHelper;
let pointLightHelper;

export function init() {
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd0e0f0);

  // camera
  camera = new THREE.PerspectiveCamera();
  camera.position.set(2, 3, -6);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.updateProjectionMatrix();
  scene.add(camera);

  // ambient light (기본 조명)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25); // 약한 기본 조명
  scene.add(ambientLight);

  // point light (방 안의 조명)
  pointLight = new THREE.PointLight(0xffffff, 100.0);
  pointLight.position.set(0, 5, 0); // 방 안의 조명 위치 설정
  pointLight.castShadow = true; // 그림자 생성
  scene.add(pointLight);

  // 방 바닥
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xff8c00 });
  floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // 바닥을 수평으로 회전
  floor.receiveShadow = true; // 바닥이 그림자를 받도록 설정
  scene.add(floor);

  // 디버그 모드일 때만 헬퍼 추가
  if (RENDER_DEBUG) {
    // 축 헬퍼 (월드 기준 XYZ 축 표시)
    axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // point light 헬퍼 (조명 위치 시각화)
    pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(pointLightHelper);
  }
}
