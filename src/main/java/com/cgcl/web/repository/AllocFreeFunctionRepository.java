package com.cgcl.web.repository;

import com.cgcl.web.domain.entity.AllocFreeFunction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
public interface AllocFreeFunctionRepository extends JpaRepository<AllocFreeFunction, Long> {

    // 更新和删除数据时必须加上下面这两个注解
    @Modifying
    @Transactional
    void deleteByNameIn(List<String> names);

    @Modifying
    @Transactional
    void deleteByIdIn(List<Long> ids);

    AllocFreeFunction findByNameEquals(String name);

    List<AllocFreeFunction> findAllByIdIn(List<Long> ids);
}
