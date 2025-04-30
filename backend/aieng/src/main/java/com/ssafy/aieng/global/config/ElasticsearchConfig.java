//package com.ssafy.aieng.global.config;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.elasticsearch.client.ClientConfiguration;
//import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;
//import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
//
//@Configuration
//@EnableElasticsearchRepositories(basePackages = "com.ssafy.booknest.domain.search.repository")
//public class ElasticsearchConfig extends ElasticsearchConfiguration {
//
//    @Value("${spring.elasticsearch.uris}")
//    private String[] esHost;
//
//    @Value("${spring.elasticsearch.username}")
//    private String elasticUsername;  // 사용자 이름 추가
//
//    @Value("${spring.elasticsearch.password}")
//    private String elasticPassword;
//
//    @Override
//    public ClientConfiguration clientConfiguration() {
//        return ClientConfiguration.builder()
//                .connectedTo(esHost)
//                .withBasicAuth(elasticUsername, elasticPassword)  // 기본 인증 추가
//                .build();
//    }
//}