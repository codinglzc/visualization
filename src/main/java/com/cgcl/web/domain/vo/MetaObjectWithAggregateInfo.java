package com.cgcl.web.domain.vo;

import com.cgcl.common.util.JsonUtils;
import com.cgcl.web.domain.entity.ThreadMemoryAccess;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author lzc
 * @since Created in 2019/4/18
 */
@Data
public class MetaObjectWithAggregateInfo implements Serializable {

    private static final long serialVersionUID = 1L;

    private long id;

    private String varName;

    private long time;

    private long dynamicRead;

    private long dynamicWrite;

    private long readInCache;

    private long stridedRead;

    private long pointerRead;

    private long randomRead;

    // memRef = dynamicRead + dynamicWrite
    private long memRef;

    // readWriteRatio = dynamicRead * 100.0 / memRef
    private double readWriteRatio;

    // readInCacheRatio = readInCache * 100.0 / dynamicRead
    private double readInCacheRatio;

    // readNotInCache = dynamicRead - readInCache
    private long readNotInCache;

    // stridedReadRatio = stridedRead * 100.0 / readNotInCache
    private double stridedReadRatio;

    // randomReadRatio = randomRead * 100.0 / readNotInCache
    private double randomReadRatio;

    // pointReadRatio = pointerRead * 100.0 / readNotInCache
    private double pointerReadRatio;

    // 把所有线程的访存数据聚合在一起
    public static MetaObjectWithAggregateInfo createInstance(Long id, String varName, long time, List<ThreadMemoryAccess> tmas) {
        MetaObjectWithAggregateInfo m = new MetaObjectWithAggregateInfo();
        m.setId(id);
        m.setVarName(varName);
        m.setTime(time);
        for (ThreadMemoryAccess tma : tmas) {
            m.setDynamicRead(m.getDynamicWrite() + tma.getDynamicRead());
            m.setDynamicWrite(m.getDynamicWrite() + tma.getDynamicWrite());
            m.setReadInCache(m.getReadInCache() + tma.getReadInCache());
            m.setStridedRead(m.getStridedRead() + tma.getStridedRead());
            m.setPointerRead(m.getPointerRead() + tma.getPointerChasingRead());
            m.setRandomRead(m.getRandomRead() + tma.getRandomRead());
        }
        m.setRandomRead(m.getDynamicRead() - m.getReadInCache() - m.getStridedRead() - m.getPointerRead());
        m.setMemRef(m.getDynamicRead() + m.getDynamicWrite());
        if (m.getMemRef() != 0)
            m.setReadWriteRatio(m.getDynamicRead() * 100.0 / m.getMemRef());
        if (m.getDynamicRead() != 0)
            m.setReadInCacheRatio(m.getReadInCache() * 100.0 / m.getDynamicRead());
        m.setReadNotInCache(m.getDynamicRead() - m.getReadInCache());
        if (m.getReadNotInCache() != 0) {
            m.setStridedReadRatio(m.getStridedRead() * 100.0 / m.getReadNotInCache());
            m.setRandomReadRatio(m.getRandomRead() * 100.0 / m.getReadNotInCache());
            m.setPointerReadRatio(m.getPointerRead() * 100.0 / m.getReadNotInCache());
        }
        return m;
    }


    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
