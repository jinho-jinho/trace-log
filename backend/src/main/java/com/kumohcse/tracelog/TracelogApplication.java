package com.kumohcse.tracelog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TracelogApplication {

	public static void main(String[] args) {
		SpringApplication.run(TracelogApplication.class, args);
	}

}
