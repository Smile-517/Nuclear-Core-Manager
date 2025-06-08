import * as THREE from "three";

import {
  RENDER_DEBUG,
  LOG_DEBUG,
  TICKS_PER_SECOND,
  MAX_NEUTRONS,
  P_NEUTRON,
  CONTROL_ROD_SPEED,
} from "./params.js";

export class NukeScene {
  ui; // UI 객체

  // 객체 내부 변수들
  scene;
  camera;
  renderer;
  spotLight;
  reactor;
  axesHelper;
  spotLightHelper;

  isStartingUp; // 원자로의 시동을 걸기 위해 중성자를 방출하는지 여부

  // 원자로 연료봉, 제어봉 관련 변수들
  coreRadius;
  coreHeight;
  rodPositions; // 7x7 행렬로 각 봉의 중심점 위치를 저장
  whichRods; // 각 봉이 연료봉인지 제어봉인지 구분하는 배열 (0: 사용 안 함, 1: 연료봉, 2: 제어봉)
  controlRods; // 제어봉 객체들은 따로 관리함
  numFuelRods;
  numControlRods;
  rodRadius; // 연료봉, 제어봉의 반지름
  rodOffset; // 봉의 위치 오프셋 (원자로 표면 위에 위치하도록), z-fighting 회피.
  controlRodOperation; // 제어봉에게 내리는 명령의 상태: -1: 내리기, 0: 유지, 1: 올리기
  controlRodPosY;

  // 중성자 관련 변수들
  maxNeutrons;
  neutronMaterial;
  particles;
  // 중성자 풀
  positions; // Float32Array
  velocities; // Float32Array
  inUse; // boolean[]
  available; // number[] (stack of free indices)
  activeCount;

