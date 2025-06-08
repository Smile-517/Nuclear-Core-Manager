import * as gameDisplay from "./gameDisplay.js";
import * as windowHandler from "./windowHandler.js";
import * as cityScene from "./cityScene.js";
import * as nukeScene from "./nukeScene.js";
import * as roomScene from "./roomScene.js";
import * as renderClass from "./renderClass.js";
import * as controls from "./controls.js";
import * as states from "./states.js";
import * as mouseMove from "./mouseMove.js";
import * as uiClass from "./uiClass.js";

import { TICKS_PER_SECOND } from "./params.js";

renderClass.init();
gameDisplay.init();
cityScene.init();
nukeScene.init();
roomScene.init();
const renderer = renderClass.renderer; // 렌더러는 유일하므로 클래스에서 빼낸다.
windowHandler.init();
controls.init();
uiClass.init();
states.init();
mouseMove.init();

nukeScene.initUi();

const intervalId = setInterval(() => {
  nukeScene.tick();
  states.update();
}, 1000 / TICKS_PER_SECOND);

function animate() {
  controls.update();
  cityScene.update();
  uiClass.updateBars();

  // 1. 전체 캔버스를 '레터박스 색'으로 지운다
  // viewport/scissor를 캔버스 전체로 설정
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  // clearColor를 레터박스 색으로 지정하고 clear()
  renderer.setClearColor(0xf0d0e0);
  renderer.clear();

  // 2. 16:9 비율의 영역을 게임 영역으로 설정
  let rect = gameDisplay.rect;
  renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
  renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
  // clearColor를 게임 영역 색으로 지정하고 clear()
  renderer.setClearColor(0xe0f0d0);
  renderer.clear();

  // 3. 도시 씬을 렌더링
  rect = windowHandler.cityDisplay;
  renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
  renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
  renderer.render(cityScene.scene, cityScene.camera);

  // 4. 핵 코어 씬을 렌더링
  rect = windowHandler.nukeDisplay;
  renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
  renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
  renderer.render(nukeScene.scene, nukeScene.camera);

  // 5. 방 씬을 렌더링
  rect = windowHandler.roomDisplay;
  renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
  renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
  renderer.render(roomScene.scene, roomScene.camera);

  // 6. UI 렌더링
  rect = gameDisplay.rect;
  renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
  renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
  renderer.render(uiClass.scene, uiClass.camera);

  requestAnimationFrame(animate);
}

animate(); // 애니메이션 시작
