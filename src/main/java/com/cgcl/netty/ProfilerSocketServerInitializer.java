package com.cgcl.netty;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.DelimiterBasedFrameDecoder;
import io.netty.handler.codec.Delimiters;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.codec.string.StringEncoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/3/29
 */
@Slf4j
public class ProfilerSocketServerInitializer extends ChannelInitializer<SocketChannel> {

    @Autowired
    private ProfilerSocketServerHandler profilerSocketServerHandler;

    @Override
    protected void initChannel(SocketChannel ch) {
        // the encoder and decoder are static as these are sharable
        ch.pipeline().addLast("framer",
                new DelimiterBasedFrameDecoder(Integer.MAX_VALUE, Delimiters.lineDelimiter()));
        ch.pipeline().addLast("decoder", new StringDecoder());
        ch.pipeline().addLast("encoder", new StringEncoder());
        // and then business logic.
        ch.pipeline().addLast("handler", profilerSocketServerHandler);

        log.info(ch.remoteAddress() + ": 连接上");
    }
}
