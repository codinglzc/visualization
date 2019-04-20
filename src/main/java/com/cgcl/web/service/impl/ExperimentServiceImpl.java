package com.cgcl.web.service.impl;

import com.cgcl.web.domain.entity.*;
import com.cgcl.web.repository.*;
import com.cgcl.web.service.ExperimentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
@Service
public class ExperimentServiceImpl implements ExperimentService {

    private final ExperimentRepository experimentRepo;
    private final MetaObjectRepository metaObjectRepo;
    private final TimelineNodeRepository timelineNodeRepo;
    private final GlobalVarsRepository globalVarsRepo;
    private final MotnRepository motnRepository;
    private final ThreadMemoryAccessRepository tmaRepo;

    @Autowired
    public ExperimentServiceImpl(ExperimentRepository experimentRepo, MetaObjectRepository metaObjectRepo, TimelineNodeRepository timelineNodeRepo, GlobalVarsRepository globalVarsRepo, MotnRepository motnRepository, ThreadMemoryAccessRepository tmaRepo) {
        this.experimentRepo = experimentRepo;
        this.metaObjectRepo = metaObjectRepo;
        this.timelineNodeRepo = timelineNodeRepo;
        this.globalVarsRepo = globalVarsRepo;
        this.motnRepository = motnRepository;
        this.tmaRepo = tmaRepo;
    }

    @Override
    public Page<Experiment> findAllByPageable(Pageable pageable) {
        return experimentRepo.findAll(pageable);
    }

    @Override
    public Experiment getById(Long id) {
        Optional<Experiment> optional = experimentRepo.findById(id);
        return optional.orElse(null);
    }

    @Override
    public void putDescByIdSelective(Experiment experiment) {
        Experiment e = experimentRepo.findById(experiment.getId()).orElse(null);
        if (e == null) return;
        e.setDescription(experiment.getDescription());
        experimentRepo.save(e);
    }

    @Override
    public void deleteById(Long expId) {
        List<MetaObject> metaObjects = metaObjectRepo.findAllByExpId(expId);
        List<TimelineNode> timelineNodes = timelineNodeRepo.findAllByExpId(expId);
        List<Long> timelineNodeIds = new ArrayList<>();
        timelineNodes.forEach(t -> timelineNodeIds.add(t.getId()));
        List<GlobalVars> globalVars = globalVarsRepo.findAllByTimelineNodeIdIn(timelineNodeIds);
        List<Motn> motns = motnRepository.findAllByTimelineNodeIdIn(timelineNodeIds);
        List<Long> motnIds = new ArrayList<>();
        motns.forEach(m -> motnIds.add(m.getId()));

        if (motnIds.size() > 0)
            tmaRepo.deleteBatchByMotnIdsIn(motnIds);
        if (motns.size() > 0)
            motnRepository.deleteInBatch(motns);
        if (globalVars.size() > 0)
        globalVarsRepo.deleteInBatch(globalVars);
        if (timelineNodes.size() > 0)
        timelineNodeRepo.deleteInBatch(timelineNodes);
        if (metaObjects.size() > 0)
        metaObjectRepo.deleteInBatch(metaObjects);
        experimentRepo.deleteById(expId);
    }

    @Override
    public void postSelective(Experiment exp) {
        experimentRepo.save(exp);
    }

    @Override
    public void putConsumeTimeById(long expId, long time) {
        Experiment exp = experimentRepo.findById(expId).orElse(null);
        if (exp == null) return;
        exp.setConsumeTime(time);
        experimentRepo.save(exp);
    }

}
