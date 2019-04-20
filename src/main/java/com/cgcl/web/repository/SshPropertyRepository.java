package com.cgcl.web.repository;

import com.cgcl.web.domain.entity.AllocFreeFunction;
import com.cgcl.web.domain.entity.SshProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
public interface SshPropertyRepository extends JpaRepository<SshProperty, Long> {

}
