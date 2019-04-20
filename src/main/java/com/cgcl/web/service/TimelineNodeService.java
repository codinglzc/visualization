package com.cgcl.web.service;

import com.cgcl.web.domain.entity.TimelineNode;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface TimelineNodeService {
    void postSelective(TimelineNode timelineNode);

    List<TimelineNode> getListByExpId(Long expId);

    TimelineNode getById(Long id);

    Long countByExpId(Long expId);
}
