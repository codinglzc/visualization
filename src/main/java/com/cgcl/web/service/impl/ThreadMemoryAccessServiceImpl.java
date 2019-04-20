package com.cgcl.web.service.impl;

import com.cgcl.web.domain.entity.ThreadMemoryAccess;
import com.cgcl.web.repository.ThreadMemoryAccessRepository;
import com.cgcl.web.service.ThreadMemoryAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
@Service
public class ThreadMemoryAccessServiceImpl implements ThreadMemoryAccessService {

    private final ThreadMemoryAccessRepository threadMemoryAccessRepo;

    @Autowired
    public ThreadMemoryAccessServiceImpl(ThreadMemoryAccessRepository threadMemoryAccessRepo) {
        this.threadMemoryAccessRepo = threadMemoryAccessRepo;
    }

    @Override
    public void postBatchSelective(List<ThreadMemoryAccess> threadMemoryAccessList) {
        threadMemoryAccessRepo.saveAll(threadMemoryAccessList);
    }

    @Override
    public List<ThreadMemoryAccess> getListByMotnId(Long motnId) {
        return threadMemoryAccessRepo.findAllByMotnId(motnId);
    }
}
