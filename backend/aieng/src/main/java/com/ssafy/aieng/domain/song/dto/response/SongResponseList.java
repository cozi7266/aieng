package com.ssafy.aieng.domain.song.dto.response;

import com.ssafy.aieng.domain.song.entity.Song;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongResponseList {

    private Integer childId;
    List<SongResponse> songResponseList;

    public static SongResponseList of(Integer childId, List<Song> songs) {
        List<SongResponse> responses = songs.stream()
                .map(SongResponse::of)
                .toList();

        return SongResponseList.builder()
                .childId(childId)
                .songResponseList(responses)
                .build();
    }
}
