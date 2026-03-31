-- V1__create_tables.sql
-- Combined schema:
-- 1) Demo web services domain
-- 2) Trace log / anomaly detection domain

-- =========================================
-- 1. Common settings
-- =========================================

CREATE TYPE user_role AS ENUM ('customer', 'admin');


-- =========================================
-- 2. Demo web services tables
-- =========================================

CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       name VARCHAR(100),
                       role user_role NOT NULL DEFAULT 'customer',
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          short_description TEXT,
                          base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
                          discount_rate NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
                          sale_start TIMESTAMP,
                          sale_end TIMESTAMP,
                          total_sold INTEGER NOT NULL DEFAULT 0 CHECK (total_sold >= 0),
                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                          CHECK (sale_end IS NULL OR sale_start IS NULL OR sale_end >= sale_start)
);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_created_at ON products(created_at);


CREATE TABLE product_images (
                                id BIGSERIAL PRIMARY KEY,
                                product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                                image_url TEXT NOT NULL,
                                sort_order INTEGER NOT NULL DEFAULT 0,
                                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);


CREATE TABLE product_categories (
                                    id BIGSERIAL PRIMARY KEY,
                                    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                                    category_name VARCHAR(100) NOT NULL
);

CREATE UNIQUE INDEX uq_product_categories_product_id_category_name
    ON product_categories(product_id, category_name);

CREATE INDEX idx_product_categories_category_name
    ON product_categories(category_name);


CREATE TABLE product_sizes (
                               id BIGSERIAL PRIMARY KEY,
                               product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                               size_value INTEGER NOT NULL
);

CREATE UNIQUE INDEX uq_product_sizes_product_id_size_value
    ON product_sizes(product_id, size_value);

CREATE INDEX idx_product_sizes_product_id
    ON product_sizes(product_id);


CREATE TABLE product_materials (
                                   id BIGSERIAL PRIMARY KEY,
                                   product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                                   material_name VARCHAR(100) NOT NULL
);

CREATE UNIQUE INDEX uq_product_materials_product_id_material_name
    ON product_materials(product_id, material_name);


