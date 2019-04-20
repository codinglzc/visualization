package com.cgcl.web.service.impl;

import com.cgcl.web.domain.entity.AllocFreeFunction;
import com.cgcl.web.repository.AllocFreeFunctionRepository;
import com.cgcl.web.service.AllocFreeFunctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public class AllocFreeFunctionServiceImpl implements AllocFreeFunctionService {

    private final AllocFreeFunctionRepository functionRepo;

    @Autowired
    public AllocFreeFunctionServiceImpl(AllocFreeFunctionRepository functionRepo) {
        this.functionRepo = functionRepo;
    }

    @Override
    public List<AllocFreeFunction> getAll() {
        return functionRepo.findAll();
    }

    @Override
    public Page<AllocFreeFunction> findAllByPageable(Pageable pageable) {
        return functionRepo.findAll(pageable);
    }

    @Override
    public void deleteByNames(List<String> names) {
        functionRepo.deleteByNameIn(names);
    }

    @Override
    public boolean add(AllocFreeFunction function) {
        if (functionRepo.findByNameEquals(function.getName()) != null)
            return false;
        functionRepo.save(function);
        return true;
    }

    @Override
    public boolean update(AllocFreeFunction function) {
        AllocFreeFunction f = functionRepo.findById(function.getId()).orElse(null);
        if (f == null) return false;
        f.setName(function.getName());
        f.setArgIdItemNum(function.getArgIdItemNum());
        f.setArgIdItemSize(function.getArgIdItemSize());
        f.setArgIdPtrIndex(function.getArgIdPtrIndex());
        f.setIsInternal(function.getIsInternal());
        f.setType(function.getType());
        functionRepo.save(f);
        return true;
    }

    @Override
    public void deleteByIds(List<Long> idList) {
        functionRepo.deleteByIdIn(idList);
    }

    @Override
    public List<AllocFreeFunction> findAllByIds(List<Long> ids) {
        return functionRepo.findAllByIdIn(ids);
    }
}
