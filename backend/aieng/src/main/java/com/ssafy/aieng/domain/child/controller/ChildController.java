package com.ssafy.aieng.domain.child.controller;

import com.ssafy.aieng.domain.child.dto.request.ChildProfileImgUpdateRequest;
import com.ssafy.aieng.domain.child.dto.request.ChildProfileUpdateRequest;
import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.child.dto.request.ChildProfileCreateRequest;
import com.ssafy.aieng.domain.child.dto.response.ChildInfoResponse;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/child")
@RequiredArgsConstructor
public class ChildController {

    private final AuthenticationUtil authenticationUtil;
    private final ChildService childService;

    // 아이 프로필 등록
    @PostMapping()
    public ResponseEntity<ApiResponse<Void>> createChildProfile(
            @AuthenticationPrincipal UserPrincipal usertPrincipal,
            @RequestBody ChildProfileCreateRequest request) {

        childService.createChildProfile(usertPrincipal.getId(), request);

        return ApiResponse.success(HttpStatus.OK);
    }

    // 아이 프로필 조회
    @GetMapping("/{childId}")
    public ResponseEntity<ApiResponse<ChildInfoResponse>> findChildInfo(
            @PathVariable Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer userId = userPrincipal.getId();

        ChildInfoResponse childInfoResponse = childService.getChildInfo(userId, childId);

        return ApiResponse.success(childInfoResponse);
    }

    // 아이 프로필 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChildInfoResponse>>> findChildInfoList(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer userId = userPrincipal.getId();

        List<ChildInfoResponse> childInfoResponseList = childService.findChildInfoList(userId);

        return ApiResponse.success(childInfoResponseList);
    }

    // 아이 프로필 수정
    @PutMapping("/{childId}")
    public ResponseEntity<ApiResponse<ChildInfoResponse>> updateChildInfo(
            @PathVariable Integer childId,
            @AuthenticationPrincipal UserPrincipal parentPrincipal,
            @RequestBody ChildProfileUpdateRequest request) {

        Integer userId = parentPrincipal.getId();

        childService.updateChildProfile(userId, childId, request);

        return ApiResponse.success(HttpStatus.OK);
    }

    // 아이 프로필 삭제 (Soft delete)
    @PutMapping("/{childId}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteChildInfo(
            @PathVariable Integer childId,
            @AuthenticationPrincipal UserPrincipal parentPrincipal) {

        Integer userId = parentPrincipal.getId();

        childService.deleteChildProfile(userId, childId);

        return ApiResponse.success(HttpStatus.OK);
    }

    // 아이 프로필 사진 등록/수정/삭제
    @PutMapping("/{childId}/profile-img")
    public ResponseEntity<ApiResponse<Void>> updateChildProfileImg(
            @PathVariable Integer childId,
            @AuthenticationPrincipal UserPrincipal parentPrincipal,
            @RequestBody ChildProfileImgUpdateRequest request
    ){
        Integer userId = parentPrincipal.getId();

        childService.updateChildProfileImg(userId, childId, request);

        return ApiResponse.success(HttpStatus.OK);
    }

}
