package com.aism.aishoppingmall.product;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URI;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class SeaweedFsImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(SeaweedFsImageStorageService.class);

    private final WebClient webClient;
    private final String serverAddr;

    public SeaweedFsImageStorageService(
            WebClient seaweedFsWebClient,
            @Value("${app.seaweedfs.server.addr}") String serverAddr
    ) {
        this.webClient = seaweedFsWebClient;
        this.serverAddr = serverAddr;
    }

    public String storeProductImage(String slug, String productName, String categoryName, String fallbackUrl) {
        try {
            return uploadBytes(slug + ".svg", MediaType.valueOf("image/svg+xml"), buildSvgImage(productName, categoryName));
        } catch (Exception exception) {
            log.warn("SeaweedFS 商品图片上传失败，slug={}，回退到默认图片地址。", slug, exception);
            return fallbackUrl;
        }
    }

    public String storeUploadedImage(MultipartFile file, String keyPrefix) {
        try {
            String originalFilename = file.getOriginalFilename() == null ? "product-image" : file.getOriginalFilename();
            String filename = keyPrefix + "-" + originalFilename.replaceAll("\\s+", "-");
            MediaType mediaType = file.getContentType() == null
                    ? MediaType.APPLICATION_OCTET_STREAM
                    : MediaType.parseMediaType(file.getContentType());
            return uploadBytes(filename, mediaType, file.getBytes());
        } catch (IOException exception) {
            throw new IllegalStateException("读取上传图片失败。", exception);
        }
    }

    private String uploadBytes(String filename, MediaType mediaType, byte[] bytes) {
        SeaweedAssignResponse assignResponse = webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/dir/assign").queryParam("count", 1).build())
                .retrieve()
                .bodyToMono(SeaweedAssignResponse.class)
                .block();

        if (assignResponse == null || assignResponse.fid() == null || assignResponse.fid().isBlank()) {
            throw new IllegalStateException("SeaweedFS 未返回有效文件标识。");
        }

        String fileBaseUrl = resolveFileBaseUrl(assignResponse);
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("file", new NamedByteArrayResource(bytes, filename))
                .contentType(mediaType);

        WebClient.create(fileBaseUrl)
                .post()
                .uri("/" + assignResponse.fid())
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(bodyBuilder.build()))
                .retrieve()
                .toBodilessEntity()
                .block();

        return fileBaseUrl + "/" + assignResponse.fid();
    }

    private String resolveFileBaseUrl(SeaweedAssignResponse assignResponse) {
        URI serverUri = URI.create(serverAddr);
        String scheme = serverUri.getScheme() == null ? "http" : serverUri.getScheme();
        String publicUrl = assignResponse.publicUrl() != null && !assignResponse.publicUrl().isBlank()
                ? assignResponse.publicUrl()
                : assignResponse.url();
        return scheme + "://" + publicUrl;
    }

    private byte[] buildSvgImage(String productName, String categoryName) {
        List<String> titleLines = splitTitle(productName);
        String svg = """
                <svg xmlns="http://www.w3.org/2000/svg" width="960" height="960" viewBox="0 0 960 960" fill="none">
                  <defs>
                    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%%" stop-color="#1f2937"/>
                      <stop offset="100%%" stop-color="#0f766e"/>
                    </linearGradient>
                  </defs>
                  <rect width="960" height="960" rx="64" fill="url(#bg)"/>
                  <circle cx="760" cy="190" r="140" fill="rgba(255,255,255,0.12)"/>
                  <circle cx="180" cy="760" r="170" fill="rgba(245,158,11,0.16)"/>
                  <rect x="96" y="96" width="220" height="64" rx="32" fill="rgba(255,255,255,0.12)"/>
                  <text x="206" y="138" text-anchor="middle" font-size="28" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif" fill="#f8fafc">%s</text>
                  <text x="96" y="420" font-size="72" font-weight="700" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif" fill="#ffffff">%s</text>
                  <text x="96" y="520" font-size="72" font-weight="700" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif" fill="#ffffff">%s</text>
                  <text x="96" y="660" font-size="34" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif" fill="#dbeafe">AI 智选商城</text>
                </svg>
                """.formatted(
                escapeXml(categoryName),
                escapeXml(titleLines.get(0)),
                escapeXml(titleLines.get(1))
        );

        return svg.getBytes(StandardCharsets.UTF_8);
    }

    private List<String> splitTitle(String title) {
        String normalized = title == null ? "" : title.trim();
        if (normalized.length() <= 10) {
            return List.of(normalized, "");
        }

        int midpoint = Math.min(normalized.length(), Math.max(6, normalized.length() / 2));
        return List.of(normalized.substring(0, midpoint), normalized.substring(midpoint));
    }

    private String escapeXml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private record SeaweedAssignResponse(String fid, String url, String publicUrl) {
    }

    private static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;

        private NamedByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = filename;
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }
}
