package com.aism.aishoppingmall.config;

import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.category.CategoryRepository;
import com.aism.aishoppingmall.product.Product;
import com.aism.aishoppingmall.product.ProductRepository;
import com.aism.aishoppingmall.product.SeaweedFsImageStorageService;
import com.aism.aishoppingmall.user.UserRepository;
import com.aism.aishoppingmall.user.UserRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedCatalog(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            SeaweedFsImageStorageService imageStorageService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            ensureMerchantUser(userRepository, passwordEncoder);
            Map<String, Category> categoriesBySlug = new LinkedHashMap<>();
            categoriesBySlug.put("electronics", ensureCategory(categoryRepository, "Electronics", "electronics", 1));
            categoriesBySlug.put("kitchen", ensureCategory(categoryRepository, "Kitchen", "kitchen", 2));
            categoriesBySlug.put("furniture", ensureCategory(categoryRepository, "Furniture", "furniture", 3));
            categoriesBySlug.put("home", ensureCategory(categoryRepository, "Home", "home", 4));

            List<SeedProduct> seedProducts = List.of(
                    new SeedProduct("Aurora Wireless Headphones", "aurora-wireless-headphones", "Noise-cancelling over-ear headphones with 40-hour battery life.", "129.99", "4.7", "Best Seller", "https://placehold.co/640x640?text=Headphones", true, 35, 1, "electronics"),
                    new SeedProduct("Nova Smart Display", "nova-smart-display", "A compact smart display for recipes, video calls, and bedroom automation.", "99.00", "4.4", "New Arrival", "https://placehold.co/640x640?text=Display", true, 18, 2, "electronics"),
                    new SeedProduct("PulseFit Sport Earbuds", "pulsefit-sport-earbuds", "Sweat-resistant wireless earbuds tuned for commuting and workouts.", "59.90", "4.3", "Hot Pick", "https://placehold.co/640x640?text=Earbuds", true, 48, 3, "electronics"),
                    new SeedProduct("HomeBar Espresso Machine", "homebar-espresso-machine", "Compact coffee machine with one-touch cappuccino and latte presets.", "249.00", "4.6", "Limited Deal", "https://placehold.co/640x640?text=Espresso", true, 12, 4, "kitchen"),
                    new SeedProduct("CrispAir Digital Air Fryer", "crispair-digital-air-fryer", "Six-liter air fryer with quick presets for fries, wings, and vegetables.", "139.00", "4.5", "Top Rated", "https://placehold.co/640x640?text=Air+Fryer", true, 22, 5, "kitchen"),
                    new SeedProduct("StoneCraft Cookware Set", "stonecraft-cookware-set", "Ten-piece nonstick cookware set for induction and gas stoves.", "179.00", "4.4", "Bundle", "https://placehold.co/640x640?text=Cookware", false, 16, 6, "kitchen"),
                    new SeedProduct("Nimbus Office Chair", "nimbus-office-chair", "Ergonomic mesh chair built for long work sessions and lumbar support.", "189.50", "4.5", "Popular Choice", "https://placehold.co/640x640?text=Chair", true, 20, 7, "furniture"),
                    new SeedProduct("Harbor Oak Desk", "harbor-oak-desk", "Wide work desk with cable routing, drawer storage, and oak finish.", "299.00", "4.6", "Staff Pick", "https://placehold.co/640x640?text=Desk", true, 9, 8, "furniture"),
                    new SeedProduct("Loft Nest Bookshelf", "loft-nest-bookshelf", "Five-tier bookshelf for living rooms, studies, and compact apartments.", "129.00", "4.2", "Value Buy", "https://placehold.co/640x640?text=Bookshelf", false, 14, 9, "furniture"),
                    new SeedProduct("GlowSoft Bedding Set", "glowsoft-bedding-set", "Four-piece breathable bedding set designed for all-season comfort.", "79.90", "4.8", "Top Rated", "https://placehold.co/640x640?text=Bedding", true, 42, 10, "home"),
                    new SeedProduct("Luma Floor Lamp", "luma-floor-lamp", "Warm ambient floor lamp with fabric shade and three brightness modes.", "69.00", "4.3", "Easy Match", "https://placehold.co/640x640?text=Lamp", false, 31, 11, "home"),
                    new SeedProduct("PureMist Aroma Diffuser", "puremist-aroma-diffuser", "Quiet essential-oil diffuser with auto shutoff and soft night lighting.", "39.90", "4.4", "Gift Idea", "https://placehold.co/640x640?text=Diffuser", false, 57, 12, "home")
            );

            for (SeedProduct seed : seedProducts) {
                String imageUrl = imageStorageService.storeProductImage(
                        seed.slug(),
                        seed.name(),
                        categoriesBySlug.get(seed.categorySlug()).getName(),
                        seed.imageUrl()
                );

                productRepository.findBySlug(seed.slug())
                        .ifPresentOrElse(existingProduct -> {
                            if (existingProduct.getImageUrl() == null
                                    || existingProduct.getImageUrl().isBlank()
                                    || existingProduct.getImageUrl().contains("placehold.co")) {
                                existingProduct.setImageUrl(imageUrl);
                                productRepository.save(existingProduct);
                            }
                        }, () -> productRepository.save(new Product(
                                seed.name(),
                                seed.slug(),
                                seed.description(),
                                new BigDecimal(seed.price()),
                                new BigDecimal(seed.rating()),
                                seed.badge(),
                                imageUrl,
                                true,
                                seed.featured(),
                                seed.stockQuantity(),
                                seed.displayOrder(),
                                categoriesBySlug.get(seed.categorySlug()),
                                null
                        )));
            }
        };
    }

    private void ensureMerchantUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        String email = "merchant@aism.com";
        if (!userRepository.existsByEmailIgnoreCase(email)) {
            userRepository.save(new com.aism.aishoppingmall.user.User(
                    "演示商户",
                    email,
                    passwordEncoder.encode("merchant123"),
                    UserRole.MERCHANT
            ));
        }
    }

    private Category ensureCategory(CategoryRepository categoryRepository, String name, String slug, int displayOrder) {
        return categoryRepository.findBySlug(slug)
                .orElseGet(() -> categoryRepository.save(new Category(name, slug, displayOrder)));
    }

    private record SeedProduct(
            String name,
            String slug,
            String description,
            String price,
            String rating,
            String badge,
            String imageUrl,
            boolean featured,
            int stockQuantity,
            int displayOrder,
            String categorySlug
    ) {
    }
}
