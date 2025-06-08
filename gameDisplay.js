import { ASPECT_RATIO } from "./params.js";

export class GameDisplay {
  rect;

  constructor() {
    this.update();
  }

  update() {
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

    // 이제부터 gameDisplay가 16:9 비율의 영역을 나타냄 - 전체 게임 창의 영역
    this.rect = {
      x: offsetX,
      y: offsetY,
      width: newWidth,
      height: newHeight,
    };
  }

  // 1920x1080 기준으로 픽셀 좌표를 계산하는 함수
  // 반환되는 좌표는 현재 화면 전체에 상대적이다.
  // botLeftX: 1920x1080 기준 왼쪽 아래 x 좌표
  // botLeftY: 1920x1080 기준 왼쪽 아래 y 좌표
  // topRightX: 1920x1080 기준 오른쪽 위 x 좌표
  // topRightY: 1920x1080 기준 오른쪽 위 y 좌표
  calcDisplay(botLeftX, botLeftY, topRightX, topRightY) {
    const rect = this.rect;
    return {
      x: botLeftX * (rect.width / 1920) + rect.x,
      y: botLeftY * (rect.height / 1080) + rect.y,
      width: (topRightX - botLeftX) * (rect.width / 1920),
      height: (topRightY - botLeftY) * (rect.height / 1080),
    };
  }
}
