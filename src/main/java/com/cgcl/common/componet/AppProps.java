package com.cgcl.common.componet;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/3
 */
@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProps {

    private String gateoneUrl;
}
