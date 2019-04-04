package com.cgcl.web.service;

import com.cgcl.web.domain.entity.ThreadMemoryAccess;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface ThreadMemoryAccessService {
    void postBatchSelective(List<ThreadMemoryAccess> threadMemoryAccessList);

    List<ThreadMemoryAccess> getListByMotnId(Long id);
}
