import * as THREE from "three";

import * as uiClass from "./uiClass.js";

import {
  LEN_ONE_DAY,
  LOG_DEBUG,
  COOLING_RATE,
  TICKS_PER_SECOND,
} from "./params.js";

// 객체 내부 변수들
let clock;
export let dayTime;
export let coreTemp;

export function init() {
  clock = new THREE.Clock();
  dayTime = 0; // 단위: 하루
  coreTemp = 25; // 단위: 섭씨

  initUi();
}

export function update() {
  dayTime = clock.getElapsedTime() / LEN_ONE_DAY;

  if (coreTemp > 25) {
    const diff = coreTemp - 25;
    coreTemp -= (diff * COOLING_RATE * 200) / TICKS_PER_SECOND; // 온도가 25도 이상일 때 서서히 감소
  }
}

export function incrCoreTemp(value = 1) {
  coreTemp += value;
}

function initUi() {
  // 바 틀(회색)
  uiClass.createBar(985, 50, 1035, 515, "states.coreTemp", 0, 2000, "up", 8);

  // 바 내부(색이 변하는 부분)
  const fillGeo = new THREE.PlaneGeometry(200, 20);
  const fillMat = new THREE.MeshBasicMaterial({ color: 0x4caf50 });
  const fillMesh = new THREE.Mesh(fillGeo, fillMat);
  // 원점 기준 왼쪽 정렬을 위해 anchor를 왼쪽 끝으로 옮김
  fillMesh.position.set(10, 40, 0);
  fillMesh.scale.x = 0; // 초기 0%
  uiClass.scene.add(fillMesh);
}
