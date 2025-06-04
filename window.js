import { ASPECT_RATIO, LOG_DEBUG } from "./params.js";

export class Window {
  // 객체 내부 변수들
  // 렌더러와 각 씬 오브젝트의 주소를 저장 (alias 역할)
  renderer;
  cityScene;
  nukeScene;

  gameDisplay; // 게임 영역을 나타내는 객체
  cityDisplay;
  nukeDisplay;
  roomDisplay;

  constructor(renderer, cityScene, nukeScene) {
    this.renderer = renderer;
    this.cityScene = cityScene;
    this.nukeScene = nukeScene;

    this.onResize();
    window.addEventListener("resize", () => this.onResize(), false);
  }

  onResize() {
    const windowAspect = window.innerWidth / window.innerHeight;
    let newWidth, newHeight;
    if (windowAspect > ASPECT_RATIO) {
      newWidth = window.innerHeight * ASPECT_RATIO;
      newHeight = window.innerHeight;
    } else {
      newWidth = window.innerWidth;
      newHeight = window.innerWidth / ASPECT_RATIO;
    }
    const offsetX = (window.innerWidth - newWidth) / 2;
    const offsetY = (window.innerHeight - newHeight) / 2;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 이제부터 gameDisplay가 16:9 비율의 영역을 나타냄 - 전체 게임 창의 영역
    this.gameDisplay = {
      x: offsetX,
      y: offsetY,
      width: newWidth,
      height: newHeight,
    };
    if (LOG_DEBUG >= 4) {
      console.log("Window resized:", this.gameDisplay);
    }

    // 여기서 각 창들의 위치와 크기를 변경할 수 있다.
    this.cityDisplay = this.calcDisplay(0.5125, 0.5, 0.4625, 0.45);
    this.nukeDisplay = this.calcDisplay(0.59, 0.05, 0.385, 0.425);
    this.roomDisplay = this.calcDisplay(0.075, 0.15, 0.4125, 0.8);
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
    this.cityScene.camera.updateProjectionMatrix();
    this.nukeScene.camera.updateProjectionMatrix();
    if (LOG_DEBUG >= 4) {
      console.log("City camera aspect:", this.cityScene.camera.aspect);
      console.log("Nuke camera aspect:", this.nukeScene.camera.aspect);
    }
  }

  // botLeftXRatio: 왼쪽 아래 x 좌표 대 전체 화면 x 좌표 비율
  // botLeftYRatio: 왼쪽 아래 y 좌표 대 전체 화면 y 좌표 비율
  // widthRatio: 전체 화면 너비 대 창 너비 비율
  // heightRatio: 전체 화면 높이 대 창 높이 비율
  calcDisplay(botLeftXRatio, botLeftYRatio, widthRatio, heightRatio) {
    const rect = this.gameDisplay;
    return {
      x: rect.x + rect.width * botLeftXRatio,
      y: rect.y + rect.height * botLeftYRatio,
      width: rect.width * widthRatio,
      height: rect.height * heightRatio,
    };
  }
}
