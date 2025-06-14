import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RENDER_DEBUG } from "../params.js";
import * as controls from "../controls.js";
import * as renderClass from "../renderClass.js";

// 객체 내부 변수들
export let scene;
export let camera;
export let pointLight;
let gltfLoader;
let floor;
let axesHelper;
let pointLightHelper;
let mixer;
let clock = new THREE.Clock();  // 애니메이션 시간을 추적하기 위한 클록 추가

export function init() {
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd0e0f0);

  // camera
  camera = new THREE.PerspectiveCamera();
  camera.position.set(2, 3, -6);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.updateProjectionMatrix();
  scene.add(camera);

  // OrbitControls 설정
  controls.settingOrbitControls(renderClass.renderer);

  // ambient light (기본 조명)
  const ambientLight = new THREE.AmbientLight(0xc5d1eb, 0.25); // 약한 기본 조명
  scene.add(ambientLight);

  // point light (방 안의 조명)
  pointLight = new THREE.PointLight(0xffffff, 100.0);
  pointLight.position.set(0, 5, -2); // 방 안의 조명 위치 설정
  pointLight.distance = 6.5;
  pointLight.decay = 1.5;
  pointLight.castShadow = true; // 그림자 생성
  scene.add(pointLight);

  // 방
  const roomGeometry = new THREE.BoxGeometry(15, 15, 15);  // 정육면체로 변경
  const roomMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x868e96,
    side: THREE.BackSide  // 안쪽이 보이도록 설정
  });
  const room = new THREE.Mesh(roomGeometry, roomMaterial);
  room.position.set(0, 7.5, 0);  // 방의 중심을 y=10으로 설정
  room.receiveShadow = true;
  scene.add(room);

  // GLTFLoader 초기화
  gltfLoader = new GLTFLoader();

  // 모델 로딩을 Promise로 처리
  const loadModel = (url, options = {}) => {
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          if (options.position) model.position.set(...options.position);
          if (options.scale) model.scale.set(...options.scale);
          if (options.rotation) model.rotation.y = options.rotation;
          model.castShadow = true;
          model.receiveShadow = true;
          scene.add(model);
          resolve({ model, gltf });
        },
        (xhr) => {
          // console.log(`${url} loading progress: ${(xhr.loaded / xhr.total * 100)}%`);
        },
        (error) => {
          console.error(`Error loading ${url}:`, error);
          reject(error);
        }
      );
    });
  };

  // 모든 모델을 동시에 로드
  Promise.all([
    // 로봇 모델
    loadModel('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb', {
      position: [0, 0.3, -0.35],
      scale: [0.3, 0.3, 0.3],
      rotation: Math.PI
    }),
    // 의자 모델
    loadModel('./assets/models/office chair.glb', {
      position: [0, 0, 0],
      scale: [1.1, 1.1, 1.1],
      rotation: Math.PI
    }),
    // 책상 모델
    loadModel('./assets/models/computer_desk.glb', {
      position: [0, 0, -0.5],
      scale: [0.015, 0.015, 0.015],
      rotation: 0
    })
  ]).then(([robot, chair, desk]) => {
    // 로봇 애니메이션 설정
    if (robot && robot.model && robot.gltf && robot.gltf.animations) {
      mixer = new THREE.AnimationMixer(robot.model);
      const animations = robot.gltf.animations;
      if (animations && animations.length > 0) {
        const sittingClip = animations.find(clip => clip.name === 'Sitting');
        if (sittingClip) {
          const action = mixer.clipAction(sittingClip);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
        }
      }
    }
  }).catch(error => {
    console.error('Error loading models:', error);
  });

  // 디버그 모드일 때만 헬퍼 추가
  if (RENDER_DEBUG) {
    // 축 헬퍼 (월드 기준 XYZ 축 표시)
    axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // point light 헬퍼 (조명 위치 시각화)
    pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(pointLightHelper);
  }
}

export function update() {
  if (mixer) {
    mixer.update(clock.getDelta());
  }
}
