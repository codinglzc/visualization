package com.cgcl.common.componet;

import com.cgcl.web.domain.entity.AllocFreeFunction;
import com.cgcl.web.repository.AllocFreeFunctionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * <p>
 * 初始化内存分配/释放函数
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
@Component
@Order(1)
public class InitAllocFunctionData implements ApplicationRunner {

    private final AllocFreeFunctionRepository allocFunctionRepo;

    @Autowired
    public InitAllocFunctionData(AllocFreeFunctionRepository allocFunctionRepo) {
        this.allocFunctionRepo = allocFunctionRepo;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {

        // 内存分配函数
        if (allocFunctionRepo.findByNameEquals("malloc") == null)
            allocFunctionRepo.save(new AllocFreeFunction("malloc", -1, 0, -1, false, "alloc"));
        if (allocFunctionRepo.findByNameEquals("calloc") == null)
            allocFunctionRepo.save(new AllocFreeFunction("calloc", 0, 1, -1, false, "alloc"));
        if (allocFunctionRepo.findByNameEquals("realloc") == null)
            allocFunctionRepo.save(new AllocFreeFunction("realloc", -1, 1, -1, false, "alloc"));
        if (allocFunctionRepo.findByNameEquals("valloc") == null)
            allocFunctionRepo.save(new AllocFreeFunction("valloc", -1, 0, -1, false, "alloc"));
        if (allocFunctionRepo.findByNameEquals("pvalloc") == null)
            allocFunctionRepo.save(new AllocFreeFunction("pvalloc", -1, 0, -1, false, "alloc"));
        if (allocFunctionRepo.findByNameEquals("hme_alloc_dram") == null)
            allocFunctionRepo.save(new AllocFreeFunction("hme_alloc_dram", -1, 0, -1, false, "alloc"));
        if (allocFunctionRepo.findByNameEquals("hme_alloc_nvm") == null)
            allocFunctionRepo.save(new AllocFreeFunction("hme_alloc_nvm", -1, 0, -1, false, "alloc"));

        // 内存释放函数
        if (allocFunctionRepo.findByNameEquals("free") == null)
            allocFunctionRepo.save(new AllocFreeFunction("free", -1, -1, 0, false, "free"));
        if (allocFunctionRepo.findByNameEquals("hme_free") == null)
            allocFunctionRepo.save(new AllocFreeFunction("hme_free", -1, -1, 0, false, "free"));

    }
}
