import * as THREE from "three";

export class UiClass {
  gameDisplay;
  renderer;

  uis; // 생성된 UI 요소들을 저장하는 배열

  constructor(gameDisplay, renderer) {
    this.gameDisplay = gameDisplay;
    this.renderer = renderer;
    this.uis = [];
  }

  // botLeftX, botLeftY, topRightX, topRightY, texture가 인수로 들어오면 그에 맞는 UI를 생성하는 함수
  createButton(botLeftX, botLeftY, topRightX, topRightY, texture) {
    // 1920x1080 기준 좌표 -> 현재 화면 기준 좌표로 변환
    const inputs = {
      botLeftX: botLeftX,
      botLeftY: botLeftY,
      topRightX: topRightX,
      topRightY: topRightY,
    };
    const rect = this.gameDisplay.calcDisplay(
      botLeftX,
      botLeftY,
      topRightX,
      topRightY
    );
    const originalSize = { w: rect.width, h: rect.height };

    const geometry = new THREE.PlaneGeometry(rect.width, rect.height);
    const loader = new THREE.TextureLoader();
    const tex = loader.load(texture);
    const material = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(rect.x + rect.width / 2, rect.y + rect.height / 2, 0);

    const ui = {
      inputs: inputs,
      originalSize: originalSize,
      mesh: mesh,
    };

    this.uis.push(ui);
  }

  updatePosition() {
    for (const ui of this.uis) {
      const rect = this.gameDisplay.calcDisplay(
        ui.inputs.botLeftX,
        ui.inputs.botLeftY,
        ui.inputs.topRightX,
        ui.inputs.topRightY
      );
      ui.mesh.position.set(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
        0
      );

      const scaleX = rect.width / ui.originalSize.w;
      const scaleY = rect.height / ui.originalSize.h;
      ui.mesh.scale.set(scaleX, scaleY, 1);
    }
  }
}
