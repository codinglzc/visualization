package com.cgcl.web.repository;

import com.cgcl.web.domain.entity.ThreadMemoryAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

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

    // 注意更新和删除是需要加事务的， 并且要加上 @Modify的注解
    @Modifying
    @Transactional
    @Query("delete from ThreadMemoryAccess t where t.motnId in (?1)")
    void deleteBatchByMotnIdsIn(List<Long> motnIds);
}
