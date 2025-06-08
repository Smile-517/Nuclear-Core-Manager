import * as THREE from "three";

import { LEN_ONE_DAY } from "./params.js";

// 객체 내부 변수들
let clock;
export let dayTime;

export function init() {
  clock = new THREE.Clock();
  dayTime = 0; // 단위: 하루
}

export function update() {
  dayTime = clock.getElapsedTime() / LEN_ONE_DAY;
}
