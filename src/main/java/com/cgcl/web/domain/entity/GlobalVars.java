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
 * 全局变量
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/3/29
 */
@Entity
@Data
@NoArgsConstructor
public class GlobalVars implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增长ID
    private Long id;

    private Long timelineNodeId;

    private Long globalInstrumentCount;

    private Long dynamicReadInstrument;

    private Long dynamicWriteInstrument;

    private Long staticReadInstrument;

    private Long staticWriteInstrument;

    private Long imgAddressLow;

    private Long imgAddressHigh;

    public GlobalVars(Long timelineNodeId, Long globalInstrumentCount, Long dynamicReadInstrument,
                      Long dynamicWriteInstrument, Long staticReadInstrument, Long staticWriteInstrument) {
        this.timelineNodeId = timelineNodeId;
        this.globalInstrumentCount = globalInstrumentCount;
        this.dynamicReadInstrument = dynamicReadInstrument;
        this.dynamicWriteInstrument = dynamicWriteInstrument;
        this.staticReadInstrument = staticReadInstrument;
        this.staticWriteInstrument = staticWriteInstrument;
    }

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
