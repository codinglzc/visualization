package com.cgcl.web.service;

import com.cgcl.web.domain.entity.MetaObject;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface MetaObjectService {
    void postSelective(MetaObject metaObject);

    void putByIdSelective(MetaObject metaObject);

    void postBatch(List<MetaObject> metaObjects);

    MetaObject getById(Long id);

    List<MetaObject> getListByIds(String[] metaObjIds);

    List<MetaObject> getListByExpId(Long expId);

    Long countByExpId(Long expId);
}
