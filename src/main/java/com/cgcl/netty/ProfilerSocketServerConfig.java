package com.cgcl.netty;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/2
 */
@Configuration
public class ProfilerSocketServerConfig {

    @Bean(initMethod = "myInit", destroyMethod = "myDestory")
    public ProfilerSocketServerHandler profilerSocketServerHandler() {
        return new ProfilerSocketServerHandler();
    }

    @Bean
    public ProfilerSocketServerInitializer profilerSocketServerInitializer() {
        return new ProfilerSocketServerInitializer();
    }
}
