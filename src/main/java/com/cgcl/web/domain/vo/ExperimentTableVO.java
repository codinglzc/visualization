package com.cgcl.web.domain.vo;

import com.cgcl.common.util.JsonUtils;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * <p>
 * experiment.html页面的实验模态框中的表格视图
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/10
 */
@Data
public class ExperimentTableVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Date createTime;

    private String description;

    private Long consumeTime;

    private Long numOfObjs;

    private Long numOfTimeNodes;

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
