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
    this.cityDisplay = this.calcDisplay(985, 565, 1870, 1030);
    this.nukeDisplay = this.calcDisplay(1185, 50, 1870, 515);
    this.roomDisplay = this.calcDisplay(100, 200, 935, 1030);
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

  // 1920x1080 기준으로 픽셀 좌표를 계산하는 함수
  // botLeftX: 1920x1080 기준 왼쪽 아래 x 좌표
  // botLeftY: 1920x1080 기준 왼쪽 아래 y 좌표
  // topRightX: 1920x1080 기준 오른쪽 위 x 좌표
  // topRightY: 1920x1080 기준 오른쪽 위 y 좌표
  calcDisplay(botLeftX, botLeftY, topRightX, topRightY) {
    const rect = this.gameDisplay;
    return {
      x: botLeftX * (rect.width / 1920) + rect.x,
      y: botLeftY * (rect.height / 1080) + rect.y,
      width: (topRightX - botLeftX) * (rect.width / 1920),
      height: (topRightY - botLeftY) * (rect.height / 1080),
    };
  }
}
