package com.cgcl.web.controller.restfull;

import com.cgcl.common.componet.Shell;
import com.cgcl.common.util.Message;
import com.cgcl.web.domain.entity.AllocFreeFunction;
import com.cgcl.web.domain.entity.SshProperty;
import com.cgcl.web.service.AllocFreeFunctionService;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.SftpException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/15
 */
@RestController
@Slf4j
@RequestMapping("/shell")
public class ShellController {

    @Autowired
    private Shell shell;
    @Autowired
    private AllocFreeFunctionService allocFreeFunctionService;

    @PostMapping("/cmd")
    public Shell.ShellResult execCommand(@RequestParam("command") String command) {
        return shell.execute(command);
    }

    @PostMapping("/cleanProfiler")
    public Shell.ShellResult cleanProfiler() {
        return shell.execute("cd /home/lzc/Profiler && make veryclean");
    }

    @PostMapping("/runExp")
    public Message runExp(@RequestParam("command") String command,
                          @RequestParam("funcs") String funcsStr,
                          @RequestParam("pintool_base") String pintoolPath,
                          @RequestParam("script_cacheline_bits") String cachelineBits,
                          @RequestParam("script_threshold_size") String thresholdSize,
                          @RequestParam("script_socket_server_ip") String socketServerIp,
                          @RequestParam("script_socket_server_port") String socketServerPort,
                          @RequestParam("script_socket_server_interval") String socketServerInterval) throws SftpException, JSchException {
        // 先上传alloc和free配置文件
        List<Long> ids = new ArrayList<>();
        for (String s : funcsStr.split(",")) {
            ids.add(Long.parseLong(s));
        }
        List<AllocFreeFunction> functions = allocFreeFunctionService.findAllByIds(ids);
        StringBuilder allocSb = new StringBuilder();
        StringBuilder freeSb = new StringBuilder();
        for (AllocFreeFunction f : functions) {
            if (f.getType().equals("alloc")) {
                allocSb.append(f.getName())
                        .append(" ").append(f.getArgIdItemSize())
                        .append(" ").append(f.getArgIdItemNum())
                        .append(" ").append(f.getArgIdPtrIndex())
                        .append("\n");
            } else {
                freeSb.append(f.getName())
                        .append(" ").append(f.getArgIdItemSize())
                        .append(" ").append(f.getArgIdItemNum())
                        .append(" ").append(f.getArgIdPtrIndex())
                        .append("\n");
            }
        }
        shell.sftp(new ByteArrayInputStream(allocSb.toString().getBytes()), pintoolPath + "/conf/alloc_func.conf");
        shell.sftp(new ByteArrayInputStream(freeSb.toString().getBytes()), pintoolPath + "/conf/free_func.conf");
        String scriptParams = "cacheline_bits" + " " + cachelineBits +
                "\n" + "threshold_size" + " " + thresholdSize +
                "\n" + "socket_server_ip" + " " + socketServerIp +
                "\n" + "socket_server_port" + " " + socketServerPort +
                "\n" + "socket_server_interval" + " " + socketServerInterval;
        shell.sftp(new ByteArrayInputStream(scriptParams.getBytes()), pintoolPath + "/conf/others.conf");
        shell.execute(command);
        return Message.success();
    }

    @PostMapping("/setSsh")
    public Message setSsh(@RequestParam("ip") String ip,
                          @RequestParam("port") Integer port,
                          @RequestParam("username") String username,
                          @RequestParam("password") String password) {

        try {
            shell.setSshProperty(new SshProperty(ip, port, username, password));
            return Message.success();
        } catch (JSchException e) {
            e.printStackTrace();
            return Message.fail();
        }
    }
}
