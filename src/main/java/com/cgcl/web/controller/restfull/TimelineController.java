package com.cgcl.web.controller.restfull;

import com.cgcl.common.util.Message;
import com.cgcl.web.domain.entity.TimelineNode;
import com.cgcl.web.service.MetaObjectService;
import com.cgcl.web.service.MotnService;
import com.cgcl.web.service.TimelineNodeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

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
@Controller
@RequestMapping("/timeline")
public class TimelineController {

    @Resource
    private MetaObjectService metaObjectService;

    @Resource
    private TimelineNodeService timelineNodeService;

    @Resource
    private MotnService motnService;

    @RequestMapping(value = "/getAllByExpId", method = RequestMethod.GET)
    @ResponseBody
    public Message getTimelineNodesByExpId(@RequestParam("expId") Long expId) {
        log.info("GET:timeline/getAllByExpId?expId=" + expId);
        List<TimelineNode> timelineNodeList = timelineNodeService.getListByExpId(expId);
        return Message.success().add("list", timelineNodeList);
    }

    @RequestMapping(value = "/getById", method = RequestMethod.GET)
    @ResponseBody
    public Message getTimelineNodeById(@RequestParam("id") Long id) {
        log.info("GET:timeline/getById?id=" + id);
        TimelineNode timelineNode = timelineNodeService.getById(id);
        return Message.success().add("timelineNode", timelineNode);
    }
}
