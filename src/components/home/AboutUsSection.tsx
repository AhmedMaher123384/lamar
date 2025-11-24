import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import heroImage from '../../assets/hero2.png';
import ArabicCollectionList from '../collections/ArabicCollectionList';
import { Link } from 'react-router-dom';
import { createCategorySlug } from '../../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import { getCategoryImage } from '../../assets/categoryImages';
import CategoryProductsPreview from '../categories/CategoryProductsPreview';

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  image?: string;
}

const AboutUsSection: React.FC = () => {
  const { i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('cachedCategories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Helper to localize category name elegantly
  const getCategoryName = (category: Category) => {
    const lang = i18n.language;
    if (lang === 'ar') {
      return category.name_ar || category.name_en || category.name || '';
    }
    return category.name_en || category.name_ar || category.name || '';
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiCall(API_ENDPOINTS.CATEGORIES);
        const list = Array.isArray(data) ? data : data?.data || [];
        setCategories(list);
        try {
          localStorage.setItem('cachedCategories', JSON.stringify(list));
        } catch {}
      } catch (error) {
        // Keep cached categories if available
        console.error('Error fetching categories:', error);
      }
    };
    // Fetch if empty
    if (!categories || categories.length === 0) fetchCategories();
  }, []);

  return (
    <section className="bg-white py-12 md:py-16">
      <style>{`
        /* ألوان الهوية */
        .brand-accent { color: #592a26; }
        .brand-bg { background-color: #592a26; }
        .brand-border { border-color: #592a26; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* المجموعة: آخر العروض */}
        <div className="mb-12 md:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black">آخر العروض</h2>
              <div className="h-1 w-24 bg-[#592a26] rounded-full mt-2"></div>
            </div>
          </div>
          <ArabicCollectionList arabicName="آخر العروض" limit={5} />
        </div>

        {/* المجموعة: الجمعة البيضاء */}
        <div className="mt-8 md:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black">الجمعة البيضاء</h2>
              <div className="h-1 w-24 bg-[#592a26] rounded-full mt-2"></div>
            </div>
          </div>
          <ArabicCollectionList arabicName="الجمعة البيضاء" limit={5} />
          {/* نفس صورة الهيرو أسفل آخر مجموعة */}
          <div className="mt-8 md:mt-12">
            <img src={heroImage} alt="Hero" className="w-full h-auto block" />
          </div>
          {/* قائمة التصنيفات: تحت بعض بنفس نظام المجموعات */}
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black">التصنيفات</h2>
                <div className="h-1 w-24 bg-[#592a26] rounded-full mt-2"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {categories
                .filter((category) => {
                  const name = getCategoryName(category).toLowerCase();
                  return name !== 'ثيمات' && name !== 'themes';
                })
                .map((category) => {
                  const name = getCategoryName(category);
                  const to = `/category/${createCategorySlug(category.id, name)}`;
                  return (
                    <Link
                      key={category.id}
                      to={to}
                      className="group block"
                      aria-label={`استعراض تصنيف ${name}`}
                    >
                      <div className="relative rounded-xl overflow-hidden border border-black/10 bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="relative w-full pb-[100%]">
                          {category.image || getCategoryImage(Number(category.id)) ? (
                            <img
                              src={buildImageUrl(getCategoryImage(Number(category.id)) || category.image || '')}
                              alt={name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#592a26]/10 to-black/5" />
                          )}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/80 text-[#592a26] text-xs md:text-sm font-bold px-3 py-1 rounded-full border border-black/10 backdrop-blur-sm">
                            {name}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
            {/* عرض منتجات من كل تصنيف بنفس أسلوب المجموعات */}
            <div className="mt-10 space-y-8">
              {categories
                .filter((category) => {
                  const name = getCategoryName(category).toLowerCase();
                  return name !== 'ثيمات' && name !== 'themes';
                })
                .map((category) => {
                  const name = getCategoryName(category);
                  const to = `/category/${createCategorySlug(category.id, name)}`;
                  return (
                    <div key={category.id}>
                      <div className="flex items-end justify-between mb-3">
                        <h3 className="text-xl md:text-2xl font-extrabold text-black">{name}</h3>
                        <Link to={to} className="text-[#592a26] text-sm md:text-base">عرض الكل</Link>
                      </div>
                      <CategoryProductsPreview categoryId={category.id} limit={5} />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;