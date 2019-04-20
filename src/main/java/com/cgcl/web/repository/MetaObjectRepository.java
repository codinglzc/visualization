package com.cgcl.web.repository;

import com.cgcl.web.domain.entity.MetaObject;
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
public interface MetaObjectRepository extends JpaRepository<MetaObject, Long> {

    Long countByExpId(Long expId);

    List<MetaObject> findAllByExpId(Long expId);
}
