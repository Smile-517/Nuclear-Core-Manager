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
  createButton(
    botLeftX,
    botLeftY,
    topRightX,
    topRightY,
    texture0,
    texture1,
    texture2
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
    };

    this.uis.push(ui);
  }

  // 마우스 움직임이 감지되면 ui 위에 있는지 확인하는 함수
  isMouseOver(mouseX, mouseY) {
    for (const ui of this.uis) {
      const rect = this.gameDisplay.calcDisplay(
        ui.inputs.botLeftX,
        ui.inputs.botLeftY,
        ui.inputs.topRightX,
        ui.inputs.topRightY
      );
      if (
        mouseX >= rect.x &&
        mouseX <= rect.x + rect.width &&
        mouseY >= rect.y &&
        mouseY <= rect.y + rect.height
      ) {
        return ui; // 해당 UI를 반환
      }
    }
    return null; // 어떤 UI에도 해당하지 않으면 null 반환
  }
}
