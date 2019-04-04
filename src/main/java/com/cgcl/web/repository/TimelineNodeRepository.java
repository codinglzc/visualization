package com.cgcl.web.repository;

import com.cgcl.web.domain.entity.TimelineNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface TimelineNodeRepository extends JpaRepository<TimelineNode, Long> {
}
