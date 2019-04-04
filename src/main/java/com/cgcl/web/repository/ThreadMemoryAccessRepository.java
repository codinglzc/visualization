package com.cgcl.web.repository;

import com.cgcl.web.domain.entity.ThreadMemoryAccess;
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
public interface ThreadMemoryAccessRepository extends JpaRepository<ThreadMemoryAccess, Long> {

    List<ThreadMemoryAccess> findAllByMotnId(Long motnId);
}
