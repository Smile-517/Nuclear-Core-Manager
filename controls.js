import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { LOG_DEBUG } from "./params.js";

export class Controls {
  // 객체 내부 변수들
  renderer;
  windowClass;

  orbitControls;

  constructor(camera, renderer, windowClass) {
    this.renderer = renderer;
    this.windowClass = windowClass;

    this.orbitControls = new OrbitControls(camera, renderer.domElement);
    this.orbitControls.enableDamping = true; // 관성효과, 바로 멈추지 않고 부드럽게 멈춤
    this.orbitControls.dampingFactor = 0.05; // 감속 정도, 크면 더 빨리 감속, default = 0.05
    this.orbitControls.enablePan = false; // 팬 기능 비활성화
    this.orbitControls.target.set(0, 1, 0); // 초기 위치 설정
  }

  update() {
    this.orbitControls.update();
  }

  // 마우스가 nukeDisplay 내부면 orbitControls를 활성화하는 함수
  setOrbicControls(mouseX, flippedY) {
    if (this.isInNukeArea(mouseX, flippedY)) {
      this.orbitControls.enableRotate = true;
      this.orbitControls.enableZoom = true;
      if (LOG_DEBUG >= 4) {
        console.log("OrbitControls enabled in nuke area");
      }
    } else {
      this.orbitControls.enableRotate = false;
      this.orbitControls.enableZoom = false;
      if (LOG_DEBUG >= 4) {
        console.log("OrbitControls disabled outside nuke area");
      }
    }
  }

  // 이벤트가 발생한 지점이 nukeDisplay 내부인지 검사하는 헬퍼 함수
  isInNukeArea(mouseX, flippedY) {
    const rect = this.windowClass.nukeDisplay;
    return (
      mouseX >= rect.x &&
      mouseX <= rect.x + rect.width &&
      flippedY >= rect.y &&
      flippedY <= rect.y + rect.height
    );
  }
}
