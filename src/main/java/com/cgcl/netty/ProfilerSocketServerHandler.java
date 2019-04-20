package com.cgcl.netty;

import com.cgcl.common.util.JsonUtils;
import com.cgcl.web.domain.entity.*;
import com.cgcl.web.service.*;
import com.cgcl.websocket.WebSocketServer;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import lombok.extern.slf4j.Slf4j;

import javax.annotation.Resource;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * <p>
 * Handles a server-side channel.
 * 因为该类的bean是单例模式，且被共享，所以要确保该bean是线程安全的。
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/3/29
 */
@Slf4j
@ChannelHandler.Sharable
public class ProfilerSocketServerHandler extends ChannelInboundHandlerAdapter {

    private AtomicInteger readCount = new AtomicInteger(0);

    // 已经存入数据库的所有 MetaObject，为了防止重复的 MetaObject 入库
    // key：exp_id   value：Map(key：json中的objId     value：MetaObject)
    private Map<Long, Map<Integer, MetaObject>> expMetaObjMap = new ConcurrentHashMap<>();

    // 存储入库任务，因为入库需要花费时间，所以不应该因为这个时间而增加Trace的时间粒度
    private BlockingQueue<Task> tasks = new LinkedBlockingDeque<>();
    private ExecutorService consumer = Executors.newSingleThreadExecutor();

    @Resource
    private ExperimentService experimentService;
    @Resource
    private TimelineNodeService timelineNodeService;
    @Resource
    private GlobalVarsService globalVarsService;
    @Resource
    private MetaObjectService metaObjectService;
    @Resource
    private MotnService motnService;
    @Resource
    private ThreadMemoryAccessService threadMemoryAccessService;

    public int getExpNum() {
        return expMetaObjMap.size();
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        String msgStr = (String) msg;
        if (!msgStr.startsWith("{")) {
            msgStr = msgStr.substring(msgStr.indexOf("{"));
        }
        log.info("<--" + readCount.addAndGet(1) + "-->" + msgStr);

        // 发送信息给所有的 websocket 客户端
        WebSocketServer.broadCastInfo(msgStr);

        // 解析 JSON
        Map json = JsonUtils.parse(msgStr, Map.class);
        Map globalVars = (Map) json.get("global_vars");
        List masterList = (List) json.get("masterlist");
        List TLS = (List) json.get("TLS");

        if (globalVars.get("isFirst").toString().trim().equals("1")) {
            Experiment exp = new Experiment(new Date(), "", 0L);
            experimentService.postSelective(exp); // experiment 入库
            log.debug(exp.toString());
            expMetaObjMap.put(exp.getId(), new HashMap<>());
            ctx.writeAndFlush(exp.getId() + "\n"); // 反馈信息给客户端
            return;
        } else {
            ctx.writeAndFlush("success\n");
        }

        // 添加入库任务
        try {
            tasks.put(new Task(globalVars, masterList, TLS));
        } catch (InterruptedException e) {
            e.printStackTrace();
            log.warn("Put task had a exception!");
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }

    @Override
    public void channelRegistered(ChannelHandlerContext ctx) {
        log.info(ctx.channel().remoteAddress() + ": Channel Registered");
    }

    @Override
    public void channelUnregistered(ChannelHandlerContext ctx) {
        log.info(ctx.channel().remoteAddress() + ": Channel Unregistered");
    }

    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        log.info(ctx.channel().remoteAddress() + ": Channel Active");
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
        log.info(ctx.channel().remoteAddress() + ": Channel Inactive");
    }

    public void myInit() {
        log.info("ProfilerSocketServerHandler bean init-method is invoked.");
        consumer.execute(new Consumer(Executors.newCachedThreadPool()));
    }

    // 通过<bean>的destroy-method属性指定的初始化方法
    public void myDestory() {
        log.info("ProfilerSocketServerHandler bean destroy-method is invoked.");
        consumer.shutdownNow();
    }

    // 通过<bean>的init-method属性指定的初始化方法

    class Task implements Runnable {
        private Map globalVars;
        private List masterList;
        private List TLS;

        Task(Map globalVars, List masterList, List TLS) {
            this.globalVars = globalVars;
            this.masterList = masterList;
            this.TLS = TLS;
        }

