import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    const res = await addToCart(product._id, 1, product.variants[0]?.color || '', product.variants[0]?.material || product.material, product.discountPrice || product.price);
    if (res.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(res.message);
    }
  };

  const cardStyles = {
    container: {
      position: 'relative',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      transition: 'all var(--transition-normal)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    imgContainer: {
      position: 'relative',
      height: '240px',
      overflow: 'hidden',
      backgroundColor: 'var(--color-surface-soft)',
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform var(--transition-slow)',
    },
    badge: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      backgroundColor: 'var(--color-error)',
      color: '#FFFFFF',
      padding: '4px 8px',
      fontSize: '11px',
      fontWeight: 'bold',
      borderRadius: 'var(--radius-sm)',
    },
    wishlistBtn: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: 'var(--radius-full)',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-sm)',
      color: 'var(--color-text-muted)',
      transition: 'all var(--transition-fast)',
    },
    info: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
    category: {
      fontSize: '12px',
      color: 'var(--color-text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '4px',
    },
    name: {
      fontFamily: 'var(--font-primary)',
      fontSize: '16px',
      fontWeight: 600,
      color: 'var(--color-secondary)',
      marginBottom: '8px',
      lineHeight: '1.4',
    },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '13px',
      color: 'var(--color-warning)',
      marginBottom: '12px',
    },
    priceRow: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px',
      marginTop: 'auto',
    },
    price: {
      fontSize: '18px',
      fontWeight: 700,
      color: 'var(--color-primary)',
    },
    oldPrice: {
      fontSize: '14px',
      textDecoration: 'line-through',
      color: 'var(--color-text-muted)',
    },
    cartBtn: {
      backgroundColor: 'var(--color-secondary)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      padding: '8px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color var(--transition-fast)',
      marginLeft: 'auto',
    },
  };

  return (
    <div style={cardStyles.container} className="hover-scale">
      <Link to={`/product/${product.slug}`} style={cardStyles.imgContainer}>
        <img
          src={product.images[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          style={cardStyles.img}
          className="product-img"
        />
        {product.discountPercent > 0 && (
          <span style={cardStyles.badge}>-{product.discountPercent}%</span>
        )}
        <button style={cardStyles.wishlistBtn} onClick={(e) => { e.preventDefault(); toast.success('Added to Wishlist!'); }} title="Add to wishlist">
          <Heart size={18} />
        </button>
      </Link>

      <div style={cardStyles.info}>
        <span style={cardStyles.category}>{product.category?.name || 'Furniture'}</span>
        <Link to={`/product/${product.slug}`}>
          <h4 style={cardStyles.name}>{product.name}</h4>
        </Link>

        <div style={cardStyles.ratingRow}>
          <Star size={14} fill="currentColor" />
          <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
            {product.ratings?.average || 4.5}
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>
            ({product.ratings?.count || 12})
          </span>
        </div>

        <div style={cardStyles.priceRow}>
          {product.discountPrice > 0 ? (
            <>
              <span style={cardStyles.price}>PKR {product.discountPrice}</span>
              <span style={cardStyles.oldPrice}>PKR {product.price}</span>
            </>
          ) : (
            <span style={cardStyles.price}>PKR {product.price}</span>
          )}

          <button style={cardStyles.cartBtn} onClick={handleAddToCart} title="Add to Cart">
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
