package com.cgcl.web.service.impl;

import com.cgcl.web.domain.entity.TimelineNode;
import com.cgcl.web.repository.TimelineNodeRepository;
import com.cgcl.web.service.TimelineNodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
@Service
public class TimelineNodeServiceImpl implements TimelineNodeService {

    private final TimelineNodeRepository timelineNodeRepo;

    @Autowired
    public TimelineNodeServiceImpl(TimelineNodeRepository timelineNodeRepo) {
        this.timelineNodeRepo = timelineNodeRepo;
    }

    @Override
    public void postSelective(TimelineNode timelineNode) {
        timelineNodeRepo.save(timelineNode);
    }

    @Override
    public List<TimelineNode> getListByExpId(Long expId) {
        TimelineNode timelineNode = new TimelineNode();
        timelineNode.setExpId(expId);
        Example<TimelineNode> example = Example.of(timelineNode);
        Sort sort = new Sort(Sort.Direction.ASC, "time");
        return timelineNodeRepo.findAll(example, sort);
    }

    @Override
    public TimelineNode getById(Long id) {
        return timelineNodeRepo.findById(id).orElse(null);
    }
}
