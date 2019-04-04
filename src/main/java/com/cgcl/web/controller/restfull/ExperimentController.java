package com.cgcl.web.controller.restfull;

import com.cgcl.common.util.Message;
import com.cgcl.web.domain.entity.Experiment;
import com.cgcl.web.service.ExperimentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * <p>
 * 处理和实验有关的请求
 * </p>
 *
 * @author Liu Cong
 * @since Created in 2019/4/1
 */
@Slf4j
@Controller
@RequestMapping("/exp")
public class ExperimentController {

    @Resource
    private ExperimentService experimentService;

    @RequestMapping(value = "/all", method = RequestMethod.GET)
    @ResponseBody
    public Message getExpAll(@RequestParam(value = "pageNum") Integer pageNum,
                             @RequestParam(value = "pageSize") Integer pageSize,
                             @RequestParam(value = "sort") String sort,
                             @RequestParam(value = "order") String order,
                             @RequestParam(value = "search", required = false) String search) {
        log.info("GET:exp/all?pageNum=" + pageNum + "&pageSize=" + pageSize + "&sort=" + sort + "&order=" + order
                + "&search=" + search);
        if (order == null || order.equals(""))
            order = "asc";
        Sort s = new Sort(order.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sort);
        Pageable pageable = PageRequest.of(pageNum, pageSize, s);
        Page<Experiment> page = experimentService.findAllByPageable(pageable);
        return Message.success().add("pageInfo", page);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    @ResponseBody
    public Message getExpById(@PathVariable("id") Long id) {
        log.info("GET:exp/" + id);
        Experiment experiment = experimentService.getById(id);
        return Message.success().add("exp", experiment);
    }

    @RequestMapping(value = "/putDesc", method = RequestMethod.POST)
    @ResponseBody
    public Message putDescById(@RequestParam(value = "id") Long id,
                               @RequestParam(value = "description") String description) {
        log.info("POST:exp/putDesc?id=" + id + "&description=" + description);
        experimentService.putDescByIdSelective(new Experiment(id, description));
        return Message.success();
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    @ResponseBody
    public Message deleteExpById(@RequestParam(value = "id") Long id) {
        log.info("POST:exp/delete?id=" + id);
        experimentService.deleteById(id);
        return Message.success();
    }
}
