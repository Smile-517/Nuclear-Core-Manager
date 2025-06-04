import { Window } from "./window.js";
import { CityScene } from "./cityScene.js";
import { NukeScene } from "./nukeScene.js";
import { RoomScene } from "./roomScene.js";
import { Renderer } from "./renderer.js";
import { Controls } from "./controls.js";
import { States } from "./states.js";
import { MouseMove } from "./mouseMove.js";

const cityScene = new CityScene();
const nukeScene = new NukeScene();
const roomScene = new RoomScene();
const rendererClass = new Renderer();
const renderer = rendererClass.getRenderer(); // 렌더러는 유일하므로 클래스에서 빼낸다.
const windowClass = new Window(renderer, cityScene, nukeScene);
const controls = new Controls(nukeScene.camera, renderer, windowClass);
const states = new States();
const mouseMove = new MouseMove(renderer, controls);

function animate() {
  controls.update();
  states.update();
  cityScene.update(states);

  // 1. 전체 캔버스를 '레터박스 색'으로 지운다
  // viewport/scissor를 캔버스 전체로 설정
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  // clearColor를 레터박스 색으로 지정하고 clear()
  renderer.setClearColor(0xf0d0e0);
  renderer.clear();

  // 2. 16:9 비율의 영역을 게임 영역으로 설정
  let rect = windowClass.gameDisplay;
  renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
  renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
  // 게임 영역 색으로 지정하고 clear()
  renderer.setClearColor(0xe0f0d0);
  renderer.clear();

  // 3. 도시 씬을 렌더링
  rect = windowClass.cityDisplay;
  renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
  renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
  renderer.render(cityScene.scene, cityScene.camera);

  // 4. 핵 코어 씬을 렌더링
  rect = windowClass.nukeDisplay;
  renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
  renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
  renderer.render(nukeScene.scene, nukeScene.camera);

  // 5. 방 씬을 렌더링
  rect = windowClass.roomDisplay;
  renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
  renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
  renderer.render(roomScene.scene, roomScene.camera);

  requestAnimationFrame(animate);
}

animate(); // 애니메이션 시작
