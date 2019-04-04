package com.cgcl.web.service;

import com.cgcl.web.domain.entity.Motn;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface MotnService {
    void postSelective(Motn motn);

    List<Motn> getListByTimelineNodeId(Long timelineNodeId);
}
