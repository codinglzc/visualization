package com.cgcl.web.repository;

import com.cgcl.web.domain.entity.MetaObject;
import com.cgcl.web.domain.entity.TimelineNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface TimelineNodeRepository extends JpaRepository<TimelineNode, Long> {

    Long countByExpId(Long expId);

    List<TimelineNode> findAllByExpId(Long expId);
}
