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

let buttons; // UI 중 버튼들을 저장하는 배열
let bars; // UI 중 바들을 저장하는 배열
let mouseClicked;
let selectedUi;
let defaultColor; // 기본 바 색상
let defaultColorFloat;
let alertColor; // 경고 바 색상
let alertColorFloat;

// 16:9 게임 영역에 UI를 그리기 위한 씬
export let scene;
export let camera;

export function init() {
  renderer = renderClass.renderer; // 렌더러는 유일하므로 클래스에서 빼낸다.
  buttons = [];
  bars = [];
  mouseClicked = false;
  defaultColor = 0x4caf50;
  defaultColorFloat = new THREE.Color(defaultColor);
  alertColor = 0xff0000;
  alertColorFloat = new THREE.Color(alertColor);

  // scene
  scene = new THREE.Scene();
  scene.background = null;

  // camera
  camera = new THREE.OrthographicCamera(
    0, // left
    1920, // right
    1080, // top
    0, // bottom
    -1000, // near
    1000 // far
  );
  camera.position.set(0, 0, 100); // 카메라 위치 설정

  renderer.domElement.addEventListener("pointerdown", (event) => {
    mouseClicked = true;
    setSomeUiClicked();
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    mouseClicked = false;
    resetClickedUi();
  });
}

export function createBar(
  botLeftX,
  botLeftY,
  topRightX,
  topRightY,
  value,
  min,
  max,
  direction,
  offset // 안쪽 바와 바깥쪽 바의 크기 차이
) {
  // 바깥쪽
  const width = topRightX - botLeftX;
  const height = topRightY - botLeftY;

  const outerGeometry = new THREE.PlaneGeometry(width, height);
  const outerMaterial = new THREE.MeshBasicMaterial({
    color: 0x444444,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  });

  const outerMesh = new THREE.Mesh(outerGeometry, outerMaterial);
  outerMesh.position.set(botLeftX + width / 2, botLeftY + height / 2, 0);

  // 안쪽
  const innerWidth = width - offset;
  const innerHeight = height - offset;

  const innerGeometry = new THREE.PlaneGeometry(innerWidth, innerHeight);
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x4caf50, // 기본 색상
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  });

  const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
  innerMesh.position.set(
    botLeftX + width / 2,
    botLeftY + height / 2,
    0.1 // 바깥쪽 메쉬보다 약간 위에 위치
  );

  const bar = {
    outerMesh: outerMesh,
    innerMesh: innerMesh,
    outerWidth: width,
    outerHeight: height,
    innerWidth: innerWidth,
    innerHeight: innerHeight,
    value: value, // 이 바가 나타내는 값 (alias)
    min: min,
    max: max,
    direction: direction, // "up", "down", "left", "right"
    offset: offset,
  };

  bars.push(bar);
  scene.add(outerMesh);
  scene.add(innerMesh);
}

export function updateBars() {
  for (const bar of bars) {
    let value = eval(bar.value);
    // 바의 현재 값이 최소값과 최대값 사이에 있는지 확인
    if (value < bar.min) {
      value = bar.min;
    } else if (value > bar.max) {
      value = bar.max;
    }
    const ratio = (value - bar.min) / (bar.max - bar.min);

    // 컬러 보간
    if (ratio <= 0.75) {
      bar.innerMesh.material.color.setRGB(
        defaultColorFloat.r,
        defaultColorFloat.g,
        defaultColorFloat.b
      );
    } else {
      const t = (ratio - 0.75) / 0.25;
      const r = defaultColorFloat.r * (1 - t) + alertColorFloat.r * t;
      const g = defaultColorFloat.g * (1 - t) + alertColorFloat.g * t;
      const b = defaultColorFloat.b * (1 - t) + alertColorFloat.b * t;
      bar.innerMesh.material.color.setRGB(r, g, b);
    }

    // 안쪽 바의 크기를 현재 값에 맞게 조정
    switch (bar.direction) {
      case "up":
        bar.innerMesh.scale.y = ratio;
        // 안쪽 바의 위치를 바깥쪽 바의 아래에 맞추기
        bar.innerMesh.position.y =
          bar.outerMesh.position.y -
          bar.outerHeight / 2 +
          (bar.innerHeight * ratio) / 2 +
          bar.offset / 2;
        break;
      case "down":
        bar.innerMesh.scale.y = ratio;
        bar.innerMesh.position.y =
          bar.outerMesh.position.y - (bar.outerMesh.scale.y * ratio) / 2;
        break;
      case "left":
        bar.innerMesh.scale.x = ratio;
        break;
      case "right":
        bar.innerMesh.scale.x = ratio;
        bar.innerMesh.position.x =
          bar.outerMesh.position.x - (bar.outerMesh.scale.x * ratio) / 2;
        break;
    }
  }
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
    depthWrite: false,
    depthTest: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(botLeftX + width / 2, botLeftY + height / 2, 0);

  const button = {
    inputs: inputs,
    mesh: mesh,
    tex0: tex0,
    tex1: tex1,
    tex2: tex2,
    state: 0, // 0: 기본, 1: 마우스 오버, 2: 클릭
    functionName: functionName,
  };

  buttons.push(button);
  scene.add(mesh);
}

// 마우스 움직임이 감지되면 ui 위에 있는지 확인하는 함수
export function isMouseOver() {
  // gameDisplay.calcGameCoords 함수를 사용하여 현재 화면 좌표를 1920x1080 기준 좌표로 변환
  const coords = gameDisplay.calcGameCoords(mouseMove.mouseX, mouseMove.mouseY);
  const x = coords.x;
  const y = coords.y;
  for (const ui of buttons) {
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
  for (const ui of buttons) {
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
  for (const ui of buttons) {
    if (ui.state === 2) {
      ui.state = 1;
      ui.mesh.material.map = ui.tex1; // 기본 상태의 텍스처로 변경
      // 클릭된 UI의 함수 호출
      ui.functionName();
    }
  }
  selectedUi = null; // 클릭된 UI를 초기화
}
