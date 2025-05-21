package com.ssafy.aieng.domain.child.entity;

import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.enums.Gender;
import com.ssafy.aieng.domain.voice.entity.Voice;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;

@Entity
@Table(name =  "child")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)

public class Child extends BaseEntity {

    @Column(length = 20, nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate birthdate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(length = 200)
    private String imgUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 단어 TTS용 목소리 (nullable)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tts_voice_id")
    private Voice ttsVoice;

    // 동요 생성용 목소리 (nullable)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_voice_id")
    private Voice songVoice;

    // 동요 생성용 기본 분위기 (nullable)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mood_id")
    private Mood mood;

    // 아이 프로필 수정
    public void updateChildProfile(String name, Gender gender, LocalDate birthdate, String imgUrl) {
        this.name = name;
        this.gender = gender;
        this.birthdate = birthdate;
        this.imgUrl = imgUrl;
    }

    // 아이 프로필 삭제 (Soft Delete)
    public void deleteChildProfile() {
        this.softDelete();
    }

    public void setImgUrl(String newImg) {
        this.imgUrl = newImg;
    }

    public void setTtsVoice(Voice ttsVoice) {
        this.ttsVoice = ttsVoice;
    }

    public void setSongVoice(Voice songVoice) {
        this.songVoice = songVoice;
    }

    public void setMood(Mood mood) {
        this.mood = mood;
    }
}