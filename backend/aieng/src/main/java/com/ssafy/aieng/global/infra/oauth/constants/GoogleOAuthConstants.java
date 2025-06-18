package com.ssafy.aieng.global.infra.oauth.constants;

public class GoogleOAuthConstants {
    public static class Urls {
        public static final String TOKEN = "https://oauth2.googleapis.com/token";
        public static final String USER_INFO = "https://www.googleapis.com/userinfo/v2/me";
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
    }
}