package com.cgcl.web.domain.vo;

import com.cgcl.common.util.JsonUtils;
import com.cgcl.web.domain.entity.MetaObject;
import com.cgcl.web.domain.entity.ThreadMemoryAccess;
import com.cgcl.web.domain.entity.TimelineNode;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/4
 */
@Data
public class MotnVo implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private MetaObject metaObject;

    private TimelineNode timelineNode;

    private List<ThreadMemoryAccess> tmaList;

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
