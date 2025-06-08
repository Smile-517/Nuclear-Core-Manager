export class MouseMove {
  // 객체 내부 변수들
  renderer;
  controls;
  uiClass;

  mouseClicked = false;

  constructor(renderer, controls, uiClass) {
    this.renderer = renderer;
    this.controls = controls;
    this.uiClass = uiClass;

    this.renderer.domElement.addEventListener("pointerdown", (event) => {
      this.mouseClicked = true;
    });
    this.renderer.domElement.addEventListener("pointerup", (event) => {
      this.mouseClicked = false;
    });

    this.renderer.domElement.addEventListener("pointermove", (event) => {
      const canvasRect = this.renderer.domElement.getBoundingClientRect();
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;
      const canvasHeight = canvasRect.height;
      const flippedY = canvasHeight - mouseY;

      // orbitControls를 이용하고 있다가 Nuke창을 벗어났을 때에도 orbitControls가 끊기지 않도록
      if (!this.mouseClicked) {
        this.controls.setOrbicControls(mouseX, flippedY);
      }

      uiClass
    });
  }
}
