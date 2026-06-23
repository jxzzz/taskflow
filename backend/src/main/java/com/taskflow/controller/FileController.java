package com.taskflow.controller;

import com.taskflow.dto.ApiResponse;
import com.taskflow.utils.MinioUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "文件接口", description = "文件上传")
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final MinioUtils minioUtils;

    @Operation(summary = "上传文件")
    @PostMapping("/upload")
    public ApiResponse<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String objectName = minioUtils.upload(file);
        String url = minioUtils.getPresignedUrl(objectName);

        Map<String, String> data = new HashMap<>();
        data.put("objectName", objectName);
        data.put("url", url);

        return ApiResponse.success("上传成功", data);
    }
}