CREATE TABLE carts (
                       id BIGSERIAL PRIMARY KEY,
                       user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE cart_items (
                            id BIGSERIAL PRIMARY KEY,
                            cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
                            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
                            size_value INTEGER NOT NULL,
                            quantity INTEGER NOT NULL CHECK (quantity >= 1),
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_cart_items_cart_product_size
    ON cart_items(cart_id, product_id, size_value);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);


CREATE TABLE orders (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                        total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
                        paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_paid_at ON orders(paid_at);


CREATE TABLE order_items (
                             id BIGSERIAL PRIMARY KEY,
                             order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                             product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
                             name_snapshot VARCHAR(255) NOT NULL,
                             price_snapshot NUMERIC(12, 2) NOT NULL CHECK (price_snapshot >= 0),
                             size_value INTEGER NOT NULL,
                             quantity INTEGER NOT NULL CHECK (quantity >= 1),
                             created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);


CREATE TABLE reviews (
                         id BIGSERIAL PRIMARY KEY,
                         product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                         user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                         title VARCHAR(255) NOT NULL,
                         rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                         content TEXT NOT NULL,
                         size_value INTEGER,
                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);


-- =========================================
-- 3. Trace log / anomaly detection tables
-- =========================================

CREATE TABLE sessions (
                          id BIGSERIAL PRIMARY KEY,
                          ip VARCHAR(45) NOT NULL,
                          user_agent TEXT NOT NULL,
                          session_start TIMESTAMP NOT NULL,
                          session_end TIMESTAMP NOT NULL,
                          duration_sec NUMERIC(12,3) NOT NULL CHECK (duration_sec >= 0),
                          request_count INTEGER NOT NULL CHECK (request_count >= 0),

                          anomaly_score NUMERIC(8,6) CHECK (
                              anomaly_score IS NULL OR anomaly_score >= 0
                          ),
                          analyzed_at TIMESTAMP,

                          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                          CHECK (session_end >= session_start)
);

CREATE TABLE session_request_logs (
                                      request_log_id BIGSERIAL PRIMARY KEY,
                                      session_id BIGINT NOT NULL
                                          REFERENCES sessions(id) ON DELETE CASCADE,
                                      sequence_no INTEGER NOT NULL,
                                      request_time TIMESTAMP NOT NULL,
                                      ip VARCHAR(45) NOT NULL,
                                      method VARCHAR(10) NOT NULL,
                                      uri TEXT NOT NULL,
                                      status_code INTEGER,
                                      response_bytes BIGINT CHECK (
                                          response_bytes IS NULL OR response_bytes >= 0
                                      ),
                                      referer TEXT,
                                      user_agent TEXT,
                                      source VARCHAR(20),
                                      label VARCHAR(50),
                                      endpoint TEXT,
                                      query_string TEXT,
                                      uri_length INTEGER CHECK (uri_length IS NULL OR uri_length >= 0),
                                      query_length INTEGER CHECK (query_length IS NULL OR query_length >= 0),
                                      special_char_count INTEGER CHECK (
                                          special_char_count IS NULL OR special_char_count >= 0
                                      ),
                                      special_char_ratio NUMERIC(10,6) CHECK (
                                          special_char_ratio IS NULL OR special_char_ratio >= 0
                                      ),
                                      suspicious_keyword_count INTEGER CHECK (
                                          suspicious_keyword_count IS NULL OR suspicious_keyword_count >= 0
                                      ),
                                      is_login_endpoint BOOLEAN,
                                      is_admin_endpoint BOOLEAN,
                                      is_login_attempt BOOLEAN,
                                      raw_log TEXT,
                                      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                      UNIQUE(session_id, sequence_no)
);

CREATE TABLE session_features (
                                  session_id BIGINT PRIMARY KEY
                                      REFERENCES sessions(id) ON DELETE CASCADE,

                                  unique_url_count INTEGER CHECK (unique_url_count IS NULL OR unique_url_count >= 0),
                                  unique_method_count INTEGER CHECK (unique_method_count IS NULL OR unique_method_count >= 0),

                                  avg_request_interval_sec NUMERIC(12,3) CHECK (avg_request_interval_sec IS NULL OR avg_request_interval_sec >= 0),
                                  max_request_interval_sec NUMERIC(12,3) CHECK (max_request_interval_sec IS NULL OR max_request_interval_sec >= 0),
                                  min_request_interval_sec NUMERIC(12,3) CHECK (min_request_interval_sec IS NULL OR min_request_interval_sec >= 0),

                                  error_4xx_ratio NUMERIC(8,6) CHECK (error_4xx_ratio IS NULL OR (error_4xx_ratio >= 0 AND error_4xx_ratio <= 1)),
                                  error_5xx_ratio NUMERIC(8,6) CHECK (error_5xx_ratio IS NULL OR (error_5xx_ratio >= 0 AND error_5xx_ratio <= 1)),
                                  status_200_count INTEGER CHECK (status_200_count IS NULL OR status_200_count >= 0),

                                  avg_bytes NUMERIC(14,3) CHECK (avg_bytes IS NULL OR avg_bytes >= 0),
                                  max_bytes BIGINT CHECK (max_bytes IS NULL OR max_bytes >= 0),
                                  std_bytes NUMERIC(14,4) CHECK (std_bytes IS NULL OR std_bytes >= 0),

                                  url_sequence TEXT,
                                  status_sequence TEXT,
                                  method_sequence TEXT,

                                  login_count INTEGER CHECK (login_count IS NULL OR login_count >= 0),
                                  admin_count INTEGER CHECK (admin_count IS NULL OR admin_count >= 0),

                                  avg_uri_length NUMERIC(12,4) CHECK (avg_uri_length IS NULL OR avg_uri_length >= 0),
                                  max_uri_length INTEGER CHECK (max_uri_length IS NULL OR max_uri_length >= 0),
                                  avg_query_length NUMERIC(12,4) CHECK (avg_query_length IS NULL OR avg_query_length >= 0),
                                  max_query_length INTEGER CHECK (max_query_length IS NULL OR max_query_length >= 0),
                                  special_char_count_sum INTEGER CHECK (special_char_count_sum IS NULL OR special_char_count_sum >= 0),
                                  special_char_ratio_avg NUMERIC(12,6) CHECK (special_char_ratio_avg IS NULL OR special_char_ratio_avg >= 0),
                                  suspicious_keyword_count_sum INTEGER CHECK (
                                      suspicious_keyword_count_sum IS NULL OR suspicious_keyword_count_sum >= 0
                                  ),
                                  login_attempt_count INTEGER CHECK (login_attempt_count IS NULL OR login_attempt_count >= 0),

                                  feature_calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detection_settings (
                                    setting_id BIGSERIAL PRIMARY KEY,
                                    threshold_value NUMERIC(8,6) NOT NULL CHECK (threshold_value >= 0),
                                    min_request_count INTEGER NOT NULL CHECK (min_request_count >= 0),
                                    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_llm_summaries (
                                       session_id BIGINT PRIMARY KEY
                                           REFERENCES sessions(id) ON DELETE CASCADE,
                                       summary_text TEXT NOT NULL
);

CREATE INDEX idx_sessions_session_start
    ON sessions(session_start);

CREATE INDEX idx_sessions_anomaly_score_desc
    ON sessions(anomaly_score DESC);

CREATE INDEX idx_session_request_logs_session_seq
    ON session_request_logs(session_id, sequence_no);


-- =========================================
-- 4. updated_at auto-update trigger
-- =========================================

CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_set_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_carts_set_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cart_items_set_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_set_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reviews_set_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
