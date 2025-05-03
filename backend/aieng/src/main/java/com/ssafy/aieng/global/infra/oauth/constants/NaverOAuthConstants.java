package com.ssafy.aieng.global.infra.oauth.constants;

public class NaverOAuthConstants {

    public static class Urls {
        public static final String TOKEN = "https://nid.naver.com/oauth2.0/token";
        public static final String USER_INFO = "https://openapi.naver.com/v1/nid/me";
    }

    public static class GrantTypes {
        public static final String AUTHORIZATION_CODE = "authorization_code";
    }

    public static class Parameters {
        public static final String GRANT_TYPE = "grant_type";
        public static final String CLIENT_ID = "client_id";
        public static final String CLIENT_SECRET = "client_secret";
        public static final String REDIRECT_URI = "redirect_uri";
        public static final String CODE = "code";
        public static final String STATE = "state";
    }
}
