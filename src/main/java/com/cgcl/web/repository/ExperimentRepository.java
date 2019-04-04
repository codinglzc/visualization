package com.cgcl.web.repository;

import com.cgcl.web.domain.entity.Experiment;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface ExperimentRepository extends JpaRepository<Experiment, Long> {
}
