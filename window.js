import * as THREE from "three";

import { ASPECT_RATIO, LOG_DEBUG } from "./params.js";

export class Window {
  // 객체 내부 변수들
  // 렌더러와 각 씬 오브젝트의 주소를 저장 (alias 역할)
  gameDisplay; // 게임 영역을 나타내는 객체
  renderer;
  cityScene;
  nukeScene;
  roomScene;

  cityDisplay;
  nukeDisplay;
  roomDisplay;

  // 16:9 게임 영역에 UI를 그리기 위한 씬
  scene;
  camera;

  constructor(gameDisplay, renderer, cityScene, nukeScene, roomScene) {
    this.gameDisplay = gameDisplay;
    this.renderer = renderer;
    this.cityScene = cityScene;
    this.nukeScene = nukeScene;
    this.roomScene = roomScene;

    // scene
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // camera
    this.camera = new THREE.OrthographicCamera(
      0, // left
      window.innerWidth, // right
      window.innerHeight, // top
      0, // bottom
      -1000, // near
      1000 // far
    );
    this.camera.position.set(0, 0, 100); // 카메라 위치 설정

    // 화면 크기들을 계산
    this.onResize();
    window.addEventListener("resize", () => this.onResize(), false);
  }

  onResize() {
    this.camera.left = 0;
    this.camera.right = window.innerWidth;
    this.camera.top = window.innerHeight;
    this.camera.bottom = 0;
    this.camera.updateProjectionMatrix();

    this.gameDisplay.update();
    if (LOG_DEBUG >= 4) {
      console.log("Window resized:", this.gameDisplay.rect);
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);

    // 여기서 각 창들의 위치와 크기를 변경할 수 있다.
    this.cityDisplay = this.gameDisplay.calcDisplay(985, 565, 1870, 1030);
    this.nukeDisplay = this.gameDisplay.calcDisplay(1185, 50, 1870, 515);
    this.roomDisplay = this.gameDisplay.calcDisplay(100, 200, 935, 1030);
    if (LOG_DEBUG >= 4) {
      console.log("City display:", this.cityDisplay);
      console.log("Nuke display:", this.nukeDisplay);
      console.log("Room display:", this.roomDisplay);
    }

    // 카메라들의 비율을 업데이트
    this.cityScene.camera.aspect =
      this.cityDisplay.width / this.cityDisplay.height;
    this.nukeScene.camera.aspect =
      this.nukeDisplay.width / this.nukeDisplay.height;
    this.roomScene.camera.aspect =
      this.roomDisplay.width / this.roomDisplay.height;
    this.cityScene.camera.updateProjectionMatrix();
    this.nukeScene.camera.updateProjectionMatrix();
    this.roomScene.camera.updateProjectionMatrix();
    if (LOG_DEBUG >= 4) {
      console.log("City camera aspect:", this.cityScene.camera.aspect);
      console.log("Nuke camera aspect:", this.nukeScene.camera.aspect);
      console.log("Room camera aspect:", this.roomScene.camera.aspect);
    }
  }

  addUiToScene(uiClass) {
    for (const ui of uiClass.uis) {
      this.scene.add(ui.mesh);
    }
  }
}
