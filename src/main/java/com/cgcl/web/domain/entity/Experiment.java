package com.cgcl.web.domain.entity;

import com.cgcl.common.util.JsonUtils;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Date;

/**
 * <p>
 * 实验
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/3/29
 */
@Data
@NoArgsConstructor
@Entity
public class Experiment implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增长ID
    private Long id;

    @NotNull
    private Date createTime;

    private String description;

    @NotNull
    private Long consumeTime;

    public Experiment(Long id, String description) {
        this.id = id;
        this.description = description;
    }

    public Experiment(Long id, @NotNull Long consumeTime) {
        this.id = id;
        this.consumeTime = consumeTime;
    }

    public Experiment(@NotNull Date createTime, String description, @NotNull Long consumeTime) {
        this.createTime = createTime;
        this.description = description;
        this.consumeTime = consumeTime;
    }

    public static String getDbColumn(String col) {
        switch (col) {
            case "id":
                return "id";
            case "createTime":
                return "create_time";
            case "description":
                return "description";
            case "consumeTime":
                return "consume_time";
            default:
                return "create_time";
        }
    }

    // 保证在持久化之前，对 createTime 进行时间赋值
    @PrePersist
    void createTime() {
        this.createTime = new Date();
    }

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
