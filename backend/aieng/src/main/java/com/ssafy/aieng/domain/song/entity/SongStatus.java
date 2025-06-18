package com.ssafy.aieng.domain.song.entity;

public enum SongStatus {
    NONE,           // (선택) 아직 아무 요청도 없음
    REQUESTED,      // 생성 버튼 클릭 + 요청 보냄
    IN_PROGRESS,    // FastAPI에서 작업 중
    READY,          // Redis에 결과 도착, 프리뷰 가능
    SAVED,          // 최종 저장 완료
    FAILED          // 예외 또는 실패
}