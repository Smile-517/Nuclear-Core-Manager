import * as THREE from "three";

import * as gameDisplay from "./gameDisplay.js";
import * as windowHandler from "./windowHandler.js";
import * as cityScene from "./cityScene.js";
import * as nukeScene from "./nukeScene.js";
import * as roomScene from "./roomScene.js";
import * as renderClass from "./renderClass.js";
import * as controls from "./controls.js";
import * as states from "./states.js";
import * as mouseMove from "./mouseMove.js";

let renderer;

export let uis; // 생성된 UI 요소들을 저장하는 배열
let mouseClicked;
let selectedUi;

export function init() {
  renderer = renderClass.renderer; // 렌더러는 유일하므로 클래스에서 빼낸다.
  uis = [];
  mouseClicked = false;

  renderer.domElement.addEventListener("pointerdown", (event) => {
    mouseClicked = true;
    setSomeUiClicked();
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    mouseClicked = false;
    resetClickedUi();
  });
}

// botLeftX, botLeftY, topRightX, topRightY, texture가 인수로 들어오면 그에 맞는 UI를 생성하는 함수
export function createButton(
  botLeftX,
  botLeftY,
  topRightX,
  topRightY,
  texture0,
  texture1,
  texture2,
  functionName
) {
  const inputs = {
    botLeftX: botLeftX,
    botLeftY: botLeftY,
    topRightX: topRightX,
    topRightY: topRightY,
  };
  const width = topRightX - botLeftX;
  const height = topRightY - botLeftY;

  const geometry = new THREE.PlaneGeometry(width, height);
  const loader = new THREE.TextureLoader();
  const tex0 = loader.load(texture0);
  const tex1 = loader.load(texture1);
  const tex2 = loader.load(texture2);
  const material = new THREE.MeshBasicMaterial({
    map: tex0,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(botLeftX + width / 2, botLeftY + height / 2, 0);

  const ui = {
    inputs: inputs,
    mesh: mesh,
    tex0: tex0,
    tex1: tex1,
    tex2: tex2,
    state: 0, // 0: 기본, 1: 마우스 오버, 2: 클릭
    functionName: functionName,
  };

  uis.push(ui);
}

// 마우스 움직임이 감지되면 ui 위에 있는지 확인하는 함수
export function isMouseOver() {
  // gameDisplay.calcGameCoords 함수를 사용하여 현재 화면 좌표를 1920x1080 기준 좌표로 변환
  const coords = gameDisplay.calcGameCoords(mouseMove.mouseX, mouseMove.mouseY);
  const x = coords.x;
  const y = coords.y;
  for (const ui of uis) {
    // UI의 위치와 크기를 기준으로 마우스가 UI 위에 있는지 확인
    if (
      x >= ui.inputs.botLeftX &&
      x <= ui.inputs.topRightX &&
      y >= ui.inputs.botLeftY &&
      y <= ui.inputs.topRightY
    ) {
      if (!mouseClicked) {
        ui.state = 1;
        ui.mesh.material.map = ui.tex1;
      } else if (selectedUi == ui && mouseClicked) {
        setSomeUiClicked();
      }
    } else {
      ui.state = 0;
      ui.mesh.material.map = ui.tex0;
    }
  }
}

// 마우스 클릭이 감지되면 ui 위에 있는지 확인하고 클릭 상태로 변경하는 함수
export function setSomeUiClicked() {
  const coords = gameDisplay.calcGameCoords(mouseMove.mouseX, mouseMove.mouseY);
  const x = coords.x;
  const y = coords.y;
  for (const ui of uis) {
    // UI의 위치와 크기를 기준으로 마우스가 UI 위에 있는지 확인
    if (
      x >= ui.inputs.botLeftX &&
      x <= ui.inputs.topRightX &&
      y >= ui.inputs.botLeftY &&
      y <= ui.inputs.topRightY
    ) {
      ui.state = 2; // 클릭 상태로 변경
      ui.mesh.material.map = ui.tex2; // 클릭 상태의 텍스처로 변경
      selectedUi = ui; // 클릭된 UI를 저장
    } else {
      // 클릭 상태가 아닌 UI는 기본 상태로 되돌림
      if (ui.state === 2) {
        ui.state = 0;
        ui.mesh.material.map = ui.tex0; // 기본 상태의 텍스처로 변경
      }
    }
  }
}

// 마우스 클릭이 해제되면 클릭 상태를 해제하고 기본 상태로 되돌리는 함수
export function resetClickedUi() {
  for (const ui of uis) {
    if (ui.state === 2) {
      ui.state = 1;
      ui.mesh.material.map = ui.tex1; // 기본 상태의 텍스처로 변경
      // 클릭된 UI의 함수 호출
      ui.functionName();
    }
  }
  selectedUi = null; // 클릭된 UI를 초기화
}
