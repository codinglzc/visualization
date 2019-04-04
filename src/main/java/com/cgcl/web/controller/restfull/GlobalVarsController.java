package com.cgcl.web.controller.restfull;

import com.cgcl.common.util.Message;
import com.cgcl.web.domain.entity.GlobalVars;
import com.cgcl.web.service.GlobalVarsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/4
 */
@Slf4j
@RestController
@RequestMapping("/globalVars")
public class GlobalVarsController {
    @Resource
    private GlobalVarsService globalVarsService;

    @GetMapping("/getByTimelineNodeId")
    public Message getByTimelineNodeId(@RequestParam("timelineNodeId") Long timelineNodeId) {
        GlobalVars globalVars = globalVarsService.getByTimelineNodeId(timelineNodeId);
        return Message.success().add("globalVars", globalVars);
    }
}
