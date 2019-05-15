package com.cgcl.web.controller.restfull;

import com.cgcl.web.controller.AbstractContiPerf;
import org.databene.contiperf.PerfTest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * <p>
 *
 * </p>
 *
 * @author lzc
 * @since Created in 2019/4/25
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class MotnVOControllerTests extends AbstractContiPerf {

//    @Test
//    @PerfTest(threads = 100, invocations = 10000)
    public void getMotlsByTimelineNodeId() throws Exception {

        MvcResult result = mockMvc.perform(get("/motnVO/getListByTimelineNodeId").param("timelineNodeId", "1717"))
                .andReturn();// 返回执行请求的结果

        System.out.println(result.getResponse().getContentAsString());
    }
}
