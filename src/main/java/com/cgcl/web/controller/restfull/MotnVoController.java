package com.cgcl.web.controller.restfull;

import com.cgcl.common.util.Message;
import com.cgcl.web.domain.entity.Motn;
import com.cgcl.web.domain.entity.ThreadMemoryAccess;
import com.cgcl.web.domain.entity.TimelineNode;
import com.cgcl.web.domain.vo.MotnVo;
import com.cgcl.web.service.MetaObjectService;
import com.cgcl.web.service.MotnService;
import com.cgcl.web.service.ThreadMemoryAccessService;
import com.cgcl.web.service.TimelineNodeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/2
 */
@Slf4j
@Controller
@RequestMapping("/motnVO")
public class MotnVoController {
    @Resource
    private MotnService motnService;
    @Resource
    private TimelineNodeService timelineNodeService;
    @Resource
    private MetaObjectService metaObjectService;
    @Resource
    private ThreadMemoryAccessService threadMemoryAccessService;

    @RequestMapping(value = "/getListByTimelineNodeId", method = RequestMethod.GET)
    @ResponseBody
    public Message getMotlsByTimelineNodeId(@RequestParam(value = "timelineNodeId") Long timelineNodeId) {
        log.info("GET:motl/getListByTimelineNodeId?timelineNodeId=" + timelineNodeId);
        TimelineNode timelineNode = timelineNodeService.getById(timelineNodeId);
        List<Motn> motlList = motnService.getListByTimelineNodeId(timelineNodeId);
        List<MotnVo> motnVoList = new ArrayList<>();
        for(Motn motn : motlList){
            MotnVo motnVo = new MotnVo();
            motnVo.setId(motn.getId());
            motnVo.setMetaObject(metaObjectService.getById(motn.getMetaObjectId()));
            motnVo.setTimelineNode(timelineNode);
            motnVo.setTmaList(threadMemoryAccessService.getListByMotnId(motn.getId()));
            motnVoList.add(motnVo);
        }
        return Message.success().add("list", motnVoList).add("time", timelineNode.getTime());
    }
}
