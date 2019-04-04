package com.cgcl.web.service.impl;

import com.cgcl.web.domain.entity.GlobalVars;
import com.cgcl.web.repository.GlobalVarsRepository;
import com.cgcl.web.service.GlobalVarsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
@Service
public class GlobalVarsServiceImpl implements GlobalVarsService {

    private final GlobalVarsRepository globalVarsRepo;

    @Autowired
    public GlobalVarsServiceImpl(GlobalVarsRepository globalVarsRepo) {
        this.globalVarsRepo = globalVarsRepo;
    }

    @Override
    public void postSelective(GlobalVars gv) {
        globalVarsRepo.save(gv);
    }

    @Override
    public GlobalVars getByTimelineNodeId(Long timelineNodeId) {
        return globalVarsRepo.findGlobalVarsByTimelineNodeId(timelineNodeId);
    }
}
