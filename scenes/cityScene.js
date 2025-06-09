import * as THREE from "three";

import * as states from "../states.js";

import { RENDER_DEBUG, LATITUDE } from "../params.js";

// 객체 내부 변수들
export let scene;
export let camera;
let dirLight;
let cube;
let axesHelper;
let dirLightHelper;

export function init() {
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd0e0f0);

  // camera
  camera = new THREE.PerspectiveCamera();
  camera.position.set(2, 3, -4);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.updateProjectionMatrix();
  scene.add(camera);

  // directional light (태양 광원 역할)
  // 동쪽: +X, 서쪽: -X, 남쪽: +Z, 북쪽: -Z
  dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  // 초기에는 동쪽에서 빛이 오도록 설정
  dirLight.position.set(1, 0, 0);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // 큐브 (샘플 오브젝트)
  const cubeGeometry = new THREE.BoxGeometry();
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xffeedd });
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  scene.add(cube);

  // 디버그 모드일 때만 헬퍼 추가
  if (RENDER_DEBUG) {
    // 축 헬퍼 (월드 기준 XYZ 축 표시)
    axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // directional light 헬퍼 (광원 방향 시각화)
    dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1);
    scene.add(dirLightHelper);
  }
}

export function update() {
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
  dirLight.position.set(x, y, z);

  // 디버그 모드면 헬퍼도 함께 갱신
  if (RENDER_DEBUG && dirLightHelper) {
    dirLightHelper.update();
  }
}
