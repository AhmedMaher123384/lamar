import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
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
  const { t, i18n } = useTranslation(); // ✅ استخدم t() للترجمة الدقيقة
  const isArabic = (i18n.language || 'en').startsWith('ar');
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('cachedCategories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
        console.error('Error fetching categories:', error);
      }
    };
    if (!categories || categories.length === 0) fetchCategories();
  }, []);

  // جلب أسماء المجموعات لعرض عنوان القسم باللغة الحالية
  const [latestAr, setLatestAr] = useState<string>('آخر العروض');
  const [latestEn, setLatestEn] = useState<string>('Latest Offers');
  const [whiteAr, setWhiteAr] = useState<string>('الجمعة البيضاء');
  const [whiteEn, setWhiteEn] = useState<string>('White Friday');

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const res = await apiCall(`${API_ENDPOINTS.COLLECTIONS}?active=true`);
        const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const norm = (s: any) => (typeof s === 'string' ? s : '').trim().toLowerCase();
        const findByAny = (targetAr: string) => {
          const target = norm(targetAr);
          return list.find((c: any) => {
            const ar = typeof c?.name === 'string' ? c?.name : c?.name?.ar || '';
            const en = typeof c?.name === 'string' ? c?.name : c?.name?.en || '';
            const nar = norm(ar);
            const nen = norm(en);
            return nar === target || nen === target || nar.includes(target) || nen.includes(target);
          });
        };

        const latest = findByAny('آخر العروض');
        if (latest) {
          const ar = typeof latest?.name === 'string' ? latest?.name : (latest?.name?.ar ?? '');
          const en = typeof latest?.name === 'string' ? latest?.name : (latest?.name?.en ?? '');
          setLatestAr(ar || latestAr);
          setLatestEn(en || latestEn);
        }

        const white = findByAny('الجمعة البيضاء');
        if (white) {
          const ar = typeof white?.name === 'string' ? white?.name : (white?.name?.ar ?? '');
          const en = typeof white?.name === 'string' ? white?.name : (white?.name?.en ?? '');
          setWhiteAr(ar || whiteAr);
          setWhiteEn(en || whiteEn);
        }
      } catch {}
    };
    loadCollections();
  }, [i18n.language]);

  return (
    <section className="bg-white py-12 md:py-16">
      <style>{`
        /* ألوان الهوية — متوافقة مع تفضيلاتك */
        .brand-accent { color: #592a26; }
        .brand-bg { background-color: #592a26; }
        .brand-border { border-color: #592a26; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* آخر العروض */}
        <div className="mb-12 md:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black" dir={isArabic ? 'rtl' : 'ltr'}>
                {isArabic ? (latestAr || 'آخر العروض') : (latestEn || 'Latest Offers')}
              </h2>
              <div className="h-1 w-24 bg-[#592a26] rounded-full mt-2"></div>
            </div>
          </div>
          <ArabicCollectionList arabicName="آخر العروض" limit={5} />
        </div>

        {/* الجمعة البيضاء */}
        <div className="mt-8 md:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black" dir={isArabic ? 'rtl' : 'ltr'}>
                {isArabic ? (whiteAr || 'الجمعة البيضاء') : (whiteEn || 'White Friday')}
              </h2>
              <div className="h-1 w-24 bg-[#592a26] rounded-full mt-2"></div>
            </div>
          </div>
          <ArabicCollectionList arabicName="الجمعة البيضاء" limit={5} />
          
          {/* صورة الهيرو */}
          <div className="mt-8 md:mt-12">
            <img src={heroImage} alt="عرض خاص" className="w-full h-auto block rounded-xl shadow-sm" />
          </div>

          {/* التصنيفات */}
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-black" dir={isArabic ? 'rtl' : 'ltr'}>
                  {isArabic ? 'الاقسام' : 'sections'}
                </h2>
                <div className="h-1 w-24 bg-[#592a26] rounded-full mt-2"></div>
              </div>
            </div>

            {/* شبكة التصنيفات */}
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
                      aria-label={`${t('استعراض تصنيف')} ${name}`}
                    >
                      <div className="relative rounded-xl overflow-hidden border border-black/10 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="relative w-full pb-[100%]">
                          {category.image || getCategoryImage(Number(category.id)) ? (
                            <img
                              src={buildImageUrl(getCategoryImage(Number(category.id)) || category.image || '')}
                              alt={name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#592a26]/10 to-black/5 flex items-center justify-center">
                              <span
                                dir="auto"
                                title={name}
                                className="inline-flex max-w-[90%] items-center justify-center text-[#592a26]/70 text-sm font-medium px-3 py-1 bg-white/60 rounded-xl backdrop-blur text-center leading-tight break-words"
                              >
                                {name}
                              </span>
                            </div>
                          )}
                          <div
                            dir="auto"
                            title={name}
                            className="absolute top-2 left-1/2 -translate-x-1/2 inline-flex max-w-[90%] items-center justify-center bg-white/80 text-[#592a26] text-xs md:text-sm font-bold px-3 py-1 rounded-xl border border-black/10 backdrop-blur-sm shadow-sm text-center leading-tight break-words"
                          >
                            {name}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>

            {/* عرض منتجات كل تصنيف — مع "عرض الكل" المُحسّن */}
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
                    <div key={category.id} className="border-t border-black/5 pt-6">
                      <div className="flex items-end justify-between mb-4">
                        <h3 className="text-xl md:text-2xl font-extrabold text-black">{name}</h3>
                        <Link
                          to={to}
                          className="group flex items-center gap-1.5 text-[#592a26] font-semibold text-sm md:text-base transition-all duration-200 hover:text-[#7a3a35] hover:translate-x-0.5"
                          aria-label={
                            i18n.language === 'ar'
                              ? `عرض جميع منتجات ${name}`
                              : `View all products in ${name}`
                          }
                        >
                          {i18n.language === 'ar' ? (
                            <>
                              {t('عرض الكل')}
                              <FaArrowLeft
                                className="text-xs mt-0.5 group-hover:-translate-x-0.5 transition-transform duration-200"
                                aria-hidden="true"
                              />
                            </>
                          ) : (
                            <>
                              <FaArrowRight
                                className="text-xs mt-0.5 group-hover:translate-x-0.5 transition-transform duration-200"
                                aria-hidden="true"
                              />
                              {t('View All')}
                            </>
                          )}
                          <span className="sr-only"> — {name}</span>
                        </Link>
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