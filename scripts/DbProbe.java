import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbProbe {

    private static final String JDBC_URL = System.getenv().getOrDefault(
            "SPRING_DATASOURCE_URL",
            "jdbc:mysql://10.12.61.26:3534/ai_shopping_mall?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true"
    );
    private static final String JDBC_USERNAME = System.getenv().getOrDefault("SPRING_DATASOURCE_USERNAME", "trade-manage");
    private static final String JDBC_PASSWORD = System.getenv().getOrDefault("SPRING_DATASOURCE_PASSWORD", "QAZ123wsx!!");

    public static void main(String[] args) throws Exception {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USERNAME, JDBC_PASSWORD)) {
            connection.setAutoCommit(false);

            upsertCategory(connection, "Electronics", "electronics", 1);
            upsertCategory(connection, "Kitchen", "kitchen", 2);
            upsertCategory(connection, "Furniture", "furniture", 3);
            upsertCategory(connection, "Home", "home", 4);

            upsertProduct(connection, "electronics", "Aurora Wireless Headphones", "aurora-wireless-headphones", "Noise-cancelling over-ear headphones with 40-hour battery life.", "129.99", "4.7", "Best Seller", "https://placehold.co/640x640?text=Headphones", true, 35, 1);
            upsertProduct(connection, "electronics", "Nova Smart Display", "nova-smart-display", "A compact smart display for recipes, video calls, and bedroom automation.", "99.00", "4.4", "New Arrival", "https://placehold.co/640x640?text=Display", true, 18, 2);
            upsertProduct(connection, "electronics", "PulseFit Sport Earbuds", "pulsefit-sport-earbuds", "Sweat-resistant wireless earbuds tuned for commuting and workouts.", "59.90", "4.3", "Hot Pick", "https://placehold.co/640x640?text=Earbuds", true, 48, 3);
            upsertProduct(connection, "kitchen", "HomeBar Espresso Machine", "homebar-espresso-machine", "Compact coffee machine with one-touch cappuccino and latte presets.", "249.00", "4.6", "Limited Deal", "https://placehold.co/640x640?text=Espresso", true, 12, 4);
            upsertProduct(connection, "kitchen", "CrispAir Digital Air Fryer", "crispair-digital-air-fryer", "Six-liter air fryer with quick presets for fries, wings, and vegetables.", "139.00", "4.5", "Top Rated", "https://placehold.co/640x640?text=Air+Fryer", true, 22, 5);
            upsertProduct(connection, "kitchen", "StoneCraft Cookware Set", "stonecraft-cookware-set", "Ten-piece nonstick cookware set for induction and gas stoves.", "179.00", "4.4", "Bundle", "https://placehold.co/640x640?text=Cookware", false, 16, 6);
            upsertProduct(connection, "furniture", "Nimbus Office Chair", "nimbus-office-chair", "Ergonomic mesh chair built for long work sessions and lumbar support.", "189.50", "4.5", "Popular Choice", "https://placehold.co/640x640?text=Chair", true, 20, 7);
            upsertProduct(connection, "furniture", "Harbor Oak Desk", "harbor-oak-desk", "Wide work desk with cable routing, drawer storage, and oak finish.", "299.00", "4.6", "Staff Pick", "https://placehold.co/640x640?text=Desk", true, 9, 8);
            upsertProduct(connection, "furniture", "Loft Nest Bookshelf", "loft-nest-bookshelf", "Five-tier bookshelf for living rooms, studies, and compact apartments.", "129.00", "4.2", "Value Buy", "https://placehold.co/640x640?text=Bookshelf", false, 14, 9);
            upsertProduct(connection, "home", "GlowSoft Bedding Set", "glowsoft-bedding-set", "Four-piece breathable bedding set designed for all-season comfort.", "79.90", "4.8", "Top Rated", "https://placehold.co/640x640?text=Bedding", true, 42, 10);
            upsertProduct(connection, "home", "Luma Floor Lamp", "luma-floor-lamp", "Warm ambient floor lamp with fabric shade and three brightness modes.", "69.00", "4.3", "Easy Match", "https://placehold.co/640x640?text=Lamp", false, 31, 11);
            upsertProduct(connection, "home", "PureMist Aroma Diffuser", "puremist-aroma-diffuser", "Quiet essential-oil diffuser with auto shutoff and soft night lighting.", "39.90", "4.4", "Gift Idea", "https://placehold.co/640x640?text=Diffuser", false, 57, 12);

            connection.commit();

            try (Statement statement = connection.createStatement()) {
                try (ResultSet count = statement.executeQuery("SELECT COUNT(*) FROM products")) {
                    if (count.next()) {
                        System.out.println("products.count=" + count.getInt(1));
                    }
                }

                try (ResultSet rows = statement.executeQuery(
                        "SELECT slug, name, featured, display_order FROM products ORDER BY display_order ASC, id ASC LIMIT 12"
                )) {
                    while (rows.next()) {
                        System.out.println(
                                rows.getString("slug") + " | "
                                        + rows.getString("name") + " | featured="
                                        + rows.getBoolean("featured") + " | order="
                                        + rows.getInt("display_order")
                        );
                    }
                }
            }
        }
    }

    private static void upsertCategory(Connection connection, String name, String slug, int displayOrder) throws Exception {
        String sql = """
                INSERT INTO categories (name, slug, display_order)
                SELECT ?, ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM categories WHERE slug = ?
                )
                """;
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, name);
            statement.setString(2, slug);
            statement.setInt(3, displayOrder);
            statement.setString(4, slug);
            statement.executeUpdate();
        }
    }

    private static void upsertProduct(
            Connection connection,
            String categorySlug,
            String name,
            String slug,
            String description,
            String price,
            String rating,
            String badge,
            String imageUrl,
            boolean featured,
            int stockQuantity,
            int displayOrder
    ) throws Exception {
        String sql = """
                INSERT INTO products (
                    category_id, name, slug, description, price, rating, badge, image_url, featured, stock_quantity, display_order
                )
                SELECT c.id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                FROM categories c
                WHERE c.slug = ?
                  AND NOT EXISTS (
                      SELECT 1 FROM products WHERE slug = ?
                  )
                """;
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, name);
            statement.setString(2, slug);
            statement.setString(3, description);
            statement.setString(4, price);
            statement.setString(5, rating);
            statement.setString(6, badge);
            statement.setString(7, imageUrl);
            statement.setBoolean(8, featured);
            statement.setInt(9, stockQuantity);
            statement.setInt(10, displayOrder);
            statement.setString(11, categorySlug);
            statement.setString(12, slug);
            statement.executeUpdate();
        }
    }
}
