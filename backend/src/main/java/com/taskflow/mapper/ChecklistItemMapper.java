package com.taskflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.taskflow.entity.ChecklistItem;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ChecklistItemMapper extends BaseMapper<ChecklistItem> {
}
