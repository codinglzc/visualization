package com.cgcl.common.config;

import com.cgcl.common.componet.AppProps;
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

    private final AppProps appProps;

    @Autowired
    public JSchConfig(SshPropertyRepository sshPropertyRepo, AppProps appProps) {
        this.sshPropertyRepo = sshPropertyRepo;
        this.appProps = appProps;
    }

    @Bean(initMethod = "myInit", destroyMethod = "myDestory")
    @Order
    public Shell shell() {
        SshProperty sshProperty = appProps.getSsh();
        if (sshPropertyRepo.findAll().size() <= 0) {
            sshPropertyRepo.save(sshProperty);
        } else {
            SshProperty oldSsh = sshPropertyRepo.findAll().get(0);
            oldSsh.setIp(sshProperty.getIp());
            oldSsh.setPort(sshProperty.getPort());
            oldSsh.setPassword(sshProperty.getPassword());
            oldSsh.setUsername(sshProperty.getUsername());
            sshPropertyRepo.save(oldSsh);
        }
        return new Shell(sshProperty);
    }
}
