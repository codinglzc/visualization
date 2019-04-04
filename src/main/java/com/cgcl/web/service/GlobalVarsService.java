package com.cgcl.web.service;

import com.cgcl.web.domain.entity.GlobalVars;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface GlobalVarsService {
    void postSelective(GlobalVars gv);

    GlobalVars getByTimelineNodeId(Long timelineNodeId);
}
