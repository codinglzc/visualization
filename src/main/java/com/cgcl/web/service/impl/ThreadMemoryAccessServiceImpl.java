package com.cgcl.web.service.impl;

import com.cgcl.web.domain.entity.ThreadMemoryAccess;
import com.cgcl.web.repository.ThreadMemoryAccessRepository;
import com.cgcl.web.service.ThreadMemoryAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
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
    @PersistenceContext
    protected EntityManager em;

    @Autowired
    public ThreadMemoryAccessServiceImpl(ThreadMemoryAccessRepository threadMemoryAccessRepo) {
        this.threadMemoryAccessRepo = threadMemoryAccessRepo;
    }

    @Override
    @Transactional
    public void postBatchSelective(List<ThreadMemoryAccess> threadMemoryAccessList) {
//        threadMemoryAccessRepo.saveAll(threadMemoryAccessList);
        try {
            for (int i = 0; i < threadMemoryAccessList.size(); i++) {
                em.persist(threadMemoryAccessList.get(i));
                if (i % 100 == 0) {//一次一百条插入
                    em.flush();
                    em.clear();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<ThreadMemoryAccess> getListByMotnId(Long motnId) {
        return threadMemoryAccessRepo.findAllByMotnId(motnId);
    }
}
