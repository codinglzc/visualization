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
 * 时间轴节点
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/3/29
 */
@Data
@NoArgsConstructor
@Entity
public class TimelineNode implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增长ID
    private Long id;

    private Long expId;

    private Long time;

    public TimelineNode(Long expId, Long time) {
        this.expId = expId;
        this.time = time;
    }

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
