package com.cgcl.web.controller.restfull;

import com.cgcl.web.controller.AbstractContiPerf;
import org.databene.contiperf.PerfTest;
import org.junit.Before;
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
public class ExperimentControllerTests extends AbstractContiPerf {

//    @Test
//    @PerfTest(threads = 100, invocations = 10000)
    public void getExpAll() throws Exception {

        MvcResult result = mockMvc.perform(get("/exp/all")
                .param("pageNum", "0")
                .param("pageSize", "5")
                .param("sort", "createTime")
                .param("order", "asc"))
                .andReturn();// 返回执行请求的结果

        System.out.println(result.getResponse().getContentAsString());
    }

//    @Test
//    @PerfTest(threads = 100, invocations = 10000)
    public void getExpById() throws Exception {

        MvcResult result = mockMvc.perform(get("/exp/6"))
                .andReturn();// 返回执行请求的结果

        System.out.println(result.getResponse().getContentAsString());
    }

//    @Test
//    @PerfTest(threads = 100, invocations = 10000)
    public void getCurrentExpNum() throws Exception {

        MvcResult result = mockMvc.perform(get("/exp/getCurrentExpNum"))
                .andReturn();// 返回执行请求的结果

        System.out.println(result.getResponse().getContentAsString());
    }

    @Test
    public void contextLoads() {
    }
}
