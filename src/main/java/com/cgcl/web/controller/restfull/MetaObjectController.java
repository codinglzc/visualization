package com.cgcl.web.controller.restfull;

import com.cgcl.common.util.Message;
import com.cgcl.web.domain.entity.MetaObject;
import com.cgcl.web.domain.entity.Motn;
import com.cgcl.web.domain.entity.ThreadMemoryAccess;
import com.cgcl.web.domain.vo.MetaObjectWithAggregateInfo;
import com.cgcl.web.service.MetaObjectService;
import com.cgcl.web.service.MotnService;
import com.cgcl.web.service.ThreadMemoryAccessService;
import com.cgcl.web.service.TimelineNodeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.*;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/2
 */
@Slf4j
@RestController
@RequestMapping("/metaObj")
public class MetaObjectController {
    @Resource
    private MetaObjectService metaObjectService;
    @Resource
    private MotnService motnService;
    @Resource
    private TimelineNodeService timelineNodeService;
    @Resource
    private ThreadMemoryAccessService tmaService;

    @RequestMapping(value = "/byExpId", method = RequestMethod.GET)
    public Message getMetaObjsByExpId(@RequestParam(value = "expId") Long expId) {
        List<MetaObject> metaObjects = metaObjectService.getListByExpId(expId);
        metaObjects.sort(Comparator.comparing(MetaObject::getVarName));
        return Message.success().add("list", metaObjects);
    }

    @GetMapping("/countByExpId")
    public Message countByExpId(Long expId) {
        log.info("GET:metaObj/countByExpId?expId=" + expId);
        Long count = metaObjectService.countByExpId(expId);
        return Message.success().add("count", count);
    }

    @GetMapping("/getMetaObjsWithAggregateInfoByIds")
    public Message getMetaObjsWithAggregateInfoByIds(@RequestParam("ids") String ids) {
        log.info("GET:metaObj/getMetaObjsWithAggregateInfoByIds?expId=" + ids);
        Map<String, List<MetaObjectWithAggregateInfo>> rs = new HashMap<>();
        List<MetaObject> metaObjects = metaObjectService.getListByIds(ids.split(","));
        metaObjects.forEach(meta -> {
            List<MetaObjectWithAggregateInfo> metaObjectWithAggregateInfos = new ArrayList<>();
            List<Motn> motns = motnService.getListByMetaObjectId(meta.getId());
            motns.forEach(motn -> {
                long time = timelineNodeService.getById(motn.getTimelineNodeId()).getTime();
                List<ThreadMemoryAccess> tmas = tmaService.getListByMotnId(motn.getId());
                MetaObjectWithAggregateInfo metaObjectWithAggregateInfo = MetaObjectWithAggregateInfo.createInstance(
                        meta.getId(), meta.getVarName(), time, tmas);
                metaObjectWithAggregateInfos.add(metaObjectWithAggregateInfo);
            });
            metaObjectWithAggregateInfos.sort((m1, m2) -> m1.getTime() < m2.getTime() ? -1 : 1);
            rs.put(meta.getVarName().trim() + "#" + meta.getId(), metaObjectWithAggregateInfos);
        });
        return Message.success().add("map", rs);
    }
}
