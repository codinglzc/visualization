package com.cgcl.web.repository;

import com.cgcl.web.domain.entity.Motn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface MotnRepository extends JpaRepository<Motn, Long> {

    List<Motn> findAllByTimelineNodeIdIn(List<Long> timelineNodeIds);

    List<Motn> findAllByMetaObjectId(Long metaObjectId);
}
