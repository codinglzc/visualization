package com.cgcl.web.domain.entity;

import com.cgcl.common.util.JsonUtils;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.io.Serializable;

/**
 * <p>
 * TLS
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/3/29
 */
@Data
@NoArgsConstructor
@Entity
public class ThreadMemoryAccess implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增长ID
    private Long id;

    private Long motnId;

    private Integer threadId;

    private Long startTime;

    private Long endTime;

    private String accessedAddressLow;

    private String accessedAddressHigh;

    private Long dynamicRead;

    private Long dynamicWrite;

    private Long readInCache;

    private Long stridedRead;

    private Long pointerChasingRead;

    private Long randomRead;

    public ThreadMemoryAccess(Long motnId, Integer threadId, Long startTime, Long endTime, Long dynamicRead, Long dynamicWrite, Long readInCache, Long stridedRead, Long pointerChasingRead, Long randomRead) {
        this.motnId = motnId;
        this.threadId = threadId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.dynamicRead = dynamicRead;
        this.dynamicWrite = dynamicWrite;
        this.readInCache = readInCache;
        this.stridedRead = stridedRead;
        this.pointerChasingRead = pointerChasingRead;
        this.randomRead = randomRead;
    }

    public ThreadMemoryAccess(Long motnId, Integer threadId, Long startTime, Long endTime, String accessedAddressLow, String accessedAddressHigh, Long dynamicRead, Long dynamicWrite, Long readInCache, Long stridedRead, Long pointerChasingRead, Long randomRead) {
        this.motnId = motnId;
        this.threadId = threadId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.accessedAddressLow = accessedAddressLow;
        this.accessedAddressHigh = accessedAddressHigh;
        this.dynamicRead = dynamicRead;
        this.dynamicWrite = dynamicWrite;
        this.readInCache = readInCache;
        this.stridedRead = stridedRead;
        this.pointerChasingRead = pointerChasingRead;
        this.randomRead = randomRead;
    }

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
