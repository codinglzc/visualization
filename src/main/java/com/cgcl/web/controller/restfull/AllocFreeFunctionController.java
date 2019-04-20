package com.cgcl.web.controller.restfull;

import com.cgcl.common.util.Message;
import com.cgcl.web.domain.entity.AllocFreeFunction;
import com.cgcl.web.service.AllocFreeFunctionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/10
 */
@Slf4j
@RestController
@RequestMapping("/func")
public class AllocFreeFunctionController {

    @Resource
    private AllocFreeFunctionService functionService;

    @GetMapping("/all")
    public Message getAll(@RequestParam(value = "pageNum") Integer pageNum,
                          @RequestParam(value = "pageSize") Integer pageSize,
                          @RequestParam(value = "sort") String sort,
                          @RequestParam(value = "order") String order,
                          @RequestParam(value = "search", required = false) String search) {
        log.info("GET:func/all?pageNum=" + pageNum + "&pageSize=" + pageSize + "&sort=" + sort + "&order=" + order + "&search=" + search);
        if (order == null || order.equals(""))
            order = "asc";
        Sort s = new Sort(order.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sort);
        Pageable pageable = PageRequest.of(pageNum, pageSize, s);
        Page<AllocFreeFunction> page = functionService.findAllByPageable(pageable);

        return Message.success().add("pageInfo", page);
    }

    @GetMapping("/allNoPageInfo")
    public Message getAllNoPageInfo() {
        List<AllocFreeFunction> funcs = functionService.getAll();
        return Message.success().add("funcs", funcs);
    }

    @PostMapping("/deleteByIds")
    public Message deleteByIds(@RequestParam("ids") String idStr) {
        log.info("GET:func/deleteByIds?ids=" + idStr);
        List<Long> idList = new ArrayList<>();
        for (String s : idStr.split(",")) {
            idList.add(Long.parseLong(s));
        }
        functionService.deleteByIds(idList);
        return Message.success();
    }

    @PostMapping("/add")
    public Message add(@ModelAttribute AllocFreeFunction function) {
        log.info("GET:func/add?function=" + function);
        boolean flag = functionService.add(function);
        return flag ? Message.success() : Message.fail();
    }

    @PostMapping("/post")
    public Message post(@ModelAttribute AllocFreeFunction function) {
        log.info("GET:func/post?function=" + function);
        boolean flag = functionService.update(function);
        return flag ? Message.success() : Message.fail();
    }
}
