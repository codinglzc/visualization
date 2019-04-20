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
 * ssh 配置内容
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/15
 */
@Data
@NoArgsConstructor
@Entity
public class SshProperty implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ip;
    private int port;
    private String username;
    private String password;

    public SshProperty(String ip, int port, String username, String password) {
        this.ip = ip;
        this.port = port;
        this.username = username;
        this.password = password;
    }

    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
