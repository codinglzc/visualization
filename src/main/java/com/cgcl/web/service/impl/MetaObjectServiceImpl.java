package com.cgcl.web.service.impl;

import com.cgcl.web.domain.entity.MetaObject;
import com.cgcl.web.repository.MetaObjectRepository;
import com.cgcl.web.service.MetaObjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
public class MetaObjectServiceImpl implements MetaObjectService {

    private final MetaObjectRepository metaObjectRepo;

    @Autowired
    public MetaObjectServiceImpl(MetaObjectRepository metaObjectRepo) {
        this.metaObjectRepo = metaObjectRepo;
    }

    @Override
    public void postSelective(MetaObject metaObject) {
        metaObjectRepo.save(metaObject);
    }

    @Override
    public void putByIdSelective(MetaObject metaObject) {
        metaObjectRepo.save(metaObject);
    }

    @Override
    public MetaObject getById(Long id) {
        return metaObjectRepo.findById(id).orElse(null);
    }

    @Override
    public List<MetaObject> getListByIds(String[] metaObjIds) {
        List<Long> list = new ArrayList<>();
        for (String s : metaObjIds) {
            list.add(Long.valueOf(s));
        }
        return metaObjectRepo.findAllById(list);
    }

    @Override
    public List<MetaObject> getListByExpId(Long expId) {
        return metaObjectRepo.findAllByExpId(expId);
    }

    @Override
    public Long countByExpId(Long expId) {
        return metaObjectRepo.countByExpId(expId);
    }
}
