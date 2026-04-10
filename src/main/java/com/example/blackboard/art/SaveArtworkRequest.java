package com.example.blackboard.art;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SaveArtworkRequest(
    @NotBlank(message = "作品名称不能为空")
        @Size(max = 60, message = "作品名称不能超过60个字符")
        String name,
    @NotBlank(message = "图片内容不能为空") String imageDataUrl) {}
