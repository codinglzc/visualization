package com.cgcl.web.domain.entity;

import com.cgcl.common.util.JsonUtils;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.io.Serializable;

/**
 * <p>
 * 内存分配/释放函数
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/3/29
 */
@Data
@NoArgsConstructor
@Entity
public class AllocFreeFunction implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;

    @NotNull
    private Integer argIdItemSize;

    @NotNull
    private Integer argIdItemNum;

    @NotNull
    private Integer argIdPtrIndex;

    @NotNull
    private Boolean isInternal;

    @NotNull
    private String type;

    public AllocFreeFunction(@NotNull String name, @NotNull Integer argIdItemSize, @NotNull Integer argIdItemNum,
                             @NotNull Integer argIdPtrIndex, @NotNull Boolean isInternal, @NotNull String type) {
        this.name = name;
        this.argIdItemSize = argIdItemSize;
        this.argIdItemNum = argIdItemNum;
        this.argIdPtrIndex = argIdPtrIndex;
        this.isInternal = isInternal;
        this.type = type;
    }

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
