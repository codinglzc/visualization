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
 * MetaObject 和 TimelineNode 共同决定一个 Motn
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
@Data
@NoArgsConstructor
@Entity
public class Motn implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增长ID
    private Long id;

    private Long metaObjectId;

    private Long timelineNodeId;

    public Motn(Long metaObjectId, Long timelineNodeId) {
        this.metaObjectId = metaObjectId;
        this.timelineNodeId = timelineNodeId;
    }

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
