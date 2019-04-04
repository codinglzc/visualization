package com.cgcl.web.controller.restfull;

import com.cgcl.common.componet.AppProps;
import com.cgcl.common.util.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/3
 */
@Slf4j
@RestController
@RequestMapping("/properties")
public class ConfigurationPropertiesController {

    private final AppProps appProps;

    @Autowired
    public ConfigurationPropertiesController(AppProps appProps) {
        this.appProps = appProps;
    }

    @RequestMapping("/gateoneUrl")
    public Message getGateoneUrl() {
        log.info("GET: /properties/gateoneUrl");
        return Message.success().add("gateoneUrl", appProps.getGateoneUrl());
    }
}
