import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { getProductImage } from '../../assets/productImages';
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

interface ArabicCollectionListProps {
  arabicName: string;
  limit?: number; // defaults to 6
  className?: string;
}

const normalize = (s: any) => (typeof s === 'string' ? s : '').trim().toLowerCase();

const ArabicCollectionList: React.FC<ArabicCollectionListProps> = ({ arabicName, limit = 5, className }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [collectionId, setCollectionId] = useState<string | number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Track viewport to adjust displayed items (mobile shows up to 4)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)'); // Tailwind sm breakpoint is 640px
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setProducts([]);
      setCollectionId(null);
      try {
        // Fetch collections and find by Arabic/English name
        const res = await apiCall(`${API_ENDPOINTS.COLLECTIONS}?active=true`);
        const list: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const target = normalize(arabicName);
        const found = list.find((c: any) => {
          const ar = typeof c?.name === 'string' ? c?.name : (c?.name?.ar || '');
          const en = typeof c?.name === 'string' ? c?.name : (c?.name?.en || '');
          const nar = normalize(ar);
          const nen = normalize(en);
          return nar === target || nen === target || nar.includes(target) || nen.includes(target);
        });

        if (!found) {
          throw new Error('لم يتم العثور على المجموعة المطلوبة');
        }

        const colId = found._id || found.id;
        // Fetch products in the collection
        const prodRes = await apiCall(`${API_ENDPOINTS.COLLECTION_PRODUCTS(colId)}?page=1&limit=${limit}&sort=createdAt&order=desc`);
        const raw: any[] = Array.isArray(prodRes?.data)
          ? prodRes.data
          : Array.isArray(prodRes?.products)
            ? prodRes.products
            : Array.isArray(prodRes?.data?.products)
              ? prodRes.data.products
              : [];

        const normalized: Product[] = raw.map((p: any, idx: number) => {
          const idNum = typeof p?.id === 'number' ? p.id : (typeof p?.id === 'string' ? Number(p.id) : idx);
          const name = p?.name ?? p?.name_en ?? p?.name_ar ?? '';
          const description = p?.description ?? p?.description_en ?? p?.description_ar ?? '';
          const mainImage = p?.mainImage ?? (Array.isArray(p?.images) ? p.images[0] : '');
          const localImage = Number.isFinite(idNum) ? getProductImage(idNum) : undefined;
          const finalMainImage = localImage || mainImage;
          return {
            id: idNum,
            name,
            name_ar: p?.name_ar,
            name_en: p?.name_en,
            description,
            description_ar: p?.description_ar,
            description_en: p?.description_en,
            price: typeof p?.price === 'number' ? p.price : (Number(p?.price) || 0),
            originalPrice: typeof p?.originalPrice === 'number' ? p.originalPrice : (p?.originalPrice ? Number(p.originalPrice) : undefined),
            isAvailable: typeof p?.isAvailable === 'boolean' ? p.isAvailable : true,
            categoryId: typeof p?.categoryId === 'number' ? p.categoryId : (p?.categoryId ?? null),
            subcategoryId: typeof p?.subcategoryId === 'number' ? p.subcategoryId : (p?.subcategoryId ?? null),
            mainImage: finalMainImage,
            detailedImages: Array.isArray(p?.detailedImages) ? p.detailedImages : (Array.isArray(p?.images) ? p.images : []),
            createdAt: p?.createdAt,
            hasRequiredOptions: p?.hasRequiredOptions,
          } as Product;
        });

        if (!cancelled) {
          setProducts(normalized);
          setCollectionId(colId);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'حدث خطأ في جلب المنتجات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [arabicName, i18n.language, limit]);

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const displayLimit = isMobile ? Math.min(4, limit) : limit;

  return (
    <div className={className || ''}>
      {loading ? (
        <div className="text-center text-black/70">جارِ التحميل...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-black/60">لا توجد عناصر لعرضها حالياً</div>
      ) : (
        <div>
          {/* زر عرض الكل أعلى القسم */}
          {collectionId && (
            <div className={`mb-4 flex ${isArabic ? 'justify-end' : 'justify-start'}`}>
              <Link
                to={`/collection/${collectionId}`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#592a26] text-[#592a26] rounded-md hover:bg-[#592a26] hover:text-white transition-colors"
              >
                <span>عرض الكل</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
          {/* عرض المنتجات جنب بعض بحجم أصغر */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.slice(0, displayLimit).map((product) => (
              <div key={product.id} className="flex justify-center">
                <div className="transform scale-[0.9] sm:scale-[0.95]">
                  {/* استخدام ProductCard الأصلي (grid view) */}
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArabicCollectionList;