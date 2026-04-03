BEGIN;

-- 일반 사용자 생성
INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
VALUES
    (
        'user1@test.com',
        '$2a$10$bpWxMsl0gGo9/HzIkQ.3veddsRVb84EYTpBFLm2qJjq.uA5i2mTni',
        '홍길동',
        'customer',
        TIMESTAMP '2026-04-02 09:00:00',
        TIMESTAMP '2026-04-02 09:00:00'
    ),
    (
        'user2@test.com',
        '$2a$10$bpWxMsl0gGo9/HzIkQ.3veddsRVb84EYTpBFLm2qJjq.uA5i2mTni',
        '김철수',
        'customer',
        TIMESTAMP '2026-04-02 09:00:00',
        TIMESTAMP '2026-04-02 09:00:00'
    );

-- 상품 생성
INSERT INTO products (
    name,
    short_description,
    base_price,
    discount_rate,
    sale_start,
    sale_end,
    total_sold,
    created_at,
    updated_at
)
VALUES
    ('Tree Slip-on Basic', '데일리로 신기 좋은 트리 슬립온', 59000, 10, NULL, NULL, 0, TIMESTAMP '2026-02-21 12:00:00', TIMESTAMP '2026-02-21 12:00:00'),
    ('Tree Slip-on Light', '가벼운 착화감의 라이트 버전', 62000, 0, NULL, NULL, 0, TIMESTAMP '2026-03-13 12:00:00', TIMESTAMP '2026-03-13 12:00:00'),
    ('Wool Slip-on Warm', '겨울철 보온성 좋은 울 슬립온', 75000, 20, NULL, NULL, 0, TIMESTAMP '2026-02-01 12:00:00', TIMESTAMP '2026-02-01 12:00:00'),
    ('Premium Leather Slip-on', '고급 가죽 소재 프리미엄 슬립온', 120000, 15, NULL, NULL, 0, TIMESTAMP '2026-03-23 12:00:00', TIMESTAMP '2026-03-23 12:00:00'),
    ('Eco Slip-on Recycled', '재활용 소재를 활용한 친환경 슬립온', 68000, 5, NULL, NULL, 0, TIMESTAMP '2026-03-28 12:00:00', TIMESTAMP '2026-03-28 12:00:00'),
    ('Sporty Slip-on', '스포티한 디자인의 슬립온', 70000, 0, NULL, NULL, 0, TIMESTAMP '2026-03-08 12:00:00', TIMESTAMP '2026-03-08 12:00:00'),
    ('Minimal Slip-on', '심플한 디자인의 미니멀 슬립온', 65000, 12, NULL, NULL, 0, TIMESTAMP '2026-03-18 12:00:00', TIMESTAMP '2026-03-18 12:00:00'),
    ('Outdoor Grip Slip-on', '접지력이 좋은 아웃도어용 슬립온', 89000, 18, NULL, NULL, 0, TIMESTAMP '2026-02-26 12:00:00', TIMESTAMP '2026-02-26 12:00:00'),
    ('Office Casual Slip-on', '오피스룩에도 어울리는 캐주얼 슬립온', 78000, 8, NULL, NULL, 0, TIMESTAMP '2026-03-21 12:00:00', TIMESTAMP '2026-03-21 12:00:00'),
    ('Travel Easy Slip-on', '여행용으로 편한 경량 슬립온', 71000, 0, NULL, NULL, 0, TIMESTAMP '2026-03-30 12:00:00', TIMESTAMP '2026-03-30 12:00:00'),
    ('Lifestyle Daily Sneaker', '데일리로 신기 좋은 기본 스니커즈', 82000, 0, NULL, NULL, 0, TIMESTAMP '2026-02-11 12:00:00', TIMESTAMP '2026-02-11 12:00:00'),
    ('Lifestyle Chunky Sneaker', '트렌디한 청키 스니커즈', 95000, 10, NULL, NULL, 0, TIMESTAMP '2026-03-03 12:00:00', TIMESTAMP '2026-03-03 12:00:00'),
    ('Lifestyle Running Shoe', '가벼운 조깅용 러닝화', 91000, 5, NULL, NULL, 0, TIMESTAMP '2026-03-13 12:00:00', TIMESTAMP '2026-03-13 12:00:00'),
    ('Lifestyle Retro Sneaker', '복고풍 디자인의 레트로 스니커즈', 88000, 15, NULL, NULL, 0, TIMESTAMP '2026-03-18 12:00:00', TIMESTAMP '2026-03-18 12:00:00'),
    ('Lifestyle Canvas Low', '클래식 로우컷 캔버스 스니커즈', 63000, 0, NULL, NULL, 0, TIMESTAMP '2026-03-28 12:00:00', TIMESTAMP '2026-03-28 12:00:00'),
    ('Lifestyle High-top Sneaker', '발목까지 감싸주는 하이탑 스니커즈', 99000, 12, NULL, NULL, 0, TIMESTAMP '2026-03-08 12:00:00', TIMESTAMP '2026-03-08 12:00:00'),
    ('Lifestyle Slip-on Hybrid', '슬립온과 스니커즈의 하이브리드', 87000, 7, NULL, NULL, 0, TIMESTAMP '2026-03-25 12:00:00', TIMESTAMP '2026-03-25 12:00:00'),
    ('Lifestyle Outdoor Walker', '야외 활동용 워킹 슈즈', 93000, 18, NULL, NULL, 0, TIMESTAMP '2026-02-26 12:00:00', TIMESTAMP '2026-02-26 12:00:00'),
    ('Lifestyle Office Minimal', '오피스룩에 어울리는 미니멀 스니커즈', 90000, 0, NULL, NULL, 0, TIMESTAMP '2026-03-31 12:00:00', TIMESTAMP '2026-03-31 12:00:00'),
    ('Lifestyle Travel Walker', '여행용으로 적합한 편안한 워킹 슈즈', 88000, 6, NULL, NULL, 0, TIMESTAMP '2026-03-21 12:00:00', TIMESTAMP '2026-03-21 12:00:00');

