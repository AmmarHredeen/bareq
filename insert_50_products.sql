DO $$
DECLARE
  -- المتغيرات: سنخزّن المعرفات الموجودة
  brand_ids UUID[] := ARRAY(SELECT id FROM brands WHERE is_active = true ORDER BY name);
  category_ids UUID[] := ARRAY(SELECT id FROM categories WHERE is_active = true ORDER BY name);
  storage_ids UUID[] := ARRAY(SELECT id FROM storage_options WHERE is_active = true ORDER BY ram_gb, storage_gb);

  brand_id UUID;
  category_id UUID;
  storage_id UUID;

  product_names TEXT[] := ARRAY[
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'Samsung Galaxy S25 Ultra', 'Samsung Galaxy S25+', 'Samsung Galaxy S25',
    'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24+', 'Samsung Galaxy S24',
    'Samsung Galaxy A55', 'Samsung Galaxy A35', 'Samsung Galaxy A25',
    'Xiaomi 14 Pro', 'Xiaomi 14', 'Xiaomi 14T Pro', 'Xiaomi 14T',
    'Xiaomi Redmi Note 14 Pro+', 'Xiaomi Redmi Note 14 Pro', 'Xiaomi Redmi Note 14',
    'Xiaomi Redmi 14', 'Xiaomi Redmi 14C',
    'Google Pixel 9 Pro XL', 'Google Pixel 9 Pro', 'Google Pixel 9',
    'OnePlus 13', 'OnePlus 12', 'OnePlus 12R',
    'OPPO Find X8 Pro', 'OPPO Find X8', 'OPPO Reno 13 Pro', 'OPPO Reno 13',
    'vivo X200 Pro', 'vivo X200', 'vivo V50', 'vivo V40',
    'Honor Magic 7 Pro', 'Honor 200 Pro', 'Honor 200', 'Honor X9c',
    'Nothing Phone 3', 'Nothing Phone 2a',
    'Tecno Camon 30 Pro', 'Tecno Camon 30', 'Infinix Note 50', 'Infinix GT 20'
  ];

  i INTEGER;
  random_brand TEXT;
  random_category TEXT;
  random_storage TEXT;
  p_name TEXT;
  p_price NUMERIC;
  p_wholesale NUMERIC;
BEGIN
  -- التحقق من وجود بيانات كافية
  IF array_length(brand_ids, 1) IS NULL OR array_length(category_ids, 1) IS NULL OR array_length(storage_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'لا توجد بيانات كافية: brands=%, categories=%, storage=%',
      array_length(brand_ids, 1), array_length(category_ids, 1), array_length(storage_ids, 1);
  END IF;

  RAISE NOTICE 'تم العثور على: % ماركة, % فئة, % خيار تخزين',
    array_length(brand_ids, 1), array_length(category_ids, 1), array_length(storage_ids, 1);

  -- إدراج 50 منتجاً
  FOR i IN 1..50 LOOP
    p_name := product_names[i];

    -- اختيار عشوائي
    brand_id := brand_ids[1 + floor(random() * array_length(brand_ids, 1))];
    category_id := category_ids[1 + floor(random() * array_length(category_ids, 1))];
    storage_id := storage_ids[1 + floor(random() * array_length(storage_ids, 1))];

    -- سعر عشوائي واقعي بين 100 و 1500 دولار
    p_price := round((random() * 1400 + 100)::numeric, 2);
    p_wholesale := round((p_price * 0.85)::numeric, 2);

    INSERT INTO products (
      name, model, brand_id, category_id, storage_option_id,
      price, wholesale_price, status, show_in_app, show_in_newsletter
    ) VALUES (
      p_name,
      p_name,
      brand_id,
      category_id,
      storage_id,
      p_price,
      p_wholesale,
      'active',
      true,
      true
    );
  END LOOP;

  RAISE NOTICE 'تم إدراج 50 منتجاً بنجاح';
END $$;
