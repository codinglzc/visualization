package com.cgcl.web.service.impl;

import com.cgcl.web.domain.entity.Motn;
import com.cgcl.web.repository.MotnRepository;
import com.cgcl.web.service.MotnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
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
public class MotnServiceImpl implements MotnService {

    private final MotnRepository motnRepo;

    @Autowired
    public MotnServiceImpl(MotnRepository motnRepo) {
        this.motnRepo = motnRepo;
    }

    @Override
    public void postSelective(Motn motn) {
        motnRepo.save(motn);
    }

    @Override
    public List<Motn> getListByTimelineNodeId(Long timelineNodeId) {
        Motn motn = new Motn();
        motn.setTimelineNodeId(timelineNodeId);
        Example<Motn> example = Example.of(motn);
        return motnRepo.findAll(example);
    }
}
