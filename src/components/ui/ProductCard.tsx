import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { Heart, ShoppingCart, CheckCircle } from 'lucide-react';
import { createProductSlug } from '../../utils/slugify';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from '../../utils/cartUtils';
import { buildImageUrl } from '../../config/api';
import { PRODUCT_PLACEHOLDER_SRC } from '../../utils/placeholders';
import PriceDisplay from '../ui/PriceDisplay';

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

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { t, i18n } = useTranslation(['product_card', 'product', 'common']);
  const isRTL = i18n.language === 'ar';
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigate = useNavigate();

  const getLocalizedContent = (field: 'name' | 'description') => {
    const currentLang = i18n.language;
    const arField = `${field}_ar` as keyof Product;
    const enField = `${field}_en` as keyof Product;
    if (currentLang === 'ar') {
      return (product[arField] as string) || product[field] || (product[enField] as string);
    } else {
      return (product[enField] as string) || product[field] || (product[arField] as string);
    }
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [product.id]);

  useEffect(() => {
    const handleWishlistUpdate = (event: any) => {
      if (event.detail && Array.isArray(event.detail)) {
        setIsInWishlist(event.detail.includes(product.id));
      } else {
        checkWishlistStatus();
      }
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product.id]);

  const truncateDescription = (text: string, maxWords: number = 5): string => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + ' ...';
  };

  const checkWishlistStatus = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setIsInWishlist(parsedWishlist.includes(product.id));
        }
      }
    } catch (error) {
      console.error(t('product_card.wishlist_error'), error);
      setIsInWishlist(false);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInWishlist) {
        const success = await removeFromWishlistUnified(product.id, getLocalizedContent('name'));
        if (success) setIsInWishlist(false);
      } else {
        const success = await addToWishlistUnified(product.id, getLocalizedContent('name'));
        if (success) setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      smartToast.frontend.error(t('product.wishlist_error'));
    }
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.hasRequiredOptions) {
      const productPath = `/product/${createProductSlug(product.id, getLocalizedContent('name'))}`;
      navigate(productPath);
      smartToast.frontend.info(t('product.select_options_first', { name: getLocalizedContent('name') }));
      return;
    }
    try {
      const success = await addToCartUnified(product.id, getLocalizedContent('name'), quantity);
      if (!success) {
        smartToast.frontend.error(t('product.add_to_cart_failed'));
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      smartToast.frontend.error(t('product.add_to_cart_error'));
    }
  };

  const increaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < 99) setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productPath = `/product/${createProductSlug(product.id, getLocalizedContent('name'))}`;
    navigate(productPath);
  };

  // Use final price from product data only (no extra discount applied)
  const effectivePrice = product.price;
  const hasDiscount = false;
  const discountPercent = 0;

  // ======================= LIST VIEW =======================
  if (viewMode === 'list') {
    return (
      <Link
        to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
        className={`block bg-white rounded-xl border border-gray-200 shadow-sm w-full overflow-hidden ${
          isRTL ? 'text-right' : 'text-left'
        }`}
        onClick={handleProductClick}
        aria-label={t('product.view_product_details', { name: getLocalizedContent('name') })}
      >
        {/* ======== العناصر الثابتة في الأعلى: خصم (يسار) + قلب (يمين) ======== */}
        <div className="relative">
          {/* Discount Ribbon — Corner edge strip (not full width) */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <div className="rounded-full bg-[#c53030] text-white text-[12px] font-semibold px-2.5 py-1 shadow-sm">
                -{discountPercent}%
              </div>
            </div>
          )}

          {/* Wishlist Button — Top RIGHT (ثابت، لا يتأثر بـ RTL) */}
          <button
            onClick={toggleWishlist}
            className={`absolute top-1 right-1 p-1.5 rounded-full ${
              isInWishlist ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-white/80'
            } hover:bg-gray-100 z-20 transition-colors duration-150`}
            type="button"
            aria-label={isInWishlist ? t('common.removeFromWishlist') : t('common.addToWishlist')}
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex p-4 gap-4">
          {/* Image — full space */}
          <div className="flex-shrink-0 w-24 h-24">
            <div className="w-full h-full rounded-lg overflow-hidden">
              <img
                src={buildImageUrl(product.mainImage)}
                alt={getLocalizedContent('name')}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = PRODUCT_PLACEHOLDER_SRC;
                }}
              />
            </div>
            {product.isAvailable === false && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                <span className="text-white font-bold bg-red-600 px-2 py-1 rounded text-xs">
                  {t('common.outOfStock')}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              dir={isRTL ? 'rtl' : 'ltr'}
              className="text-lg font-bold text-gray-900 line-clamp-2"
            >
              {getLocalizedContent('name')}
            </h3>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              <span className="md:hidden">
                {truncateDescription(
                  getLocalizedContent('description') ||
                    `${t('common.discover')} ${getLocalizedContent('name')} ${t('common.highQuality')}`,
                  4
                )}
              </span>
              <span className="hidden md:inline">
                {truncateDescription(
                  getLocalizedContent('description') ||
                    `${t('common.discover')} ${getLocalizedContent('name')} ${t('common.highQuality')}`,
                  5
                )}
              </span>
            </p>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div>
                  {/* Show final price only */}
                  <PriceDisplay price={product.price} size="sm" variant="card" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span
                  className={`text-sm font-medium ${
                    product.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.isAvailable ? t('available') : t('unavailable')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {product.isAvailable && (
            <div className="flex-shrink-0 flex flex-col items-end gap-2 w-24">
              <div className="flex items-center gap-1">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-7 h-7 rounded border border-gray-300 bg-white text-gray-700 flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium text-gray-800 bg-gray-50 rounded py-1">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= 99}
                  className="w-7 h-7 rounded border border-gray-300 bg-white text-gray-700 flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              <button
                onClick={addToCart}
                className="flex items-center justify-center gap-1 bg-[#592a26] text-white px-3 py-1.5 rounded-md text-sm font-medium w-full"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('addToCart')}</span>
              </button>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // ======================= GRID VIEW =======================
  return (
    <Link
      to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
      className={`block bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-xs ${
        isRTL ? 'text-right' : 'text-left'
      }`}
      onClick={handleProductClick}
      aria-label={t('product.view_product_details', { name: getLocalizedContent('name') })}
    >
      <div className="relative">
        {/* ======== العناصر الثابتة في الأعلى: خصم (شريط مائل على الحافة) + قلب (يمين) ======== */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <div className="rounded-full bg-[#c53030] text-white text-[12px] font-semibold px-2.5 py-1 shadow-sm">
              -{discountPercent}%
            </div>
          </div>
        )}

        {/* Wishlist Button — Top RIGHT (ثابت، لا يتأثر بـ RTL) */}
        <button
          onClick={toggleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full ${
            isInWishlist ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-white/80'
          } hover:bg-gray-100 z-20 transition-colors duration-150`}
          type="button"
          aria-label={isInWishlist ? t('product_card.remove_from_wishlist') : t('product_card.add_to_wishlist')}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Image — full space, no padding, no margin */}
        <div className="aspect-square w-full overflow-hidden rounded-t-xl">
          <img
            src={buildImageUrl(product.mainImage)}
            alt={getLocalizedContent('name')}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = PRODUCT_PLACEHOLDER_SRC;
            }}
          />
        </div>

        {/* Out of Stock Overlay */}
        {product.isAvailable === false && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-t-xl">
            <span className="text-white font-bold bg-red-600 px-3 py-1.5 rounded text-sm">
              {t('common.outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          dir={isRTL ? 'rtl' : 'ltr'}
          className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2"
        >
          {getLocalizedContent('name')}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          <span className="md:hidden">
            {truncateDescription(
              getLocalizedContent('description') ||
                `${t('common.discover')} ${getLocalizedContent('name')} ${t('common.highQuality')}`,
              4
            )}
          </span>
          <span className="hidden md:inline">
            {truncateDescription(
              getLocalizedContent('description') ||
                `${t('common.discover')} ${getLocalizedContent('name')} ${t('common.highQuality')}`,
              5
            )}
          </span>
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            {/* Show final price only */}
            <PriceDisplay price={product.price} size="sm" variant="card" />
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span
              className={`text-sm font-medium ${
                product.isAvailable ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {product.isAvailable ? t('available') : t('unavailable')}
            </span>
          </div>
        </div>

        {/* Add to Cart Section */}
        {product.isAvailable && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-10 text-center font-medium text-gray-800 bg-gray-100 rounded py-1">
                {quantity}
              </span>
              <button
                onClick={increaseQuantity}
                disabled={quantity >= 99}
                className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            <button
              onClick={addToCart}
              className="w-full flex items-center justify-center gap-2 bg-[#592a26] text-white py-2.5 rounded-md text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('addToCart')}</span>
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};


export default ProductCard;