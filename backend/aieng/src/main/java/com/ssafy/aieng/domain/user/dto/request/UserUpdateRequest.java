package com.ssafy.aieng.domain.user.dto.request;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    private String nickname;
    private String gender; // "M", "F", "O"
    private String birthdate;
    private AddressDto address;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDto {
        private String zipcode;
        private String roadAddress;
        private String oldAddress;
    }
}
