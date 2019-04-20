package com.cgcl.common.util;

import com.jcraft.jsch.UserInfo;
import lombok.extern.slf4j.Slf4j;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/15
 */
@Slf4j
public class MyUserInfo implements UserInfo {
    @Override
    public String getPassphrase() {
        log.info("MyUserInfo.getPassphrase()");
        return null;
    }

    @Override
    public String getPassword() {
        log.info("MyUserInfo.getPassword()");
        return null;
    }

    @Override
    public boolean promptPassword(String s) {
        log.info("MyUserInfo.promptPassword(): " + s);
        return false;
    }

    @Override
    public boolean promptPassphrase(String s) {
        log.info("MyUserInfo.promptPassphrase(): " + s);
        return false;
    }

    @Override
    public boolean promptYesNo(String s) {
        log.info("MyUserInfo.promptYesNo(): " + s);
        return s.contains("The authenticity of host");
    }

    @Override
    public void showMessage(String s) {
        log.info("MyUserInfo.showMessage(): " + s);
    }
}