-- 상품 이미지
INSERT INTO product_images (product_id, image_url, sort_order, created_at)
SELECT p.id, v.image_url, v.sort_order, p.created_at
FROM products p
JOIN (
    VALUES
        ('Tree Slip-on Basic', '/img/slipon_tree1.jpg', 0),
        ('Tree Slip-on Basic', '/img/slipon_tree2.jpg', 1),
        ('Tree Slip-on Light', '/img/slipon_tree_light1.jpg', 0),
        ('Tree Slip-on Light', '/img/slipon_tree_light2.jpg', 1),
        ('Wool Slip-on Warm', '/img/slipon_warm1.jpg', 0),
        ('Wool Slip-on Warm', '/img/slipon_warm2.jpg', 1),
        ('Premium Leather Slip-on', '/img/slipon_leather1.jpg', 0),
        ('Premium Leather Slip-on', '/img/slipon_leather2.jpg', 1),
        ('Eco Slip-on Recycled', '/img/slipon_eco1.jpg', 0),
        ('Eco Slip-on Recycled', '/img/slipon_eco2.jpg', 1),
        ('Sporty Slip-on', '/img/slipon_sport1.jpg', 0),
        ('Sporty Slip-on', '/img/slipon_sport2.jpg', 1),
        ('Minimal Slip-on', '/img/slipon_minimal1.jpg', 0),
        ('Minimal Slip-on', '/img/slipon_minimal2.jpg', 1),
        ('Outdoor Grip Slip-on', '/img/slipon_outdoor1.jpg', 0),
        ('Outdoor Grip Slip-on', '/img/slipon_outdoor2.jpg', 1),
        ('Office Casual Slip-on', '/img/slipon_office1.jpg', 0),
        ('Office Casual Slip-on', '/img/slipon_office2.jpg', 1),
        ('Travel Easy Slip-on', '/img/slipon_travel1.jpg', 0),
        ('Travel Easy Slip-on', '/img/slipon_travel2.jpg', 1),
        ('Lifestyle Daily Sneaker', '/img/life_daily1.jpg', 0),
        ('Lifestyle Daily Sneaker', '/img/life_daily2.jpg', 1),
        ('Lifestyle Chunky Sneaker', '/img/life_chunky1.jpg', 0),
        ('Lifestyle Chunky Sneaker', '/img/life_chunky2.jpg', 1),
        ('Lifestyle Running Shoe', '/img/life_run1.jpg', 0),
        ('Lifestyle Running Shoe', '/img/life_run2.jpg', 1),
        ('Lifestyle Retro Sneaker', '/img/life_retro1.jpg', 0),
        ('Lifestyle Retro Sneaker', '/img/life_retro2.jpg', 1),
        ('Lifestyle Canvas Low', '/img/life_canvas1.jpg', 0),
        ('Lifestyle Canvas Low', '/img/life_canvas2.jpg', 1),
        ('Lifestyle High-top Sneaker', '/img/life_hightop1.jpg', 0),
        ('Lifestyle High-top Sneaker', '/img/life_hightop2.jpg', 1),
        ('Lifestyle Slip-on Hybrid', '/img/life_hybrid1.jpg', 0),
        ('Lifestyle Slip-on Hybrid', '/img/life_hybrid2.jpg', 1),
        ('Lifestyle Outdoor Walker', '/img/life_outdoor1.jpg', 0),
        ('Lifestyle Outdoor Walker', '/img/life_outdoor2.jpg', 1),
        ('Lifestyle Office Minimal', '/img/life_office1.jpg', 0),
        ('Lifestyle Office Minimal', '/img/life_office2.jpg', 1),
        ('Lifestyle Travel Walker', '/img/life_travel1.jpg', 0),
        ('Lifestyle Travel Walker', '/img/life_travel2.jpg', 1)
) AS v(product_name, image_url, sort_order)
ON p.name = v.product_name;

