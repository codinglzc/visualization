package com.cgcl.web.service;

import com.cgcl.web.domain.entity.Experiment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface ExperimentService {

    Page<Experiment> findAllByPageable(Pageable pageable);

    Experiment getById(Long id);

    void putDescByIdSelective(Experiment experiment);

    void deleteById(Long id);

    void postSelective(Experiment exp);

    void putConsumeTimeById(long expId, long time);
}
