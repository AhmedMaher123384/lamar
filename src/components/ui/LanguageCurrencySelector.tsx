import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency, Currency } from '../../contexts/CurrencyContext';
import { ChevronDown, Check, Languages, DollarSign } from 'lucide-react';

interface LanguageCurrencySelectorProps {
  variant?: 'default' | 'mobileMaroon' | 'desktopMaroon';
}

const LanguageCurrencySelector: React.FC<LanguageCurrencySelectorProps> = ({ variant = 'default' }) => {
  const { t, i18n } = useTranslation();
  const { currentCurrency, setCurrency, currencies, getCurrentCurrencySymbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>('language');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    document.documentElement.lang = langCode;
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('selectedLanguage', langCode);
    setIsOpen(false);
  };

  const changeCurrency = (currency: Currency) => {
    setCurrency(currency);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          variant === 'mobileMaroon'
            ? 'relative text-black p-2 rounded-xl border border-[#592a26]/30 bg-white hover:bg-[#592a26]/10 transition-all duration-300 group flex items-center gap-1.5'
            : variant === 'desktopMaroon'
              ? 'relative text-white p-2 rounded-xl border border-[#592a26]/30 hover:bg-[#592a26]/10 transition-all duration-300 group flex items-center gap-1.5'
              : 'relative text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group flex items-center gap-1.5'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-base">{currentLanguage.flag}</span>
          <span className={`${variant === 'mobileMaroon' ? 'text-black' : 'text-white/90'} text-xs font-medium hidden sm:block`}>{currentLanguage.code.toUpperCase()}</span>
          <span className={`${variant === 'mobileMaroon' ? 'text-black/40' : 'text-white/40'} hidden sm:block`}>•</span>
          <span className={`${variant === 'mobileMaroon' || variant === 'desktopMaroon' ? 'text-[#592a26]' : 'text-cyan-300'} text-xs font-medium`}>{getCurrentCurrencySymbol()}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-all duration-300 ${
          variant === 'mobileMaroon'
            ? `text-black ${isOpen ? 'rotate-180 text-[#592a26]' : ''}`
            : variant === 'desktopMaroon'
              ? `text-white/70 ${isOpen ? 'rotate-180 text-[#592a26]' : ''}`
              : `text-white/70 ${isOpen ? 'rotate-180 text-cyan-300' : ''}`
        }`} />
      </button>

      {/* Compact Dropdown */}
      {isOpen && (
        <div className={`${
          variant === 'mobileMaroon'
            ? 'absolute top-full mt-2 right-0 w-56 bg-white rounded-lg shadow-2xl border border-[#592a26]/30 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300'
            : variant === 'desktopMaroon'
              ? 'absolute top-full mt-2 right-0 w-56 bg-white rounded-lg shadow-2xl border border-[#592a26]/30 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300'
              : 'absolute top-full mt-2 right-0 w-56 bg-white/10 backdrop-blur-2xl rounded-lg shadow-2xl border border-white/20 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300'
        }`}>
          {/* Simple Tabs */}
          <div className={`flex ${variant === 'mobileMaroon' || variant === 'desktopMaroon' ? 'border-b border-[#592a26]/20' : 'border-b border-white/15'}`}>
            <button
              onClick={() => setActiveTab('language')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-all duration-300 ${
                variant === 'mobileMaroon'
                  ? activeTab === 'language'
                    ? 'bg-[#592a26]/10 text-black border-b-2 border-[#592a26]'
                    : 'text-black/80 hover:text-black hover:bg-[#592a26]/5'
                  : activeTab === 'language'
                    ? 'bg-white/10 text-white border-b-2 border-cyan-400'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Languages className={`w-3 h-3 mx-auto mb-1 ${variant === 'mobileMaroon' || variant === 'desktopMaroon' ? 'text-[#592a26]' : ''}`} />
              {t('common.language', 'اللغة')}
            </button>
            <button
              onClick={() => setActiveTab('currency')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-all duration-300 ${
                variant === 'mobileMaroon'
                  ? activeTab === 'currency'
                    ? 'bg-[#592a26]/10 text-black border-b-2 border-[#592a26]'
                    : 'text-black/80 hover:text-black hover:bg-[#592a26]/5'
                  : activeTab === 'currency'
                    ? 'bg-white/10 text-white border-b-2 border-cyan-400'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className={`w-3 h-3 mx-auto mb-1 ${variant === 'mobileMaroon' || variant === 'desktopMaroon' ? 'text-[#592a26]' : ''}`} />
              {t('common.currency', 'العملة')}
            </button>
          </div>

          {/* Compact Content */}
          <div className="max-h-48 overflow-y-auto">
            {activeTab === 'language' && (
              <div className="p-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-300 mb-1 ${
                      variant === 'mobileMaroon' || variant === 'desktopMaroon'
                        ? currentLanguage.code === language.code
                          ? 'bg-[#592a26]/10 text-black border border-[#592a26]/30'
                          : 'text-black hover:bg-[#592a26]/10'
                        : currentLanguage.code === language.code
                          ? 'bg-cyan-500/20 text-white'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${variant === 'mobileMaroon' ? 'text-black' : ''}`}>{language.nativeName}</div>
                    </div>
                    {currentLanguage.code === language.code && (
                      <Check className={`w-3 h-3 ${variant === 'mobileMaroon' || variant === 'desktopMaroon' ? 'text-[#592a26]' : 'text-cyan-400'}`} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'currency' && (
              <div className="p-2">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => changeCurrency(currency)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-300 mb-1 ${
                      variant === 'mobileMaroon' || variant === 'desktopMaroon'
                        ? currentCurrency.code === currency.code
                          ? 'bg-[#592a26]/10 text-black border border-[#592a26]/30'
                          : 'text-black hover:bg-[#592a26]/10'
                        : currentCurrency.code === currency.code
                          ? 'bg-cyan-500/20 text-white'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded text-sm font-bold ${variant === 'mobileMaroon' || variant === 'desktopMaroon' ? 'bg-[#592a26]/10 text-[#592a26]' : 'bg-white/10 text-cyan-300'}`}>
                      {i18n.language === 'ar' ? currency.symbol : currency.symbolEn}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${variant === 'mobileMaroon' || variant === 'desktopMaroon' ? 'text-black' : ''}`}>{i18n.language === 'ar' ? currency.nameAr : currency.name}</div>
                    </div>
                    {currentCurrency.code === currency.code && (
                      <Check className={`w-3 h-3 ${variant === 'mobileMaroon' || variant === 'desktopMaroon' ? 'text-[#592a26]' : 'text-cyan-400'}`} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageCurrencySelector;