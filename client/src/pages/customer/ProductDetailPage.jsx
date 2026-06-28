import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { Star, Truck, ShieldCheck, Heart, ShoppingCart, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        if (data.success) {
          setProduct(data.product);
          if (data.product.variants?.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
          
          // Load product reviews
          const reviewRes = await api.get(`/reviews/${data.product._id}`);
          if (reviewRes.data.success) {
            setReviews(reviewRes.data.reviews);
          }
        }
      } catch (error) {
        console.error('Failed to load product detail', error);
        // Setup mock detailed product
        const mockProduct = {
          _id: 'mockdetail',
          name: 'Premium Velvet Chesterfield Sofa',
          slug: 'velvet-chesterfield-sofa',
          description: 'Bring luxurious sophistication to your living room with this classic Velvet Chesterfield Sofa. Crafted from premium solid sheesham wood framework, it features deep button tufting, scroll arms, and high-density foam filling for unmatched comfort and style. Includes two matching throw pillows.',
          price: 125000,
          discountPrice: 110000,
          discountPercent: 12,
          stock: 5,
          material: 'Velvet Framework & Solid Wood Frame',
          finish: 'Dark Walnut Finish Legs',
          assemblyRequired: true,
          deliveryDays: 5,
          deliveryCharge: 1500,
          ratings: { average: 4.8, count: 24 },
          dimensions: { length: 210, width: 90, height: 85, weight: 45 },
          images: [
            { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', publicId: 'img1' },
            { url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80', publicId: 'img2' },
          ],
          vendor: {
            shopName: 'Heritage Woodcrafts',
            rating: 4.9,
            totalReviews: 86,
            shopDescription: 'Artisans of solid wood carving and upholstery since 1994.',
          },
          variants: [
            { color: '#0F2C59', colorName: 'Royal Blue Velvet', stock: 3 },
            { color: '#2B4A3F', colorName: 'Forest Green Velvet', stock: 2 },
          ],
        };
        setProduct(mockProduct);
        setSelectedVariant(mockProduct.variants[0]);
        setReviews([
          { _id: 'r1', user: { name: 'Ali Khan' }, rating: 5, title: 'Amazing sofa, extremely comfortable!', comment: 'The velvet is very soft and royal. Sheesham wood feels heavy and authentic. Delivery took 5 days, vendor assembled it perfectly in my room.', isVerifiedPurchase: true, createdAt: '2026-06-20T12:00:00Z' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    
    // Simulate pincode eligibility check
    const isEligible = /^\d{5}$/.test(pincode) || /^\d{6}$/.test(pincode);
    if (isEligible) {
      const isFree = (product.discountPrice || product.price) > 50000;
      setPincodeResult({
        available: true,
        days: product.deliveryDays || 6,
        charge: isFree ? 0 : product.deliveryCharge || 800,
      });
      toast.success('We deliver to this address!');
    } else {
      setPincodeResult({ available: false });
      toast.error('Invalid postal code format.');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    const color = selectedVariant ? selectedVariant.color : '';
    const material = selectedVariant ? selectedVariant.material || product.material : product.material;
    const finalPrice = product.discountPrice || product.price;

    const res = await addToCart(product._id, selectedQty, color, material, finalPrice);
    if (res.success) {
      toast.success('Successfully added to your shopping cart!');
    } else {
      toast.error(res.message);
    }
  };

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>Loading product details...</div>;
  }

  const pStyles = {
    layout: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '50px',
      marginTop: '40px',
    },
    galleryColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    mainImgBox: {
      width: '100%',
      height: '460px',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      backgroundColor: 'var(--color-surface-soft)',
    },
    mainImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    thumbRow: {
      display: 'flex',
      gap: '12px',
    },
    thumb: {
      width: '80px',
      height: '80px',
      borderRadius: 'var(--radius-md)',
      border: '2px solid transparent',
      cursor: 'pointer',
      overflow: 'hidden',
      backgroundColor: 'var(--color-surface-soft)',
    },
    activeThumb: {
      borderColor: 'var(--color-primary)',
    },
    infoColumn: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      fontSize: '36px',
      fontWeight: 700,
      marginBottom: '10px',
    },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '20px',
      color: 'var(--color-warning)',
      fontSize: '15px',
    },
    priceBox: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '12px',
      marginBottom: '24px',
    },
    price: {
      fontSize: '30px',
      fontWeight: 700,
      color: 'var(--color-primary)',
    },
    oldPrice: {
      fontSize: '20px',
      textDecoration: 'line-through',
      color: 'var(--color-text-muted)',
    },
    specsBox: {
      backgroundColor: 'var(--color-surface-soft)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      marginBottom: '24px',
    },
    swatchRow: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
    },
    swatch: {
      width: '32px',
      height: '32px',
      borderRadius: 'var(--radius-full)',
      cursor: 'pointer',
      border: '2px solid var(--color-border)',
      padding: '2px',
    },
    activeSwatch: {
      borderColor: 'var(--color-secondary)',
    },
    pincodeBox: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
    },
  };

  return (
    <div className="container">
      <div style={pStyles.layout}>
        {/* Left Side: Images */}
        <div style={pStyles.galleryColumn}>
          <div style={pStyles.mainImgBox}>
            <img
              src={product.images[activeImage]?.url}
              alt={product.name}
              style={pStyles.mainImg}
            />
          </div>
          <div style={pStyles.thumbRow}>
            {product.images.map((img, idx) => (
              <div
                key={img.publicId}
                style={{
                  ...pStyles.thumb,
                  ...(activeImage === idx ? pStyles.activeThumb : {}),
                }}
                onClick={() => setActiveImage(idx)}
              >
                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Info & Actions */}
        <div style={pStyles.infoColumn}>
          <span style={{ textTransform: 'uppercase', fontSize: '13px', color: 'var(--color-text-muted)', letterSpacing: '1px', fontWeight: 600 }}>
            {product.category?.name}
          </span>
          <h1 style={pStyles.title}>{product.name}</h1>

          <div style={pStyles.ratingRow}>
            {[...Array(5).keys()].map((star) => (
              <Star
                key={star}
                size={16}
                fill={star < Math.round(product.ratings?.average || 4.5) ? 'currentColor' : 'none'}
              />
            ))}
            <span style={{ color: 'var(--color-text)', fontWeight: 500, marginLeft: '4px' }}>
              {product.ratings?.average || 4.5}
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>
              ({reviews.length} reviews)
            </span>
          </div>

          <div style={pStyles.priceBox}>
            {product.discountPrice > 0 ? (
              <>
                <span style={pStyles.price}>PKR {product.discountPrice}</span>
                <span style={pStyles.oldPrice}>PKR {product.price}</span>
                <span style={{ color: 'var(--color-error)', fontWeight: 600, fontSize: '14px' }}>
                  ({product.discountPercent}% OFF)
                </span>
              </>
            ) : (
              <span style={pStyles.price}>PKR {product.price}</span>
            )}
          </div>

          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: 1.7 }}>
            {product.description}
          </p>

          {/* Color/Upholstery Variants */}
          {product.variants?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Variant Upholstery: {selectedVariant?.colorName}
              </span>
              <div style={pStyles.swatchRow}>
                {product.variants.map((v) => (
                  <button
                    key={v.color}
                    onClick={() => setSelectedVariant(v)}
                    style={{
                      ...pStyles.swatch,
                      backgroundColor: v.color,
                      ...(selectedVariant?.color === v.color ? pStyles.activeSwatch : {}),
                    }}
                    title={v.colorName}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Specifications Panel */}
          <div style={pStyles.specsBox}>
            <h4 style={{ fontWeight: 600, marginBottom: '12px' }}>Specifications</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: '14px' }}>
              <div><strong>Material:</strong> {product.material}</div>
              <div><strong>Finish:</strong> {product.finish || 'Standard'}</div>
              <div><strong>Assembly:</strong> {product.assemblyRequired ? 'Required (Free Local)' : 'Pre-assembled'}</div>
              <div><strong>Dimensions:</strong> {product.dimensions?.length} x {product.dimensions?.width} x {product.dimensions?.height} cm</div>
              <div><strong>Warranty:</strong> {product.warrantyMonths || 12} Months</div>
              <div><strong>Stock Status:</strong> {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of stock'}</div>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Check Delivery Eligibility
            </span>
            <form onSubmit={handlePincodeCheck} style={pStyles.pincodeBox}>
              <input
                type="text"
                placeholder="Enter postal code (e.g. 75500)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  width: '240px',
                }}
              />
              <button type="submit" className="btn btn-outline" style={{ padding: '10px 20px' }}>
                Check
              </button>
            </form>

            {pincodeResult && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: pincodeResult.available ? 'var(--color-success)' : 'var(--color-error)' }}>
                <Truck size={16} />
                {pincodeResult.available ? (
                  <span>Eligible! Est. Delivery: {pincodeResult.days} Days. Shipping: {pincodeResult.charge === 0 ? 'FREE' : `PKR ${pincodeResult.charge}`}</span>
                ) : (
                  <span>Sorry, we do not deliver to this location yet.</span>
                )}
              </div>
            )}
          </div>

          {/* Buy Options */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <button
                onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                style={{ padding: '10px 16px', backgroundColor: 'var(--color-surface-soft)', cursor: 'pointer' }}
              >
                -
              </button>
              <span style={{ padding: '10px 20px', minWidth: '50px', textAlign: 'center', alignSelf: 'center', fontWeight: 'bold' }}>
                {selectedQty}
              </span>
              <button
                onClick={() => setSelectedQty(Math.min(product.stock, selectedQty + 1))}
                style={{ padding: '10px 16px', backgroundColor: 'var(--color-surface-soft)', cursor: 'pointer' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn btn-primary"
              style={{ flexGrow: 1 }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>

            <button
              onClick={() => toast.success('Saved to wishlist')}
              className="btn btn-outline"
              style={{ padding: '12px' }}
            >
              <Heart size={18} />
            </button>
          </div>

          {/* Vendor Details Card */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', marginTop: '40px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--color-primary-light)', color: '#FFFFFF', padding: '12px', borderRadius: 'var(--radius-full)' }}>
              <User size={24} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Sold by verified vendor</span>
              <h5 style={{ fontSize: '16px', fontWeight: 600 }}>
                <Link to={`/store/${product.vendor?._id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                  {product.vendor?.shopName}
                </Link>
              </h5>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Rating: {product.vendor?.rating || 4.8} ({product.vendor?.totalReviews || 12} sales)</p>
            </div>
            <Link to={`/store/${product.vendor?._id}`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12px', textDecoration: 'none' }}>
              Visit Showroom
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section style={{ marginTop: '80px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '24px' }}>
          Customer Reviews ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet for this product. Be the first to share your experience after purchasing!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map((rev) => (
              <div key={rev._id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-soft)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      {rev.user.name[0]}
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{rev.user.name}</strong>
                      {rev.isVerifiedPurchase && (
                        <span style={{ fontSize: '11px', color: 'var(--color-success)', marginLeft: '8px', backgroundColor: '#E2F0D9', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', color: 'var(--color-warning)' }}>
                    {[...Array(5).keys()].map((star) => (
                      <Star key={star} size={14} fill={star < rev.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <h5 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>{rev.title}</h5>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
