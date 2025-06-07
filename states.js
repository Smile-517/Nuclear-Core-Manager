import * as THREE from "three";

import { LEN_ONE_DAY } from "./params.js";

export class States {
  // 객체 내부 변수들
  clock;
  dayTime;

  constructor() {
    this.clock = new THREE.Clock();
    this.dayTime = 0; // 단위: 하루
  }

  update() {
    this.dayTime = this.clock.getElapsedTime() / LEN_ONE_DAY;
  }
}
