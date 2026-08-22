import { supabase } from '@/lib/supabase';

/** منتج معدّ للنشرة، بكل التفاصيل القابلة للعرض/الطباعة. */
export interface NewsletterProduct {
  id: string;
  name: string;
  price: number | null;
  wholesale_price: number | null;
  brand_id: string | null;
  category_id: string | null;
  brand_name: string | null;
  category_name: string | null;
  storage_label: string | null;
  /** يلزمان للتعديل السريع من داخل النشرة. */
  show_in_app: boolean;
  show_in_newsletter: boolean;
}

export interface NewsletterFilterOption {
  id: string;
  name: string;
}

export interface NewsletterData {
  products: NewsletterProduct[];
  brands: NewsletterFilterOption[];
  categories: NewsletterFilterOption[];
}

interface RawProductRow {
  id: string;
  name: string;
  price: number | null;
  wholesale_price: number | null;
  brand_id: string | null;
  category_id: string | null;
  show_in_app: boolean;
  show_in_newsletter: boolean;
  brand: { name: string; show_in_newsletter: boolean; is_active: boolean } | null;
  category: { name: string; show_in_newsletter: boolean; is_active: boolean } | null;
  storage_option: { label: string } | null;
}


export const newsletterService = {
async getAll(): Promise<NewsletterData> {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id, name, price, wholesale_price, brand_id, category_id,
      show_in_app, show_in_newsletter,
      brand:brands!inner(name, show_in_newsletter, is_active),
      category:categories!inner(name, show_in_newsletter, is_active),
      storage_option:storage_options(label)
    `
    )
    // شروط المنتج نفسه
    .eq('show_in_newsletter', true)
    .eq('status', 'active')
    .is('deleted_at', null)
    // شرط العلامة التجارية: يجب أن تكون ظاهرة في النشرة ونشطة
    .eq('brand.show_in_newsletter', true)
    .eq('brand.is_active', true)
    // شرط الفئة: يجب أن تكون ظاهرة في النشرة ونشطة
    .eq('category.show_in_newsletter', true)
    .eq('category.is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;

  const rows = (data as unknown as RawProductRow[]) ?? [];

  const products: NewsletterProduct[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    wholesale_price: p.wholesale_price,
    brand_id: p.brand_id,
    category_id: p.category_id,
    brand_name: p.brand?.name ?? null,
    category_name: p.category?.name ?? null,
    storage_label: p.storage_option?.label ?? null,
    show_in_app: p.show_in_app,
    show_in_newsletter: p.show_in_newsletter,
  }));

  const brandMap = new Map<string, string>();
  const categoryMap = new Map<string, string>();
  for (const p of products) {
    if (p.brand_id && p.brand_name) brandMap.set(p.brand_id, p.brand_name);
    if (p.category_id && p.category_name)
      categoryMap.set(p.category_id, p.category_name);
  }

  const brands: NewsletterFilterOption[] = [...brandMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  const categories: NewsletterFilterOption[] = [...categoryMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  return { products, brands, categories };
},


  async removeFromNewsletter(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ show_in_newsletter: false })
      .eq('id', id);
    if (error) throw error;
  },
};
