package com.cgcl.common.componet;

import com.cgcl.common.util.JsonUtils;
import com.cgcl.common.util.MyUserInfo;
import com.cgcl.web.domain.entity.SshProperty;
import com.jcraft.jsch.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 * 远程ssh连接linux服务器
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/15
 */
//@Component
@Slf4j
public class Shell {

    private SshProperty sshProperty;

    public Shell(SshProperty sshProperty) {
        this.sshProperty = sshProperty;
    }

    private Session session;

    /**
     * 执行 shell 命令
     *
     * @param command shell 命令
     * @return ShellResult
     */
    public ShellResult execute(String command) {
        int returnCode = 0;
        List<String> stdout = new ArrayList<>();
        ChannelExec channelExec;

        try {
            // 打开通道，设置通道类型
            channelExec = (ChannelExec) session.openChannel("exec");
            channelExec.setCommand(command);

            channelExec.setInputStream(null);

            BufferedReader input = new BufferedReader(new InputStreamReader(channelExec.getInputStream()));

            channelExec.connect();
            log.info("执行 Shell 命令：" + command);

            // 接收远程服务器执行命令的结果
            String line;
            while ((line = input.readLine()) != null) {
                stdout.add(line);
            }
            input.close();

            // 得到returnCode
            if (channelExec.isClosed()) {
                returnCode = channelExec.getExitStatus();
            }

            // 关闭通道
            channelExec.disconnect();

        } catch (JSchException | IOException e) {
            e.printStackTrace();
        }

        log.info(new ShellResult(returnCode, stdout).toString());
        return new ShellResult(returnCode, stdout);
    }

    /**
     * 将输入流src的内容，上传到服务器中。
     *
     * @param src 需要传输的输入流
     * @param dst 服务器地址，必须是文件名
     * @throws JSchException
     * @throws SftpException
     */
    public void sftp(InputStream src, String dst) throws JSchException, SftpException {
        ChannelSftp channel = (ChannelSftp) session.openChannel("sftp"); // 打开SFTP通道
        channel.connect();
        log.info("已经成功建立sftp连接！");
        channel.put(src, dst);
        channel.quit();
    }

    public void myInit() throws JSchException {
        JSch jSch = new JSch();
        MyUserInfo userInfo = new MyUserInfo();

        // 创建session并且打开连接，因为创建session之后要主动打开连接
        session = jSch.getSession(sshProperty.getUsername(), sshProperty.getIp(), sshProperty.getPort());
        session.setPassword(sshProperty.getPassword());
        session.setUserInfo(userInfo);
        session.connect();
    }

    public void myDestory() {
        // 关闭session
        session.disconnect();
    }

    // 每当重新设置SshProperty，都需要重新初始化
    public void setSshProperty(SshProperty sshProperty) throws JSchException {
        this.sshProperty = sshProperty;
        myInit();
    }

    public SshProperty getSshProperty() {
        return sshProperty;
    }

    @Data
    @AllArgsConstructor
    public static class ShellResult {
        private int code;
        private List<String> stdout;

        @Override
        public String toString() {
            return JsonUtils.toJson(this);
        }
    }

}
