import React, { useEffect, useState } from 'react';
import ProductCard from '../ui/ProductCard';
import { apiCall, API_ENDPOINTS } from '../../config/api';

interface Product {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId?: number | null;
  subcategoryId?: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
  hasRequiredOptions?: boolean;
}

type Props = {
  categoryId: number;
  limit?: number;
};

const CategoryProductsPreview: React.FC<Props> = ({ categoryId, limit = 5 }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiCall(API_ENDPOINTS.PRODUCTS_BY_CATEGORY(categoryId));

        let list: Product[] = [];
        if (Array.isArray(res)) {
          list = res as Product[];
        } else if (Array.isArray(res?.products)) {
          list = res.products as Product[];
        } else if (Array.isArray(res?.data?.products)) {
          list = res.data.products as Product[];
        } else if (Array.isArray(res?.data)) {
          list = res.data as Product[];
        } else if (Array.isArray(res?.data?.data)) {
          list = res.data.data as Product[];
        }

        // ترتيب بسيط بالإنشاء ثم حد أعلى
        list.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        if (mounted) setProducts(list.slice(0, limit));
      } catch (err) {
        console.error('Error fetching category products preview:', err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [categoryId, limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {[...Array(limit)].map((_, idx) => (
          <div key={idx} className="w-full h-64 bg-black/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <div className="text-sm text-gray-600">لا توجد منتجات متاحة حالياً لهذا التصنيف.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
      {products.map((product) => (
        <div key={product.id} className="w-full">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default CategoryProductsPreview;