-- 상품 카테고리
INSERT INTO product_categories (product_id, category_name)
SELECT p.id, v.category_name
FROM products p
JOIN (
    VALUES
        ('Tree Slip-on Basic', 'slipon'),
        ('Tree Slip-on Light', 'slipon'),
        ('Wool Slip-on Warm', 'slipon'),
        ('Premium Leather Slip-on', 'slipon'),
        ('Eco Slip-on Recycled', 'slipon'),
        ('Sporty Slip-on', 'slipon'),
        ('Minimal Slip-on', 'slipon'),
        ('Outdoor Grip Slip-on', 'slipon'),
        ('Office Casual Slip-on', 'slipon'),
        ('Travel Easy Slip-on', 'slipon'),
        ('Lifestyle Daily Sneaker', 'lifestyle'),
        ('Lifestyle Chunky Sneaker', 'lifestyle'),
        ('Lifestyle Running Shoe', 'lifestyle'),
        ('Lifestyle Retro Sneaker', 'lifestyle'),
        ('Lifestyle Canvas Low', 'lifestyle'),
        ('Lifestyle High-top Sneaker', 'lifestyle'),
        ('Lifestyle Slip-on Hybrid', 'lifestyle'),
        ('Lifestyle Slip-on Hybrid', 'slipon'),
        ('Lifestyle Outdoor Walker', 'lifestyle'),
        ('Lifestyle Office Minimal', 'lifestyle'),
        ('Lifestyle Travel Walker', 'lifestyle')
) AS v(product_name, category_name)
ON p.name = v.product_name;