        @Override
        public void run() {
            long expId = Long.parseLong(globalVars.get("exp_id").toString());

            TimelineNode timelineNode = new TimelineNode(expId, (long) ((double) globalVars.get("time") * 1000000));
            timelineNodeService.postSelective(timelineNode); // timeline_node 入库

            GlobalVars gv = new GlobalVars(timelineNode.getId(),
                    Long.parseLong(globalVars.get("global_ins_cnt").toString()),
                    Long.parseLong(globalVars.get("dynamic_read_ins").toString()),
                    Long.parseLong(globalVars.get("dynamic_write_ins").toString()),
                    Long.parseLong(globalVars.get("static_read_ins").toString()),
                    Long.parseLong(globalVars.get("static_write_ins").toString()));
            globalVarsService.postSelective(gv); // global_vars 入库

            Map<Integer, MetaObject> metaObjectMap = expMetaObjMap.get(expId);
            for (Object item : masterList) {
                Map master = (Map) item;
                int objId = (int) master.get("objId");
                if (!metaObjectMap.containsKey(objId)) {
                    MetaObject metaObject = new MetaObject(expId,
                            objId,
                            "0x" + master.get("startAddress"),
                            "0x" + master.get("endAddress"),
                            Long.parseLong(master.get("size").toString()),
                            (String) master.get("ip"),
                            (String) master.get("sourceCodeInfo"),
                            (String) master.get("varName"),
                            (int) master.get("createdThreadId"),
                            (String) master.get("allocFuncName"),
                            (String) master.get("allocType"),
                            (long) ((double) master.get("startTime") * 1000000),
                            Long.parseLong(master.get("startInstruction").toString()),
                            Long.parseLong(master.get("startMemoryInstruction").toString()));
                    metaObjectService.postSelective(metaObject); // 入库
                    metaObjectMap.put(objId, metaObject); // add this meta_obj to metaObjectMap
                }
            }

            Map<Integer, Motn> objIdToMotnMap = new HashMap<>(); // key：json中的objId，value：MetaObjectTimelineNode
            for (Map.Entry<Integer, MetaObject> entry : metaObjectMap.entrySet()) {
                Motn motn = new Motn(entry.getValue().getId(), timelineNode.getId());
                motnService.postSelective(motn); // // meta_object_timeline_node 入库
                objIdToMotnMap.put(entry.getKey(), motn);
            }

            if (globalVars.get("isLast").toString().trim().equals("0")) {
                // 如果本条消息不是最后一条
                List<ThreadMemoryAccess> threadMemoryAccessList = new ArrayList<>(); // 需要入库的集合
                for (Object item1 : TLS) {
                    Map tls = (Map) item1;
                    int tid = (int) tls.get("tid");
                    List accessedObjs = (List) tls.get("accessedObjs");
                    for (Object item2 : accessedObjs) {
                        Map accessedObj = (Map) item2;
                        Motn motn = objIdToMotnMap.get(Integer.parseInt(accessedObj.get("objId").toString()));
                        ThreadMemoryAccess tma = new ThreadMemoryAccess(
                                motn.getId(),
                                tid,
                                Long.parseLong(accessedObj.get("start_time").toString()),
                                Long.parseLong(accessedObj.get("end_time").toString()),
                                Long.parseLong(accessedObj.get("dynamic_read").toString()),
                                Long.parseLong(accessedObj.get("dynamic_write").toString()),
                                Long.parseLong(accessedObj.get("read_in_cache").toString()),
                                Long.parseLong(accessedObj.get("strided_read").toString()),
                                Long.parseLong(accessedObj.get("pointerchasing_read").toString()),
                                Long.parseLong(accessedObj.get("random_read").toString()));
                        threadMemoryAccessList.add(tma);
                    }
                }
                if (threadMemoryAccessList.size() > 0)
                    threadMemoryAccessService.postBatchSelective(threadMemoryAccessList); // 入库
            } else {
                // 如果本条消息是最后一条
                // 更新 exp 的消耗时间
                experimentService.putConsumeTimeById(expId, (long) ((double) globalVars.get("time") * 1000000));

                // 处理 meta_object 的统计工作
                for (Object item : masterList) {
                    Map master = (Map) item;

                    // 更新 MetaObject 的 endTime、endInstruction 和 endMemoryInstruction字段
                    int objId = (int) master.get("objId");
                    MetaObject metaObject = metaObjectMap.get(objId);
                    metaObject.setEndTime((long) ((double) master.get("endTime") * 1000000));
                    metaObject.setEndInstruction(Long.parseLong(master.get("endInstruction").toString()));
                    metaObject.setEndMemoryInstruction(Long.parseLong(master.get("endMemoryInstruction").toString()));
                    metaObjectService.putByIdSelective(metaObject);

                    // 添加最后的 threadMemoryAccessList
                    List<ThreadMemoryAccess> threadMemoryAccessList = new ArrayList<>(); // 需要入库的集合
                    List accessList = (List) master.get("accessList");
                    for (Object item2 : accessList) {
                        Map access = (Map) item2;
                        Motn motn = objIdToMotnMap.get(objId);
                        ThreadMemoryAccess tma = new ThreadMemoryAccess(
                                motn.getId(),
                                Integer.parseInt(access.get("threadId").toString()),
                                (long) Double.parseDouble(access.get("startTime").toString()),
                                (long) Double.parseDouble(access.get("endTime").toString()),
                                "0x" + access.get("accessedAddressLow").toString().trim(),
                                "0x" + access.get("accessedAddressHigh").toString().trim(),
                                Long.parseLong(access.get("dynamicRead").toString()),
                                Long.parseLong(access.get("dynamicWrite").toString()),
                                Long.parseLong(access.get("readInCache").toString()),
                                Long.parseLong(access.get("stridedRead").toString()),
                                Long.parseLong(access.get("pointerChasingRead").toString()),
                                Long.parseLong(access.get("randomRead").toString()));
                        threadMemoryAccessList.add(tma);
                    }
                    if (threadMemoryAccessList.size() > 0) {
                        threadMemoryAccessService.postBatchSelective(threadMemoryAccessList); // 入库
                    }
                }

                // 删除 expMetaObjMap 中对应的数据，防止内存泄漏。
                if (expMetaObjMap.getOrDefault(expId, null) != null) {
                    expMetaObjMap.remove(expId);
                }
                readCount.set(0);
            }
        }

        @Override
        public String toString() {
            return JsonUtils.toJson(this);
        }
    }

    class Consumer implements Runnable {

        private ExecutorService executor;

        Consumer(ExecutorService executor) {
            this.executor = executor;
        }

        @Override
        public void run() {
            log.info("Consumer started.");
            while (!tasks.isEmpty() || !Thread.interrupted()) {
                try {
                    Task task = tasks.take();
                    executor.execute(task);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    List<Runnable> withoutExecTask = executor.shutdownNow();
                    if (!tasks.isEmpty()) {
                        log.warn("这里有" + withoutExecTask.size() + "个入库任务还没有被执行！");
                    }
                }
            }
            executor.shutdownNow();
        }
    }
}
