import React from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const CartPage = () => {
  usePageTitle('My Cart');
  const { cart, cartSubtotal, updateCartItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = async (itemId, currentQty, newQty, stockLimit) => {
    if (newQty < 1) return;
    const res = await updateCartItem(itemId, newQty);
    if (!res.success) {
      toast.error(res.message);
    }
  };

  const handleRemove = async (itemId) => {
    const res = await removeFromCart(itemId);
    if (res.success) {
      toast.success('Item removed from cart');
    } else {
      toast.error(res.message);
    }
  };

  const cartStyles = {
    layout: {
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
      gap: '40px',
      marginTop: '40px',
    },
    tableHeader: {
      borderBottom: '2px solid var(--color-border)',
      paddingBottom: '12px',
      marginBottom: '20px',
      fontWeight: 'bold',
      fontSize: '15px',
      color: 'var(--color-text-muted)',
    },
    cartItemRow: {
      display: 'grid',
      gridTemplateColumns: '80px 1fr 120px 100px 40px',
      alignItems: 'center',
      gap: '20px',
      padding: '20px 0',
      borderBottom: '1px solid var(--color-border)',
    },
    summaryCard: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '24px',
      height: 'fit-content',
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '15px',
      marginBottom: '16px',
    },
    divider: {
      borderTop: '1px solid var(--color-border)',
      margin: '16px 0',
    },
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ color: 'var(--color-primary-light)', marginBottom: '20px' }}>
          <ShoppingBag size={64} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '28px', marginBottom: '12px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>You haven't added any luxury furniture to your cart yet.</p>
        <Link to="/shop" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: '32px', marginTop: '40px' }}>Shopping Cart</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Review your selected products and checkout</p>

      <div style={cartStyles.layout}>
        {/* Left Column: Items list */}
        <div>
          <div style={cartStyles.tableHeader}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 100px 40px', gap: '20px' }}>
              <span>Product</span>
              <span>Details</span>
              <span style={{ textAlign: 'center' }}>Quantity</span>
              <span style={{ textAlign: 'right' }}>Total</span>
              <span></span>
            </div>
          </div>

          {cart.items.map((item) => (
            <div key={item._id} style={cartStyles.cartItemRow}>
              {/* Image */}
              <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--color-surface-soft)' }}>
                <img
                  src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Title & Options */}
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '16px' }}>
                  <Link to={`/product/${item.product?.slug}`}>{item.product?.name || item.name}</Link>
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {item.color && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '12px' }}>
                      Color:{' '}
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: item.color,
                          display: 'inline-block',
                          border: '1px solid var(--color-border)',
                        }}
                      />
                    </span>
                  )}
                  {item.material && <span>Material: {item.material}</span>}
                </p>
                <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500 }}>
                  Sold by:{' '}
                  {item.product?.vendor ? (
                    <Link to={`/store/${item.product.vendor._id || item.product.vendor}`} style={{ textDecoration: 'underline', color: 'var(--color-primary)' }}>
                      {item.product.vendor.shopName || 'Showroom'}
                    </Link>
                  ) : (
                    'Verified Vendor'
                  )}
                </span>
              </div>

              {/* Quantity Changer */}
              <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '36px', width: 'fit-content', margin: '0 auto' }}>
                <button
                  onClick={() => handleQtyChange(item._id, item.qty, item.qty - 1)}
                  style={{ padding: '0 10px', backgroundColor: 'var(--color-surface-soft)', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ padding: '0 12px', alignSelf: 'center', fontWeight: 'bold', fontSize: '14px' }}>{item.qty}</span>
                <button
                  onClick={() => handleQtyChange(item._id, item.qty, item.qty + 1)}
                  style={{ padding: '0 10px', backgroundColor: 'var(--color-surface-soft)', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>

              {/* Line Price Subtotal */}
              <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '16px', color: 'var(--color-primary)' }}>
                PKR {item.price * item.qty}
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(item._id)}
                style={{ color: 'var(--color-error)', cursor: 'pointer', textAlign: 'center' }}
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-outline" onClick={clearCart}>
              Clear Entire Cart
            </button>
            <Link to="/shop" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Cart Summary */}
        <aside style={cartStyles.summaryCard}>
          <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
            Order Summary
          </h3>

          <div style={cartStyles.summaryRow}>
            <span>Subtotal</span>
            <strong>PKR {cartSubtotal}</strong>
          </div>

          <div style={cartStyles.summaryRow}>
            <span>Estimated Shipping</span>
            <span style={{ color: cartSubtotal > 50000 ? 'var(--color-success)' : 'var(--color-text)' }}>
              {cartSubtotal > 50000 ? 'FREE' : 'PKR 2,500'}
            </span>
          </div>

          <div style={cartStyles.summaryRow}>
            <span>Assembly Services</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Calculated at next step</span>
          </div>

          <div style={cartStyles.divider}></div>

          <div style={{ ...cartStyles.summaryRow, fontSize: '18px', marginBottom: '24px' }}>
            <span>Total Amount</span>
            <strong style={{ color: 'var(--color-primary)' }}>
              PKR {cartSubtotal + (cartSubtotal > 50000 ? 0 : 2500)}
            </strong>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </aside>
      </div>
    </div>
  );
};