-- 상품 사이즈
INSERT INTO product_sizes (product_id, size_value)
SELECT p.id, v.size_value
FROM products p
JOIN (
    VALUES
        ('Tree Slip-on Basic', 235), ('Tree Slip-on Basic', 240), ('Tree Slip-on Basic', 245), ('Tree Slip-on Basic', 250), ('Tree Slip-on Basic', 255), ('Tree Slip-on Basic', 260),
        ('Tree Slip-on Light', 240), ('Tree Slip-on Light', 245), ('Tree Slip-on Light', 250), ('Tree Slip-on Light', 255),
        ('Wool Slip-on Warm', 230), ('Wool Slip-on Warm', 235), ('Wool Slip-on Warm', 240), ('Wool Slip-on Warm', 245),
        ('Premium Leather Slip-on', 250), ('Premium Leather Slip-on', 255), ('Premium Leather Slip-on', 260), ('Premium Leather Slip-on', 265),
        ('Eco Slip-on Recycled', 240), ('Eco Slip-on Recycled', 245), ('Eco Slip-on Recycled', 250),
        ('Sporty Slip-on', 255), ('Sporty Slip-on', 260), ('Sporty Slip-on', 265), ('Sporty Slip-on', 270),
        ('Minimal Slip-on', 245), ('Minimal Slip-on', 250), ('Minimal Slip-on', 255),
        ('Outdoor Grip Slip-on', 250), ('Outdoor Grip Slip-on', 260), ('Outdoor Grip Slip-on', 270),
        ('Office Casual Slip-on', 240), ('Office Casual Slip-on', 245), ('Office Casual Slip-on', 250), ('Office Casual Slip-on', 255),
        ('Travel Easy Slip-on', 235), ('Travel Easy Slip-on', 240), ('Travel Easy Slip-on', 245), ('Travel Easy Slip-on', 250),
        ('Lifestyle Daily Sneaker', 250), ('Lifestyle Daily Sneaker', 260), ('Lifestyle Daily Sneaker', 270),
        ('Lifestyle Chunky Sneaker', 240), ('Lifestyle Chunky Sneaker', 245), ('Lifestyle Chunky Sneaker', 250), ('Lifestyle Chunky Sneaker', 255), ('Lifestyle Chunky Sneaker', 260),
        ('Lifestyle Running Shoe', 250), ('Lifestyle Running Shoe', 255), ('Lifestyle Running Shoe', 260), ('Lifestyle Running Shoe', 265),
        ('Lifestyle Retro Sneaker', 235), ('Lifestyle Retro Sneaker', 240), ('Lifestyle Retro Sneaker', 245), ('Lifestyle Retro Sneaker', 250),
        ('Lifestyle Canvas Low', 230), ('Lifestyle Canvas Low', 235), ('Lifestyle Canvas Low', 240), ('Lifestyle Canvas Low', 245), ('Lifestyle Canvas Low', 250),
        ('Lifestyle High-top Sneaker', 250), ('Lifestyle High-top Sneaker', 255), ('Lifestyle High-top Sneaker', 260),
        ('Lifestyle Slip-on Hybrid', 240), ('Lifestyle Slip-on Hybrid', 245), ('Lifestyle Slip-on Hybrid', 250), ('Lifestyle Slip-on Hybrid', 255),
        ('Lifestyle Outdoor Walker', 255), ('Lifestyle Outdoor Walker', 260), ('Lifestyle Outdoor Walker', 265), ('Lifestyle Outdoor Walker', 270),
        ('Lifestyle Office Minimal', 240), ('Lifestyle Office Minimal', 245), ('Lifestyle Office Minimal', 250),
        ('Lifestyle Travel Walker', 235), ('Lifestyle Travel Walker', 240), ('Lifestyle Travel Walker', 245), ('Lifestyle Travel Walker', 250), ('Lifestyle Travel Walker', 255)
) AS v(product_name, size_value)
ON p.name = v.product_name;

-- 상품 소재
INSERT INTO product_materials (product_id, material_name)
SELECT p.id, v.material_name
FROM products p
JOIN (
    VALUES
        ('Tree Slip-on Basic', 'Tree'),
        ('Tree Slip-on Light', 'Tree'), ('Tree Slip-on Light', 'Mesh'),
        ('Wool Slip-on Warm', 'Wool'),
        ('Premium Leather Slip-on', 'Leather'),
        ('Eco Slip-on Recycled', 'Recycled'), ('Eco Slip-on Recycled', 'Canvas'),
        ('Sporty Slip-on', 'Mesh'),
        ('Minimal Slip-on', 'Canvas'),
        ('Outdoor Grip Slip-on', 'Rubber'), ('Outdoor Grip Slip-on', 'Mesh'),
        ('Office Casual Slip-on', 'Leather'), ('Office Casual Slip-on', 'Canvas'),
        ('Travel Easy Slip-on', 'Mesh'), ('Travel Easy Slip-on', 'Foam'),
        ('Lifestyle Daily Sneaker', 'Canvas'),
        ('Lifestyle Chunky Sneaker', 'Leather'), ('Lifestyle Chunky Sneaker', 'Rubber'),
        ('Lifestyle Running Shoe', 'Mesh'),
        ('Lifestyle Retro Sneaker', 'Suede'),
        ('Lifestyle Canvas Low', 'Canvas'),
        ('Lifestyle High-top Sneaker', 'Leather'), ('Lifestyle High-top Sneaker', 'Canvas'),
        ('Lifestyle Slip-on Hybrid', 'Mesh'), ('Lifestyle Slip-on Hybrid', 'Foam'),
        ('Lifestyle Outdoor Walker', 'Rubber'), ('Lifestyle Outdoor Walker', 'Mesh'),
        ('Lifestyle Office Minimal', 'Leather'),
        ('Lifestyle Travel Walker', 'Mesh'), ('Lifestyle Travel Walker', 'Canvas')
) AS v(product_name, material_name)
ON p.name = v.product_name;

