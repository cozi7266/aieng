package com.ssafy.aieng.domain.voice.controller;

import com.ssafy.aieng.domain.voice.dto.request.VoiceCreateRequest;
import com.ssafy.aieng.domain.voice.dto.response.VoiceResponse;
import com.ssafy.aieng.domain.voice.service.VoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/songs/voice")
public class VoiceController {

    private final VoiceService voiceService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VoiceResponse> createVoice(
            @RequestParam("childId") Integer childId,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("audioFile") MultipartFile audioFile) {
        
        VoiceCreateRequest request = new VoiceCreateRequest();
        request.setChildId(childId);
        request.setName(name);
        request.setDescription(description);
        request.setAudioFile(audioFile);

        VoiceResponse response = voiceService.createVoice(request);
        return ResponseEntity.ok(response);
    }
} 