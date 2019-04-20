package com.cgcl.common.config;

import com.cgcl.common.componet.Shell;
import com.cgcl.web.domain.entity.SshProperty;
import com.cgcl.web.repository.SshPropertyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/**
 * <p>
 * JSch 配置类
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/15
 */
@Configuration
@Slf4j
public class JSchConfig {

    private final SshPropertyRepository sshPropertyRepo;

    @Autowired
    public JSchConfig(SshPropertyRepository sshPropertyRepo) {
        this.sshPropertyRepo = sshPropertyRepo;
    }

    @Bean(initMethod = "myInit", destroyMethod = "myDestory")
    @Order
    public Shell shell() {
        SshProperty sshProperty;
        if (sshPropertyRepo.findAll().size() <= 0) {
            sshProperty = new SshProperty();
            sshProperty.setIp("222.20.79.232");
            sshProperty.setPort(50005);
            sshProperty.setUsername("lzc");
            sshProperty.setPassword("liu950302");
            sshPropertyRepo.save(sshProperty);
        } else {
            sshProperty = sshPropertyRepo.findAll().get(0);
        }
        return new Shell(sshProperty);
    }
}
