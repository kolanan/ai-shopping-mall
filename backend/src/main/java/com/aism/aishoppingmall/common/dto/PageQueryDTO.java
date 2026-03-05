package com.aism.aishoppingmall.common.dto;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PageQueryDTO {

    @Min(value = 1, message = "current must be >= 1")
    private long current = 1;

    @Min(value = 1, message = "size must be >= 1")
    @Max(value = 200, message = "size must be <= 200")
    private long size = 10;

    public <T> Page<T> toPage(long maxSize) {
        long safeCurrent = Math.max(current, 1);
        long safeSize = Math.max(Math.min(size, maxSize), 1);
        return Page.of(safeCurrent, safeSize);
    }
}
