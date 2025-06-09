import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import * as gameDisplay from "./gameDisplay.js";
import * as windowHandler from "./windowHandler.js";
import * as cityScene from "./scenes/cityScene.js";
import * as nukeScene from "./scenes/nukeScene.js";
import * as roomScene from "./scenes/roomScene.js";
import * as renderClass from "./renderClass.js";
import * as states from "./states.js";
import * as mouseMove from "./mouseMove.js";
import * as uiClass from "./uiClass.js";

import { LOG_DEBUG } from "./params.js";

let renderer;

// 객체 내부 변수들
let orbitControls;
let isWDown;
let isSDown;

export function init() {
  renderer = renderClass.renderer; // 렌더러는 유일하므로 클래스에서 빼낸다.

  isWDown = false;
  isSDown = false;

  settingOrbitControls(renderer);

  _addStartupListener();
  _addControlRodsListener();
}

export function settingOrbitControls(renderer) {
  renderer = renderer;
  orbitControls = new OrbitControls(nukeScene.camera, renderer.domElement);
  orbitControls.enableDamping = true; // 관성효과, 바로 멈추지 않고 부드럽게 멈춤
  orbitControls.dampingFactor = 0.05; // 감속 정도, 크면 더 빨리 감속, default = 0.05
  orbitControls.enablePan = false; // 팬 기능 비활성화
  orbitControls.target.set(0, 2, 0); // 초기 위치 설정
}

function _addStartupListener() {
  // space키를 누르고 있을 때 isStartingUp이 true을 유지하며, space키를 떼면 false로 설정
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === " ") { // " "가 space를 의미
      nukeScene.setIsStartingUp(true);
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.key.toLowerCase() === " ") {
      nukeScene.setIsStartingUp(false);
    }
  });
}

function _addControlRodsListener() {
  // w키를 누르면 controlRods를 올리고, s키를 누르면 controlRods를 내림
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "w") {
      isWDown = true;
      if (isSDown === false) {
        nukeScene.setControlRodOperation(1);
      } else {
        nukeScene.setControlRodOperation(0); // w와 s가 동시에 눌리면 아무 동작도 하지 않음
      }
    } else if (event.key.toLowerCase() === "s") {
      isSDown = true;
      if (isWDown === false) {
        nukeScene.setControlRodOperation(-1);
      } else {
        nukeScene.setControlRodOperation(0); // w와 s가 동시에 눌리면 아무 동작도 하지 않음
      }
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key.toLowerCase() === "w") {
      isWDown = false;
      if (isSDown === false) {
        nukeScene.setControlRodOperation(0); // w가 떼어지면 controlRods를 멈춤
      } else {
        nukeScene.setControlRodOperation(-1); // s가 눌려있으면 controlRods를 내림
      }
    } else if (event.key.toLowerCase() === "s") {
      isSDown = false;
      if (isWDown === false) {
        nukeScene.setControlRodOperation(0); // s가 떼어지면 controlRods를 멈춤
      } else {
        nukeScene.setControlRodOperation(1); // w가 눌려있으면 controlRods를 올림
      }
    }
  });
}

export function update() {
  orbitControls.update();
}

// 마우스가 nukeDisplay 내부면 orbitControls를 활성화하는 함수
export function setOrbicControls(mouseX, flippedY) {
  if (isInNukeArea(mouseX, flippedY)) {
    orbitControls.enableRotate = true;
    orbitControls.enableZoom = true;
  } else {
    orbitControls.enableRotate = false;
    orbitControls.enableZoom = false;
  }
}

// 이벤트가 발생한 지점이 nukeDisplay 내부인지 검사하는 헬퍼 함수
export function isInNukeArea(mouseX, flippedY) {
  const rect = windowHandler.nukeDisplay;
  return (
    mouseX >= rect.x &&
    mouseX <= rect.x + rect.width &&
    flippedY >= rect.y &&
    flippedY <= rect.y + rect.height
  );
}
