package com.cgcl.web.service;

import com.cgcl.web.domain.entity.AllocFreeFunction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface AllocFreeFunctionService {
    List<AllocFreeFunction> getAll();

    Page<AllocFreeFunction> findAllByPageable(Pageable pageable);

    void deleteByNames(List<String> names);

    boolean add(AllocFreeFunction function);

    boolean update(AllocFreeFunction function);

    void deleteByIds(List<Long> asList);

    List<AllocFreeFunction>  findAllByIds(List<Long> ids);
}
