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
public class MetaObjectControllerTests extends AbstractContiPerf {

//    @Test
//    @PerfTest(threads = 100, invocations = 10000)
    public void getMetaObjsByExpId() throws Exception {

        MvcResult result = mockMvc.perform(get("/metaObj/byExpId").param("expId", "6"))
                .andReturn();// 返回执行请求的结果

        System.out.println(result.getResponse().getContentAsString());
    }

//    @Test
//    @PerfTest(threads = 100, invocations = 10000)
    public void countByExpId() throws Exception {

        MvcResult result = mockMvc.perform(get("/metaObj/countByExpId").param("expId", "6"))
                .andReturn();// 返回执行请求的结果

        System.out.println(result.getResponse().getContentAsString());
    }

//    @Test
//    @PerfTest(threads = 100, invocations = 1000)
    public void getMetaObjsWithAggregateInfoByIds() throws Exception {

        MvcResult result = mockMvc.perform(get("/metaObj/getMetaObjsWithAggregateInfoByIds").param("ids", "456"))
                .andReturn();// 返回执行请求的结果

        System.out.println(result.getResponse().getContentAsString());
    }

    @Test
    public void contextLoads() {
    }
}
