package com.aism.aishoppingmall;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.aism.aishoppingmall")
public class AiShoppingMallApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiShoppingMallApplication.class, args);
    }
}
