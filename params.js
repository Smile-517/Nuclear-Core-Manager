export const ASPECT_RATIO = 16 / 9; // 이건 사실상 변경 불가. 많은 곳에서 1920x1080을 전제로 함.
export const RENDER_DEBUG = true;
export const LOG_DEBUG = 4; // 0: 없음 1: ERROR만 2: WARN까지 3: INFO까지 4: 디버그용 도배 LOG까지 허용

export const LEN_ONE_DAY = 10; // 하루의 길이 (초 단위)
export const LATITUDE = 38;
export const TICKS_PER_SECOND = 200;

// 연료봉 관련
export const CONTROL_ROD_SPEED = 2; // 제어봉 제어 속도
// 중성자 관련
export const MAX_NEUTRONS = 10000; // 최대 중성자 수
export const P_NEUTRON = 0.775; // 연료봉 충돌 시 중성자 생성 확률
