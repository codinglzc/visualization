package com.cgcl.web.controller.restfull;

import com.cgcl.common.util.Message;
import com.cgcl.web.service.MetaObjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/2
 */
@Slf4j
@Controller
@RequestMapping("/metaObj")
public class MetaObjectController {
    @Resource
    private MetaObjectService metaObjectService;

    @RequestMapping(value = "/byExpId", method = RequestMethod.GET)
    @ResponseBody
    public Message getMetaObjAll(@RequestParam(value = "expId") Long expId,
                                 @RequestParam(value = "pageNum") Integer pageNum,
                                 @RequestParam(value = "pageSize") Integer pageSize,
                                 @RequestParam(value = "orderBy") String orderBy) {
//        PageInfo<MetaObject> pageInfo = metaObjectService.getListByExpId(expId, pageNum, pageSize, orderBy);
//        return Message.success().add("pageInfo", pageInfo);
        return Message.fail();
    }
}
