package com.aism.aishoppingmall.config;

import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.category.CategoryMapper;
import com.aism.aishoppingmall.product.Product;
import com.aism.aishoppingmall.product.ProductMapper;
import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserMapper;
import com.aism.aishoppingmall.user.UserRole;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
public class DevDataInitializer implements CommandLineRunner {

    private final UserMapper userMapper;
    private final CategoryMapper categoryMapper;
    private final ProductMapper productMapper;
    private final PasswordEncoder passwordEncoder;

    public DevDataInitializer(
            UserMapper userMapper,
            CategoryMapper categoryMapper,
            ProductMapper productMapper,
            PasswordEncoder passwordEncoder
    ) {
        this.userMapper = userMapper;
        this.categoryMapper = categoryMapper;
        this.productMapper = productMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Category electronics = ensureCategory("Electronics", "electronics", 1);
        ensureCategory("Kitchen", "kitchen", 2);
        ensureCategory("Furniture", "furniture", 3);
        ensureCategory("Home", "home", 4);

        User appleMerchant = ensureMerchant(
                "Apple Official Store",
                "apple@aism.com",
                "Apple@123456"
        );

        upsertProduct(
                "apple-macbook-pro-14-m4",
                "Apple MacBook Pro 14 (M4)",
                "14-inch MacBook Pro with Apple M4 chip, Liquid Retina XDR display and all-day battery life.",
                new BigDecimal("14999.00"),
                new BigDecimal("4.9"),
                "Official",
                "https://www.apple.com/v/macbook-pro/an/images/overview/hero/hero_intro_endframe__e6khcva4hkeq_large.jpg",
                28,
                1,
                true,
                true,
                electronics,
                appleMerchant
        );

        upsertProduct(
                "apple-iphone-16-pro",
                "Apple iPhone 16 Pro 256GB",
                "iPhone 16 Pro with advanced camera system, ProMotion display and A-series performance.",
                new BigDecimal("8999.00"),
                new BigDecimal("4.9"),
                "Hot",
                "https://www.apple.com/v/iphone/home/cb/images/overview/select/iphone_16pro__erw9alves2qa_xlarge.png",
                60,
                2,
                true,
                true,
                electronics,
                appleMerchant
        );

        upsertProduct(
                "apple-airpods-pro-2",
                "Apple AirPods Pro (2nd Gen)",
                "Active Noise Cancellation, Adaptive Audio and MagSafe charging case.",
                new BigDecimal("1899.00"),
                new BigDecimal("4.8"),
                "Best Seller",
                "https://www.apple.com/v/airpods/shared/compare/a/images/compare/airpods_pro_2nd_gen__fz9n4qok2aeu_large.png",
                120,
                3,
                true,
                true,
                electronics,
                appleMerchant
        );

        upsertProduct(
                "apple-watch-series-10",
                "Apple Watch Series 10",
                "Health insights, activity tracking, and seamless iPhone integration.",
                new BigDecimal("2999.00"),
                new BigDecimal("4.7"),
                "New",
                "https://www.apple.com/v/watch/bq/images/overview/select/product_se__frx4hb13romm_xlarge.png",
                45,
                4,
                true,
                false,
                electronics,
                appleMerchant
        );
    }

    private Category ensureCategory(String name, String slug, int displayOrder) {
        Category category = categoryMapper.findBySlug(slug);
        if (category != null) {
            return category;
        }
        Category created = new Category(name, slug, displayOrder);
        categoryMapper.insert(created);
        return created;
    }

    private User ensureMerchant(String fullName, String email, String rawPassword) {
        User merchant = userMapper.findByEmailIgnoreCase(email);
        if (merchant != null) {
            return merchant;
        }
        User created = new User(
                fullName,
                email.toLowerCase(),
                passwordEncoder.encode(rawPassword),
                UserRole.MERCHANT
        );
        userMapper.insert(created);
        return created;
    }

    private void upsertProduct(
            String slug,
            String name,
            String description,
            BigDecimal price,
            BigDecimal rating,
            String badge,
            String imageUrl,
            int stockQuantity,
            int displayOrder,
            boolean active,
            boolean featured,
            Category category,
            User merchant
    ) {
        Product existing = productMapper.findBySlug(slug);
        if (existing == null) {
            Product created = new Product(
                    name,
                    slug,
                    description,
                    price,
                    rating,
                    badge,
                    imageUrl,
                    active,
                    featured,
                    stockQuantity,
                    displayOrder,
                    category,
                    merchant
            );
            productMapper.insert(created);
            return;
        }

        existing.setName(name);
        existing.setDescription(description);
        existing.setPrice(price);
        existing.setRating(rating);
        existing.setBadge(badge);
        existing.setImageUrl(imageUrl);
        existing.setStockQuantity(stockQuantity);
        existing.setDisplayOrder(displayOrder);
        existing.setActive(active);
        existing.setFeatured(featured);
        existing.setCategory(category);
        existing.setMerchant(merchant);
        productMapper.updateById(existing);
    }
}
