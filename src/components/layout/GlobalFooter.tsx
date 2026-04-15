// === بداية قسم: تصدير المكون ===
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from "../../assets/logo.png";
import tabbyLogo from "../../assets/tabby.png";
// === نهاية قسم: تصدير المكون ===

// === بداية قسم: المكون الرئيسي ===
const GlobalFooter: React.FC = () => {
  const { t } = useTranslation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // ✅ الروابط المهمة — بدون "من نحن"
  const importantLinks = [
    { to: "/privacy-policy", label: t('footer.privacy_policy', { defaultValue: 'سياسة الخصوصية' }) },
    { to: "/terms-and-conditions", label: t('footer.terms_conditions', { defaultValue: 'الشروط والأحكام' }) },
    { to: "/return-policy", label: t('footer.exchange_return', { defaultValue: 'الاستبدال والاسترجاع' }) },
    { to: "/products", label: t('footer.products', { defaultValue: 'المنتجات' }) },
  ];

  return (
    <>
      {/* === Footer رئيسي — بلون #592a26 === */}
      <footer className="bg-[#592a26] text-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* --- الشعار + وصف مختصر --- */}
            <div>
              <Link to="/" className="inline-block mb-2">
                <img src={logo} alt="Logo" className="h-24 object-contain" />
              </Link>
              <p className="text-xs text-gray-300 mt-1 max-w-xs">
                {t('footer.company_description_short', {
                  defaultValue: 'نقدم حلولاً احترافية للتسويق الرقمي.'
                })}
              </p>
            </div>

            {/* --- الروابط المهمة فقط (بدون "من نحن") --- */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-2">
                {t('footer.important_links', { defaultValue: 'روابط مهمة' })}
              </h4>
              <ul className="space-y-1 text-xs">
                {importantLinks.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.to}
                      className="inline-block py-0.5 text-gray-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* --- معلومات الاتصال + طرق الدفع --- */}
            <div>
              {/* --- طرق الدفع — أيقونات متجانسة ومرتبة --- */}
              <h4 className="font-semibold text-white text-sm mb-3">
                {t('footer.payment_methods', { defaultValue: 'طرق الدفع' })}
              </h4>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Visa */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 px-2.5 py-1.5 h-10 flex items-center justify-center min-w-[60px] transition-all hover:bg-white/20">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg"
                    alt="Visa"
                    className="h-4 object-contain"
                  />
                </div>
                
                {/* Mastercard */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 px-2.5 py-1.5 h-10 flex items-center justify-center min-w-[60px] transition-all hover:bg-white/20">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                    alt="Mastercard"
                    className="h-5 object-contain"
                  />
                </div>
                
                {/* Apple Pay */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 px-2.5 py-1.5 h-10 flex items-center justify-center min-w-[60px] transition-all hover:bg-white/20">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg"
                    alt="Apple Pay"
                    className="h-4 object-contain"
                  />
                </div>
                
                {/* Mada */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 px-2.5 py-1.5 h-10 flex items-center justify-center min-w-[60px] transition-all hover:bg-white/20">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/f/fb/Mada_Logo.svg"
                    alt="Mada"
                    className="h-4 object-contain"
                  />
                </div>
                
                {/* Tamara */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 px-2.5 py-1.5 h-10 flex items-center justify-center min-w-[70px] transition-all hover:bg-white/20">
                  <img 
                    src="https://cdn.prod.website-files.com/67c184892f7a84b971ff49d9/68931b49f2808979578bdc64_tamara-text-logo-black-en.svg"
                    alt="Tamara"
                    className="h-4 object-contain"
                  />
                </div>

                {/* Tabby */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 px-2.5 py-1.5 h-10 flex items-center justify-center min-w-[50px] transition-all hover:bg-white/20">
                  <img
                    src={tabbyLogo}
                    alt="Tabby"
                    className="h-5 object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* === حقوق النشر + زر Ufuq-Digital في نفس السطر (بدون ذكر اسم الشركة في النص) === */}
          <div className="border-t border-white/15 mt-8 pt-6">
            <div className="flex justify-between items-center gap-4 flex-nowrap">
              
              {/* حقوق النشر — بدون "Ufuq-Digital" */}
              <p className="text-white/60 text-xs sm:text-sm whitespace-nowrap">
                &copy; {new Date().getFullYear()} جميع الحقوق محفوظة
              </p>

              {/* زر CREATED BY UFUQ-DIGITAL — في الجهة الأخرى */}
              <a
                href="https://ufuq-digital.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] tracking-wider border border-white/20 px-3 py-1.5 rounded-full 
                           text-white/60 hover:text-white/80 hover:border-white/40 
                           transition-all duration-300 whitespace-nowrap"
              >
                CREATED BY UFUQ-DIGITAL
              </a>

            </div>
          </div>
        </div>
      </footer>

      {/* === زر التمرير للأعلى — فقط على الجوال (تم نقله إلى اليمين) === */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 w-9 h-9 bg-white text-[#592a26] rounded-full flex items-center justify-center shadow-md z-50 md:hidden"
          aria-label={t('footer.scroll_to_top', { defaultValue: 'العودة للأعلى' })}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </>
  );
};
// === نهاية قسم: المكون الرئيسي ===

export default GlobalFooter;
