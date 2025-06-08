import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { LOG_DEBUG } from "./params.js";

export class Controls {
  // 객체 내부 변수들
  renderer;
  windowClass;
  nukeScene;

  orbitControls;
  isWDown;
  isSDown;

  constructor(nukeScene, renderer, windowClass) {
    this.renderer = renderer;
    this.windowClass = windowClass;
    this.nukeScene = nukeScene;
    this.isWDown = false;
    this.isSDown = false;

    this.settingOrbitControls(renderer);

    this._addStartupListener();
    this._addControlRodsListener();

    this.nukeScene.setControls(this);
  }

  settingOrbitControls(renderer) {
    this.renderer = renderer;
    this.orbitControls = new OrbitControls(
      this.nukeScene.camera,
      this.renderer.domElement
    );
    this.orbitControls.enableDamping = true; // 관성효과, 바로 멈추지 않고 부드럽게 멈춤
    this.orbitControls.dampingFactor = 0.05; // 감속 정도, 크면 더 빨리 감속, default = 0.05
    this.orbitControls.enablePan = false; // 팬 기능 비활성화
    this.orbitControls.target.set(0, 2, 0); // 초기 위치 설정
  }

  _addStartupListener() {
    // i키를 누르고 있을 때 isStartingUp이 true을 유지하며, i키를 떼면 false로 설정
    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "i") {
        this.nukeScene.isStartingUp = true;
      }
    });
    window.addEventListener("keyup", (event) => {
      if (event.key.toLowerCase() === "i") {
        this.nukeScene.isStartingUp = false;
      }
    });
  }

  _addControlRodsListener() {
    // w키를 누르면 controlRods를 올리고, s키를 누르면 controlRods를 내림
    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "w") {
        this.isWDown = true;
        if (this.isSDown === false) {
          this.nukeScene.controlRodOperation = 1;
        } else {
          this.nukeScene.controlRodOperation = 0; // w와 s가 동시에 눌리면 아무 동작도 하지 않음
        }
      } else if (event.key.toLowerCase() === "s") {
        this.isSDown = true;
        if (this.isWDown === false) {
          this.nukeScene.controlRodOperation = -1;
        } else {
          this.nukeScene.controlRodOperation = 0; // w와 s가 동시에 눌리면 아무 동작도 하지 않음
        }
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key.toLowerCase() === "w") {
        this.isWDown = false;
        if (this.isSDown === false) {
          this.nukeScene.controlRodOperation = 0; // w가 떼어지면 controlRods를 멈춤
        } else {
          this.nukeScene.controlRodOperation = -1; // s가 눌려있으면 controlRods를 내림
        }
      } else if (event.key.toLowerCase() === "s") {
        this.isSDown = false;
        if (this.isWDown === false) {
          this.nukeScene.controlRodOperation = 0; // s가 떼어지면 controlRods를 멈춤
        } else {
          this.nukeScene.controlRodOperation = 1; // w가 눌려있으면 controlRods를 올림
        }
      }
    });
  }

  update() {
    this.orbitControls.update();
  }

  // 마우스가 nukeDisplay 내부면 orbitControls를 활성화하는 함수
  setOrbicControls(mouseX, flippedY) {
    if (this.isInNukeArea(mouseX, flippedY)) {
      this.orbitControls.enableRotate = true;
      this.orbitControls.enableZoom = true;
    } else {
      this.orbitControls.enableRotate = false;
      this.orbitControls.enableZoom = false;
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
