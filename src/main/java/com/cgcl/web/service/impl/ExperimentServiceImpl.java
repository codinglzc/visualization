package com.cgcl.web.service.impl;

import com.cgcl.web.domain.entity.Experiment;
import com.cgcl.web.repository.ExperimentRepository;
import com.cgcl.web.service.ExperimentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

    @Autowired
    public ExperimentServiceImpl(ExperimentRepository experimentRepo) {
        this.experimentRepo = experimentRepo;
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
    public void deleteById(Long id) {
        experimentRepo.deleteById(id);
    }

    @Override
    public void postSelective(Experiment exp) {
        experimentRepo.save(exp);
    }

}
