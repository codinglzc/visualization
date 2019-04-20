package com.cgcl.web.controller.view;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/3
 */
@Slf4j
@Controller
public class PageController {

    @GetMapping({"/", "/home"})
    public String home() {
        return "home";
    }

    @GetMapping("/settings")
    public String settings() {
        return "settings";
    }

    @GetMapping("/bootstrap")
    public String bootstrap() {
        return "bootstrap";
    }

    @GetMapping("/realtime")
    public String realtime() {
        return "realtime";
    }

    @GetMapping("/experiment")
    public String experiment() {
        return "experiment";
    }

    @GetMapping("/blank_page")
    public String blankPage() {
        return "layout_blank_page";
    }

}
