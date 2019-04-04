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
 * 内存对象
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/3/29
 */
@Data
@NoArgsConstructor
@Entity
public class MetaObject implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增长ID
    private Long id;

    private Long expId;

    private Integer objId; // 该字段不入库

    private String startAddress;

    private String endAddress;

    private Long size;

    private String ip;

    private String sourceCodeInfo;

    private String varName;

    private Integer creatorThreadId;

    private String allocFunc;

    private String allocType;

    private Long startTime;

    private Long endTime;

    private Long startInstruction;

    private Long endInstruction;

    private Long startMemoryInstruction;

    private Long endMemoryInstruction;

    public MetaObject(Long expId, Integer objId, String startAddress, String endAddress, Long size, String ip, String sourceCodeInfo, String varName, Integer creatorThreadId, String allocFunc, String allocType, Long startTime, Long startInstruction, Long startMemoryInstruction) {
        this.expId = expId;
        this.objId = objId;
        this.startAddress = startAddress;
        this.endAddress = endAddress;
        this.size = size;
        this.ip = ip;
        this.sourceCodeInfo = sourceCodeInfo;
        this.varName = varName;
        this.creatorThreadId = creatorThreadId;
        this.allocFunc = allocFunc;
        this.allocType = allocType;
        this.startTime = startTime;
        this.startInstruction = startInstruction;
        this.startMemoryInstruction = startMemoryInstruction;
    }

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