  constructor() {
    // 변수 초기화
    this.coreRadius = 2;
    this.coreHeight = 4;
    this.rodPositions = [];
    this.whichRods = [];
    this.controlRods = [];
    this.numFuelRods = 0;
    this.numControlRods = 0;
    this.rodOffset = 0.001;
    this.activeNeutrons = [];
    this.neutronMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffff00,
    });
    this.controlRodPosY = 0; // 제어봉의 Y 위치
    this.controlRodOperation = 0; // 제어봉의 현재 상태: -1: 내리기, 0: 유지, 1: 올리기

    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // 배경색을 검은색으로 설정

    // neutron material
    this.neutronMaterial = new THREE.PointsMaterial({
      size: 0.025,
      map: this._createCircleTexture(),
      transparent: false,
      alphaTest: 0.5,
      depthWrite: true,
      depthTest: true,
    });

    // Pool 초기화
    this.maxNeutrons = MAX_NEUTRONS;
    this.positions = new Float32Array(this.maxNeutrons * 3);
    this.velocities = new Float32Array(this.maxNeutrons * 3);
    this.inUse = new Array(this.maxNeutrons).fill(false);
    this.available = Array.from(
      { length: this.maxNeutrons },
      (_, i) => i
    ).reverse();
    this.activeCount = 0;

    // BufferGeometry 하나를 만들어서 모든 중성자를 관리
    const neutronGeometry = new THREE.BufferGeometry();
    neutronGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3).setUsage(
        THREE.DynamicDrawUsage
      )
    );
    neutronGeometry.setDrawRange(0, 0); // 초기에는 안 보이게

    this.particles = new THREE.Points(neutronGeometry, this.neutronMaterial);
    this.particles.renderOrder = 1;
    this.particles.frustumCulled = false;
    this.scene.add(this.particles);

    this._setupCamera();
    this._setupLights();
    this._setupReactor();
    this._setupRods();
    if (RENDER_DEBUG) this._setupHelpers();
  }

  // 원형 스프라이트 캔버스 생성
  _createCircleTexture() {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  _setupCamera() {
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(0, 9, 0); // 초기 위치 설정
    // this.camera.lookAt(new THREE.Vector3(0, 0, 0));  // 여기 말고 OrbitControls에서 설정해야 함
    this.camera.updateProjectionMatrix();
    this.scene.add(this.camera);
  }

  _setupLights() {
    // ambient light (전체 조명)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.075); // 약한 전체 조명
    this.scene.add(ambientLight);

    // spotlight (원자로를 비추는 조명)
    this.spotLight = new THREE.SpotLight(0xffffff, 1.0);
    this.spotLight.position.set(0, 15, 0); // 원자로 위에서 비추도록 설정
    this.spotLight.castShadow = true;
    this.spotLight.angle = Math.PI / 4; // 조명의 각도 설정
    this.spotLight.penumbra = 0.4; // 페넘브라 설정 (부드러운 그림자)
    this.spotLight.intensity = 400; // 조명 강도 설정
    this.scene.add(this.spotLight);
  }

  _setupReactor() {
    // 바닥
    const floorGeometry = new THREE.PlaneGeometry(128, 128);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // 바닥을 수평으로 회전
    floor.receiveShadow = true; // 그림자 받기
    this.scene.add(floor);

    // 원자로 껍데기 (샘플로 간단한 실린더 사용)
    const reactorGeometry = new THREE.CylinderGeometry(
      this.coreRadius,
      this.coreRadius,
      this.coreHeight,
      256
    );
    const reactorMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.8,
      roughness: 0.4,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.reactor = new THREE.Mesh(reactorGeometry, reactorMaterial);
    this.reactor.castShadow = true;
    this.reactor.position.set(0, this.coreHeight / 2 + this.rodOffset, 0); // 원자로 위치 설정
    this.reactor.renderOrder = 0;
    this.scene.add(this.reactor);
  }

  _setupRods() {
    // 각 봉의 중심점을 보관하는 7x7 행렬을 생성
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        // 각 봉의 위치를 계산
        const z = i * 0.5; // Z축으로 간격을 두고 배치
        const x = j * 0.5; // X축으로 간격을 두고 배치
        this.rodPositions.push([x, z]);
      }
    }
    if (LOG_DEBUG >= 3) console.log("Rod positions:", this.rodPositions);

    // 어떤 봉이 연료봉인지 제어봉인지 설정
    // 0: 사용 안 함, 1: 연료봉, 2: 제어봉
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        if (
          (i == -3 && (j <= -2 || j >= 2)) ||
          (i == -2 && (j == -3 || j == 3)) ||
          (i == 2 && (j == -3 || j == 3)) ||
          (i == 3 && (j <= -2 || j >= 2))
        ) {
          this.whichRods.push(0);
        } else if (
          (i == -2 && (j == -2 || j == 0 || j == 2)) ||
          (i == 0 && (j == -2 || j == 0 || j == 2)) ||
          (i == 2 && (j == -2 || j == 0 || j == 2))
        ) {
          this.whichRods.push(2);
          this.numControlRods++;
        } else {
          this.whichRods.push(1);
          this.numFuelRods++;
        }
      }
    }
    if (LOG_DEBUG >= 3) console.log("Which rods:", this.whichRods);

    // 행렬을 이용해 연료봉 생성
    this.rodRadius = 0.1; // 연료봉, 제어봉의 반지름 설정
    const r = this.rodRadius;
    const h = this.coreHeight - 0.01;
    const fuelRodGeometry = new THREE.CylinderGeometry(r, r, h, 32);
    const fuelRodMaterial = new THREE.MeshStandardMaterial({ color: 0x3fdf7f }); // 금색
    for (let i = 0; i < this.rodPositions.length; i++) {
      if (this.whichRods[i] != 1) continue;
      const [x, z] = this.rodPositions[i];
      const fuelRod = new THREE.Mesh(fuelRodGeometry, fuelRodMaterial);
      fuelRod.position.set(x, this.coreHeight / 2 + this.rodOffset, z); // X, Z축으로 간격을 두고 배치
      fuelRod.castShadow = true;
      this.scene.add(fuelRod);
    }

    // 행렬을 이용해 제어봉 생성
    const controlRodGeometry = new THREE.CylinderGeometry(r, r, h, 32);
    const controlRodMaterial = new THREE.MeshStandardMaterial({
      color: 0x0000ff,
    }); // 파란색
    for (let i = 0; i < this.rodPositions.length; i++) {
      if (this.whichRods[i] != 2) continue;
      const [x, z] = this.rodPositions[i];
      const controlRod = new THREE.Mesh(controlRodGeometry, controlRodMaterial);
      controlRod.position.set(x, this.coreHeight / 2 + this.rodOffset, z); // X, Z축으로 간격을 두고 배치
      controlRod.castShadow = true;
      this.controlRods.push(controlRod);
      this.scene.add(controlRod);
    }
  }

  _setupHelpers() {
    // 축 헬퍼 (월드 기준 XYZ 축 표시)
    this.axesHelper = new THREE.AxesHelper(5);
    this.scene.add(this.axesHelper);

    // spotlight 헬퍼 (조명 방향 시각화)
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
    this.scene.add(this.spotLightHelper);
  }

  // 1초에 TICKS_PER_SECOND번 호출됨.
  tick() {
    // 원자로가 시동 중이면 중성자를 방출
    if (this.isStartingUp) {
      // this.coreRadius, 2, 0 위치에서 중심 방향으로 1초에 10개의 중성자를 확률적으로 방출
      if (Math.random() < 10 / TICKS_PER_SECOND) {
        this._startupNeutrons();
      }
    }

    // 제어봉 조작
    if (this.controlRodOperation != 0) {
      if (this.controlRodOperation === -1) {
        // 제어봉을 1초당 CONTROL_ROD_SPEED씩 내리기
        this.controlRodPosY -= CONTROL_ROD_SPEED / TICKS_PER_SECOND;
        if (this.controlRodPosY < 0) this.controlRodPosY = 0; // 최저 위치 제한
      } else {
        // this.controlRodOperation === 1
        // 제어봉을 1초당 CONTROL_ROD_SPEED씩 올리기
        this.controlRodPosY += CONTROL_ROD_SPEED / TICKS_PER_SECOND;
        if (this.controlRodPosY > this.coreHeight)
          this.controlRodPosY = this.coreHeight; // 최고 위치 제한
      }
      // 제어봉 위치 업데이트
      for (let i = 0; i < this.controlRods.length; i++) {
        const controlRod = this.controlRods[i];
        controlRod.position.y =
          this.controlRodPosY + this.coreHeight / 2 + this.rodOffset;
      }
    }

    // 각 중성자들에 대한 계산 시작
    const pos = this.positions;
    const vel = this.velocities;
    let i = 0;
    while (i < this.activeCount) {
      const base = i * 3;
      // 중성자 위치 업데이트
      pos[base] += vel[base];
      pos[base + 1] += vel[base + 1];
      pos[base + 2] += vel[base + 2];

      // 충돌 테스트를 위한 좌표 추출
      const x = pos[base],
        y = pos[base + 1],
        z = pos[base + 2];
      const twoD = Math.hypot(x, z);
      // 1. 원자로의 경계 검사
      if (y < 0 || y > this.coreHeight || twoD > this.coreRadius) {
        this._removeNeutron(i);
        continue; // don't increment i
      }

      // 2. 연료봉과의 충돌 검사
      let collided = false;
      for (let j = 0; j < this.rodPositions.length; j++) {
        if (this.whichRods[j] !== 1) continue; // 연료봉만 검사
        const [rx, rz] = this.rodPositions[j];
        const dx = x - rx;
        const dz = z - rz;
        const distance = Math.hypot(dx, dz);
        if (distance < this.rodRadius) {
          // 충돌 발생
          collided = true;
          this._removeNeutron(i);
          // P_NEUTRON의 확률로 3개의 중성자를 방출
          if (Math.random() < P_NEUTRON) {
            for (let k = 0; k < 3; k++) {
              // 충돌이 발생한 fuel rod에서 y값은 충돌 지점의 y값으로 하고, 랜덤한 각도를 설정하여 그 방향으로 중성자를 방출
              const angle = Math.random() * Math.PI * 2; // 0 ~ 2π 사이의 랜덤 각도
              const vX = Math.cos(angle);
              const vY = 2 * Math.random() - 1; // -1 ~ 1 사이의 랜덤 Y 속도
              const vZ = Math.sin(angle);
              // x와 z는 v의 방향 쪽으로 좀 더 이동
              const posX = rx + vX * this.rodRadius * 1.5;
              const posZ = rz + vZ * this.rodRadius * 1.5;
              this._makeNeutron(posX, y, posZ, vX, vY, vZ);
            }
          }
          break;
        }
      }

      if (collided) continue; // 연료봉과 충돌했으면 다음 중성자로 넘어감

      // 3. 제어봉과의 충돌 검사
      collided = false;
      for (let j = 0; j < this.rodPositions.length; j++) {
        if (this.whichRods[j] !== 2) continue; // 제어봉만 검사
        if (y < this.controlRodPosY) continue; // 제어봉 아래에 있는 중성자는 검사하지 않음
        const [rx, rz] = this.rodPositions[j];
        const dx = x - rx;
        const dz = z - rz;
        const distance = Math.hypot(dx, dz);
        if (distance < this.rodRadius) {
          // 충돌 발생
          collided = true;
          this._removeNeutron(i);
          break;
        }
      }

      if (collided) continue; // 제어봉과 충돌했으면 다음 중성자로 넘어감

      i++;
    }

    // update draw range & flag
    this.particles.geometry.setDrawRange(0, this.activeCount);
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  _removeNeutron(i) {
    const last = this.activeCount - 1;
    if (i !== last) {
      // 1) 끝(last) 슬롯 데이터를 i 슬롯으로 복사
      const baseI = i * 3;
      const baseLast = last * 3;
      for (let k = 0; k < 3; k++) {
        this.positions[baseI + k] = this.positions[baseLast + k];
        this.velocities[baseI + k] = this.velocities[baseLast + k];
      }
      this.inUse[i] = this.inUse[last];
    }
    // 2) 마지막 슬롯은 해제 → 재사용 스택으로
    this.inUse[last] = false;
    this.available.push(last);
    // 3) 활성 개수 한 칸 줄이기
    this.activeCount--;
  }

  _startupNeutrons() {
    this._makeNeutron(
      this.coreRadius,
      2,
      0,
      -1,
      2 * Math.random() - 1,
      2 * Math.random() - 1
    );
  }

  _makeNeutron(posX, posY, posZ, vX, vY, vZ) {
    if (this.available.length === 0) {
      if (LOG_DEBUG >= 3) console.log("No available neutrons");
      return;
    }
    const freeIdx = this.available.pop();
    const baseFree = freeIdx * 3;
    // 1) 여유 슬롯에 데이터 기록
    this.positions[baseFree] = posX;
    this.positions[baseFree + 1] = posY;
    this.positions[baseFree + 2] = posZ;
    const v = new THREE.Vector3(vX, vY, vZ)
      .normalize()
      .multiplyScalar((1.5 + Math.random()) / TICKS_PER_SECOND);
    this.velocities[baseFree] = v.x;
    this.velocities[baseFree + 1] = v.y;
    this.velocities[baseFree + 2] = v.z;
    // 2) 활성 영역 끝(activeCount)으로 swap
    const dstIdx = this.activeCount;
    if (freeIdx !== dstIdx) {
      const baseDst = dstIdx * 3;
      // 위치 swap
      for (let k = 0; k < 3; k++) {
        const tmp = this.positions[baseDst + k];
        this.positions[baseDst + k] = this.positions[baseFree + k];
        this.positions[baseFree + k] = tmp;
      }
      // 속도 swap
      for (let k = 0; k < 3; k++) {
        const tmp = this.velocities[baseDst + k];
        this.velocities[baseDst + k] = this.velocities[baseFree + k];
        this.velocities[baseFree + k] = tmp;
      }
      // swap 으로 비워진 freeIdx 슬롯은 다시 재사용 스택에
      this.available.push(freeIdx);
    }

    // 3) activeCount 증가
    this.activeCount++;
    this.inUse[dstIdx] = true;
  }

  initUi(ui) {
    this.ui = ui;
    this.setUis();
  }

  setUis() {
    this.ui.createButton(1795, 440, 1845, 490, "assets/textures/tmpUi.png");
  }
}
