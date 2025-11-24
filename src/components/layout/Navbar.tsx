import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { Menu, X, ShoppingCart, Heart, User, LogOut, ChevronDown, Package, Home, Grid3X3 } from 'lucide-react';
import logo from '../../assets/logo.png';
import AuthModal from '../modals/AuthModal';
import CartDropdown from '../ui/CartDropdown';
import LiveSearch from '../ui/LiveSearch';
import LanguageCurrencySelector from '../ui/LanguageCurrencySelector';
import { createCategorySlug } from '../../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import CategoryCollectionBar from './CategoryCollectionBar';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

function Navbar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null); // ⭐ لحساب مركز الزر
  const location = useLocation();
  const navigate = useNavigate();

  const getInitials = (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Control navbar visibility based on scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setScrolled(false);
        setShowNavbar(true);
      } else {
        setScrolled(true);
        if (isLogoHovered) {
          setShowNavbar(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowNavbar(false);
        } else if (currentScrollY < lastScrollY) {
          setShowNavbar(true);
        }
      }
      setLastScrollY(currentScrollY);
    };
    const throttledControlNavbar = throttle(controlNavbar, 10);
    window.addEventListener('scroll', throttledControlNavbar);
    return () => window.removeEventListener('scroll', throttledControlNavbar);
  }, [lastScrollY, isLogoHovered]);

  useEffect(() => {
    if (isLogoHovered && scrolled) setShowNavbar(true);
  }, [isLogoHovered, scrolled]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setTimeout(() => {
          if (!isCartHovered) setIsCartDropdownOpen(false);
        }, 400);
      }
    };
    if (isUserMenuOpen || isCartDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isCartDropdownOpen, isCartHovered]);

  // 👇 تمت إزالة useEffect الخاص بـ overlay + body overflow (لأننا نستخدم circular reveal بدون overlay داكن)

  useEffect(() => {
    if (isMenuOpen) setShowNavbar(false);
    else setShowNavbar(true);
  }, [isMenuOpen]);

  const throttle = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: number | null = null;
    let lastExecTime = 0;
    return (...args: any[]) => {
      const currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    fetchCategories();

    const handleCartUpdate = () => fetchCartCount();
    const handleCartCountChange = () => {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const cartItems = JSON.parse(localCart);
          if (Array.isArray(cartItems)) {
            const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
            const userData = localStorage.getItem('user');
            if (userData) setTimeout(() => fetchCartCount(), 100);
            return;
          }
        } catch { /* ignore */ }
      }
      const userData = localStorage.getItem('user');
      if (userData) fetchCartCount();
      else setCartItemsCount(0);
    };
    const handleWishlistUpdate = () => fetchWishlistCount();
    const handleCategoriesUpdate = () => fetchCategories();

    const cartEvents = ['cartUpdated', 'productAddedToCart', 'forceCartUpdate'];
    const cartCountEvents = ['cartCountChanged'];
    const wishlistEvents = ['wishlistUpdated', 'productAddedToWishlist', 'productRemovedFromWishlist', 'wishlistCleared'];

    cartEvents.forEach(event => window.addEventListener(event, handleCartUpdate));
    cartCountEvents.forEach(event => window.addEventListener(event, handleCartCountChange));
    wishlistEvents.forEach(event => window.addEventListener(event, handleWishlistUpdate));
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartUpdated' || e.key === 'lastCartUpdate' || e.key === 'forceCartRefresh') handleCartUpdate();
      if (e.key === 'wishlistUpdated' || e.key === 'lastWishlistUpdate') handleWishlistUpdate();
    };
    window.addEventListener('storage', handleStorageChange);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      const savedCartCount = localStorage.getItem(`cartCount_${user.id}`);
      const savedWishlistCount = localStorage.getItem(`wishlistCount_${user.id}`);
      if (savedCartCount) setCartItemsCount(parseInt(savedCartCount));
      if (savedWishlistCount) setWishlistItemsCount(parseInt(savedWishlistCount));
    } else {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          setWishlistItemsCount(Array.isArray(parsedWishlist) ? parsedWishlist.length : 0);
        } catch { setWishlistItemsCount(0); }
      } else setWishlistItemsCount(0);
    }

    return () => {
      cartEvents.forEach(event => window.removeEventListener(event, handleCartUpdate));
      cartCountEvents.forEach(event => window.removeEventListener(event, handleCartCountChange));
      wishlistEvents.forEach(event => window.removeEventListener(event, handleWishlistUpdate));
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          try {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems)) {
              const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartItemsCount(totalItems);
              localStorage.setItem('lastCartCount', totalItems.toString());
              return;
            }
          } catch { /* ignore */ }
        }
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        return;
      }

      const user = JSON.parse(userData);
      if (!user?.id) {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          try {
            const cartItems = JSON.parse(localCart);
            if (Array.isArray(cartItems)) {
              const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              setCartItemsCount(totalItems);
              return;
            }
          } catch { /* ignore */ }
        }
        setCartItemsCount(0);
        return;
      }

      const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
      let totalItems = 0;
      if (Array.isArray(data)) {
        totalItems = data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      } else if (data && typeof data === 'object' && Array.isArray(data.cart)) {
        totalItems = data.cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      } else if (data && typeof data === 'object' && typeof data.totalItems === 'number') {
        totalItems = data.totalItems;
      }
      setCartItemsCount(totalItems);
      localStorage.setItem('lastCartCount', totalItems.toString());
      localStorage.setItem(`cartCount_${user.id}`, totalItems.toString());
    } catch (error) {
      console.error('Error fetching cart count:', error);
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const cartItems = JSON.parse(localCart);
          if (Array.isArray(cartItems)) {
            const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
            return;
          }
        } catch { /* ignore */ }
      }
      setCartItemsCount(0);
      localStorage.setItem('lastCartCount', '0');
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      let wishlistCount = 0;
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          wishlistCount = Array.isArray(parsedWishlist) ? parsedWishlist.length : 0;
        } catch { /* ignore */ }
      }
      setWishlistItemsCount(wishlistCount);
      localStorage.setItem('lastWishlistCount', wishlistCount.toString());
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) localStorage.setItem(`wishlistCount_${user.id}`, wishlistCount.toString());
        } catch { /* ignore */ }
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      setWishlistItemsCount(0);
      localStorage.setItem('lastWishlistCount', '0');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      const filteredCategories = data.filter((category: Category) => category.name !== 'ثيمات');
      setCategories(filteredCategories);
      localStorage.setItem('cachedCategories', JSON.stringify(filteredCategories));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    smartToast.frontend.success(`مرحباً بك ${userData.firstName}! 🎉`);
  };

  const handleLogout = () => {
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('user');
    if (currentUser?.id) {
      localStorage.removeItem(`cartCount_${currentUser.id}`);
      localStorage.removeItem(`wishlistCount_${currentUser.id}`);
    }
    setIsUserMenuOpen(false);
    setCartItemsCount(0);
    setWishlistItemsCount(0);
    navigate('/');
    smartToast.frontend.success('تم تسجيل الخروج بنجاح');
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  // 🧱 Circular Reveal: حساب موقع الزر لمركز التوسع
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0, radius: 0 });

  const openMenuWithCircularReveal = () => {
    if (menuButtonRef.current) {
      const buttonRect = menuButtonRef.current.getBoundingClientRect();
      const x = buttonRect.left + buttonRect.width / 2;
      const y = buttonRect.top + buttonRect.height / 2;
      const radius = Math.max(
        window.innerWidth,
        window.innerHeight
      ) * 1.2; // دائرة كبيرة كفاية لتغطي الشاشة

      setCirclePosition({ x, y, radius });
      setTimeout(() => setIsMenuOpen(true), 10);
    } else {
      setIsMenuOpen(true); // fallback
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`sticky top-0 w-full z-50 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="px-0">
          <div className="relative w-full transition-all duration-300 ease-out bg-[#592a26] text-white border-b border-[#592a26] shadow-md">
            <div className="flex lg:grid lg:grid-cols-3 items-center justify-between h-16 sm:h-20 lg:h-24 px-4 sm:px-6">
              {/* Mobile Menu Button & Cart */}
              <div className="lg:hidden flex items-center space-x-3">
                <button
                  ref={menuButtonRef}
                  onClick={openMenuWithCircularReveal}
                  className="text-white p-2 sm:p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm touch-manipulation relative overflow-hidden group"
                  aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                >
                  <div className="relative z-10">
                    {isMenuOpen ? <X size={22} className="sm:w-[24px] sm:h-[24px]" /> : <Menu size={22} className="sm:w-[24px] sm:h-[24px]" />}
                  </div>
                  <div className="absolute inset-0 bg-white/5 scale-0 group-active:scale-100 transition-transform duration-150 rounded-xl"></div>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsCartDropdownOpen(!isCartDropdownOpen)}
                    className="relative text-white p-2 sm:p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm touch-manipulation group"
                    aria-label="سلة التسوق"
                  >
                    <ShoppingCart size={22} className="sm:w-[24px] sm:h-[24px]" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-[#592a26] border border-[#592a26]/30 rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-semibold shadow-sm">
                        {cartItemsCount}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-white/5 scale-0 group-active:scale-100 transition-transform duration-150 rounded-xl"></div>
                  </button>
                  {isCartDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 z-50">
                      <CartDropdown
                        isOpen={isCartDropdownOpen}
                        onClose={() => setIsCartDropdownOpen(false)}
                        onHoverChange={(isHovered) => setIsCartHovered(isHovered)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Logo */}
              <div className="flex items-center gap-3 lg:col-start-1 lg:justify-self-start">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="cursor-pointer">
                  <img src={logo} alt="Logo" className="h-12 sm:h-16 lg:h-20 w-auto" />
                </Link>
              </div>

              {/* Center Search (desktop) */}
              <div className="hidden lg:flex lg:col-start-2 justify-center px-4">
                <div className="w-full max-w-2xl mx-auto">
                  <LiveSearch triggerVariant="bar" />
                </div>
              </div>

              {/* Action Buttons (right) */}
              <div className="hidden lg:flex items-center space-x-2 lg:col-start-3 lg:justify-self-end">
                <div className="transform scale-75 sm:scale-90 origin-right">
                  <LanguageCurrencySelector />
                </div>

                {/* Cart Button */}
                <div className="relative" ref={cartDropdownRef}>
                  <button
                    onClick={() => setIsCartDropdownOpen(!isCartDropdownOpen)}
                    className="relative text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                  >
                    <ShoppingCart size={20} />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-[#592a26] border border-[#592a26]/30 rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-semibold shadow-sm">
                        {cartItemsCount}
                      </span>
                    )}
                    <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <div className="absolute top-full left-0 mt-2 z-50 translate-x-4">
                    <CartDropdown
                      isOpen={isCartDropdownOpen}
                      onClose={() => setIsCartDropdownOpen(false)}
                      onHoverChange={setIsCartHovered}
                    />
                  </div>
                </div>

                {/* Wishlist */}
                <Link to="/wishlist" className="relative text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                  <Heart size={20} />
                  {wishlistItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-[#592a26] border border-[#592a26]/30 rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-semibold shadow-sm">
                      {wishlistItemsCount}
                    </span>
                  )}
                  <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                {/* User Menu */}
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center text-white/90 hover:text-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-white/10 transition-all duration-300 gap-2 md:gap-3 group"
                    >
                      <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-[#18b5d8] to-[#0891b2] rounded-md md:rounded-lg flex items-center justify-center">
                        <User size={14} className="md:w-4 md:h-4" />
                      </div>
                      <span className="text-xs md:text-sm font-medium hidden md:inline">{user.name?.split(' ')[0] || user.firstName || t('nav.profile')}</span>
                      <span className="text-xs md:text-sm font-medium md:hidden">{getInitials(user.name || user.firstName || t('nav.profile'))}</span>
                      <ChevronDown size={14} className={`md:w-4 md:h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute left-0 md:right-0 mt-2 w-36 md:w-56 max-w-[calc(100vw-0.5rem)] bg-white/10 backdrop-blur-2xl rounded-lg md:rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[70]">
                        <div className="p-1 md:p-2 space-y-0.5 md:space-y-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-2 md:px-4 py-1.5 md:py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-md md:rounded-xl transition-all duration-200 gap-1.5 md:gap-3"
                          >
                            <User size={14} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
                            <span className="text-xs md:text-base truncate">{t('nav.profile')}</span>
                          </Link>
                          <div className="border-t border-white/10 my-0.5 md:my-2"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-2 md:px-4 py-1.5 md:py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md md:rounded-xl transition-all duration-200 gap-1.5 md:gap-3"
                          >
                            <LogOut size={14} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
                            <span className="text-xs md:text-base truncate">{t('nav.logout')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={openAuthModal}
                    aria-label={t('nav.login')}
                    className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full text-white hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Bar */}
            <div className="hidden md:block w-full">
              <CategoryCollectionBar variant="navbar" />
            </div>

            {/* Discount Bar */}
            <div className="w-full bg-[#592a26] text-white text-center py-1 text-sm font-semibold tracking-wide">
              خصومات ٣٠ ٪ بمناسبة  العيد الوطني ال 95
            </div>
          </div>
        </div>
      </nav>

      {/* 🧱 CIRCULAR REVEAL MOBILE MENU */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[60] pointer-events-none"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Circular mask */}
          <div
            className="absolute inset-0 bg-white pointer-events-auto transition-all duration-500 ease-out"
            style={{
              clipPath: `circle(${circlePosition.radius}px at ${circlePosition.x}px ${circlePosition.y}px)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel content */}
            <div className="h-full flex flex-col">
              {/* 🔷 Header: لون #592a26 خلفية + لوجو أبيض */}
              <div className="bg-[#592a26] px-4 py-3 flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center"
                >
                  <img src={logo} alt="Logo" className="h-8 w-auto" />
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white/90 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="إغلاق القائمة"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 🔸 Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* User Section */}
                {user ? (
                  <div className="bg-[#592a26]/5 p-3 rounded-lg border border-[#592a26]/20">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#592a26] flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(user.name || user.firstName || '')}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {user.name?.split(' ')[0] || user.firstName}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-sm text-[#592a26] hover:text-[#592a26]/80 font-medium py-1.5 px-2 rounded flex items-center"
                      >
                        <User size={14} className="ml-1 rtl:mr-1" />
                        {t('nav.profile')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-sm text-red-600 hover:text-red-700 font-medium py-1.5 px-2 rounded flex items-center"
                      >
                        <LogOut size={14} className="ml-1 rtl:mr-1" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={openAuthModal}
                    className="w-full bg-[#592a26] hover:bg-[#592a26]/90 text-white py-2.5 rounded-lg font-medium transition-colors"
                  >
                    {t('nav.login')}
                  </button>
                )}

                {/* Search & Lang */}
                <div className="space-y-3">
                  <div className="border-t border-gray-200 pt-3">
                    <LiveSearch triggerVariant="icon" />
                  </div>
                  <div className="flex justify-center">
                    <LanguageCurrencySelector />
                  </div>
                </div>

                {/* 🔹 Navigation Links — بدون theme/blog/contact */}
                <div className="space-y-2">
                  {[
                    { name: t('nav.home'), href: '/', icon: Home },
                    { name: t('nav.products'), href: '/products', icon: Grid3X3 },
                    { name: t('nav.categories'), href: '/categories', icon: Package },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-gray-700 font-medium ${
                        isActive(link.href)
                          ? 'bg-[#592a26]/10 text-[#592a26]'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <link.icon size={16} className="ml-2 rtl:mr-2 flex-shrink-0" />
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* 🔸 Quick Actions */}
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium"
                  >
                    <span className="flex items-center">
                      <Heart size={16} className="ml-2 rtl:mr-2" />
                      {t('nav.wishlist')}
                    </span>
                    {wishlistItemsCount > 0 && (
                      <span className="bg-[#592a26] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {wishlistItemsCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Navbar;