import * as THREE from "three";

import { LEN_ONE_DAY } from "./params.js";

export class States {
  // 객체 내부 변수들
  timeClock;
  dayTime;

  constructor() {
    this.timeClock = new THREE.Clock();
    this.dayTime = 0; // 단위: 하루
  }

  update() {
    this.dayTime = this.timeClock.getElapsedTime() / LEN_ONE_DAY;
  }
}
