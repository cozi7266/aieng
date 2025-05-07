package com.ssafy.aieng;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class AiengApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiengApplication.class, args);
    }

}
