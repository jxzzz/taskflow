package com.taskflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.taskflow.entity.ActivityLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ActivityLogMapper extends BaseMapper<ActivityLog> {
}
