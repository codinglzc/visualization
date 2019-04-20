package com.cgcl.web.controller.restfull;

import com.cgcl.common.util.Message;
import com.cgcl.web.domain.entity.TimelineNode;
import com.cgcl.web.service.MetaObjectService;
import com.cgcl.web.service.MotnService;
import com.cgcl.web.service.TimelineNodeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

/**
 * <p>
 * 处理和"时间轴显示内存对象的访存行为"有关的请求
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/2
 */
@Slf4j
@RestController
@RequestMapping("/timeline")
public class TimelineController {

    @Resource
    private TimelineNodeService timelineNodeService;

    @GetMapping(value = "/getAllByExpId")
    public Message getTimelineNodesByExpId(@RequestParam("expId") Long expId) {
        log.info("GET:timeline/getAllByExpId?expId=" + expId);
        List<TimelineNode> timelineNodeList = timelineNodeService.getListByExpId(expId);
        return Message.success().add("list", timelineNodeList);
    }

    @GetMapping(value = "/getById")
    public Message getTimelineNodeById(@RequestParam("id") Long id) {
        log.info("GET:timeline/getById?id=" + id);
        TimelineNode timelineNode = timelineNodeService.getById(id);
        return Message.success().add("timelineNode", timelineNode);
    }

    @GetMapping(value = "/countByExpId")
    public Message countByExpId(@RequestParam("expId") Long expId) {
        log.info("GET:timeline/countByExpId?expId=" + expId);
        Long count = timelineNodeService.countByExpId(expId);
        return Message.success().add("count", count);
    }
}
