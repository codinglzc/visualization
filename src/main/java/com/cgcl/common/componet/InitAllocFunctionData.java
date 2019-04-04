package com.cgcl.common.componet;

import com.cgcl.web.domain.entity.AllocFunction;
import com.cgcl.web.repository.AllocFunctionRepository;
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

    private final AllocFunctionRepository allocFunctionRepo;

    @Autowired
    public InitAllocFunctionData(AllocFunctionRepository allocFunctionRepo) {
        this.allocFunctionRepo = allocFunctionRepo;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {

        // 内存分配函数
        AllocFunction a1 = new AllocFunction("malloc", -1, 0, -1, false);
        allocFunctionRepo.save(a1);
        allocFunctionRepo.save(new AllocFunction("calloc", 0, 1, -1, false));
        allocFunctionRepo.save(new AllocFunction("realloc", -1, 1, -1, false));
        allocFunctionRepo.save(new AllocFunction("valloc", -1, 0, -1, false));
        allocFunctionRepo.save(new AllocFunction("pvalloc", -1, 0, -1, false));
        allocFunctionRepo.save(new AllocFunction("hme_alloc_dram", -1, 0, -1, false));
        allocFunctionRepo.save(new AllocFunction("hme_alloc_nvm", -1, 0, -1, false));

        // 内存释放函数
        allocFunctionRepo.save(new AllocFunction("free", -1, -1, 0, false));
        allocFunctionRepo.save(new AllocFunction("hme_free", -1, -1, 0, false));

    }
}