-- 주문 생성
INSERT INTO orders (user_id, total_amount, paid_at, created_at, updated_at)
VALUES
    (
        (SELECT id FROM users WHERE email = 'user1@test.com'),
        188200,
        TIMESTAMP '2026-03-28 12:00:00',
        TIMESTAMP '2026-03-28 12:00:00',
        TIMESTAMP '2026-03-28 12:00:00'
    ),
    (
        (SELECT id FROM users WHERE email = 'user1@test.com'),
        187500,
        TIMESTAMP '2026-03-18 12:00:00',
        TIMESTAMP '2026-03-18 12:00:00',
        TIMESTAMP '2026-03-18 12:00:00'
    ),
    (
        (SELECT id FROM users WHERE email = 'user2@test.com'),
        224000,
        TIMESTAMP '2026-03-08 12:00:00',
        TIMESTAMP '2026-03-08 12:00:00',
        TIMESTAMP '2026-03-08 12:00:00'
    ),
    (
        (SELECT id FROM users WHERE email = 'user2@test.com'),
        230040,
        TIMESTAMP '2026-03-31 12:00:00',
        TIMESTAMP '2026-03-31 12:00:00',
        TIMESTAMP '2026-03-31 12:00:00'
    );

-- 주문 아이템 생성
INSERT INTO order_items (
    order_id,
    product_id,
    name_snapshot,
    price_snapshot,
    size_value,
    quantity,
    created_at
)
VALUES
    (
        (SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'user1@test.com') AND paid_at = TIMESTAMP '2026-03-28 12:00:00'),
        (SELECT id FROM products WHERE name = 'Tree Slip-on Basic'),
        'Tree Slip-on Basic',
        53100,
        250,
        2,
        TIMESTAMP '2026-03-28 12:00:00'
    ),
    (
        (SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'user1@test.com') AND paid_at = TIMESTAMP '2026-03-28 12:00:00'),
        (SELECT id FROM products WHERE name = 'Lifestyle Daily Sneaker'),
        'Lifestyle Daily Sneaker',
        82000,
        260,
        1,
        TIMESTAMP '2026-03-28 12:00:00'
    ),
    (
        (SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'user1@test.com') AND paid_at = TIMESTAMP '2026-03-18 12:00:00'),
        (SELECT id FROM products WHERE name = 'Premium Leather Slip-on'),
        'Premium Leather Slip-on',
        102000,
        260,
        1,
        TIMESTAMP '2026-03-18 12:00:00'
    ),
    (
        (SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'user1@test.com') AND paid_at = TIMESTAMP '2026-03-18 12:00:00'),
        (SELECT id FROM products WHERE name = 'Lifestyle Chunky Sneaker'),
        'Lifestyle Chunky Sneaker',
        85500,
        245,
        1,
        TIMESTAMP '2026-03-18 12:00:00'
    ),
    (
        (SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'user2@test.com') AND paid_at = TIMESTAMP '2026-03-08 12:00:00'),
        (SELECT id FROM products WHERE name = 'Wool Slip-on Warm'),
        'Wool Slip-on Warm',
        60000,
        235,
        3,
        TIMESTAMP '2026-03-08 12:00:00'
    ),
    (
        (SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'user2@test.com') AND paid_at = TIMESTAMP '2026-03-08 12:00:00'),
        (SELECT id FROM products WHERE name = 'Lifestyle Retro Sneaker'),
        'Lifestyle Retro Sneaker',
        74800,
        240,
        1,
        TIMESTAMP '2026-03-08 12:00:00'
    ),
    (
        (SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'user2@test.com') AND paid_at = TIMESTAMP '2026-03-31 12:00:00'),
        (SELECT id FROM products WHERE name = 'Eco Slip-on Recycled'),
        'Eco Slip-on Recycled',
        64600,
        245,
        1,
        TIMESTAMP '2026-03-31 12:00:00'
    ),
    (
        (SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'user2@test.com') AND paid_at = TIMESTAMP '2026-03-31 12:00:00'),
        (SELECT id FROM products WHERE name = 'Lifestyle Travel Walker'),
        'Lifestyle Travel Walker',
        82720,
        245,
        2,
        TIMESTAMP '2026-03-31 12:00:00'
    );

-- total_sold 반영
UPDATE products p
SET total_sold = COALESCE(s.total_qty, 0)
FROM (
    SELECT product_id, SUM(quantity) AS total_qty
    FROM order_items
    GROUP BY product_id
) s
WHERE p.id = s.product_id;

COMMIT;
