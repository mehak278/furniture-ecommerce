import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const footerStyles = {
    footer: {
      backgroundColor: 'var(--color-secondary)',
      color: 'var(--color-surface-soft)',
      padding: '60px 0 20px 0',
      marginTop: '80px',
      borderTop: '1px solid var(--color-border)',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '40px',
      marginBottom: '40px',
    },
    title: {
      fontFamily: 'var(--font-primary)',
      fontSize: '20px',
      color: '#FFFFFF',
      marginBottom: '20px',
    },
    linkList: {
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    link: {
      color: 'var(--color-text-muted)',
      transition: 'color var(--transition-fast)',
    },
    bottom: {
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      paddingTop: '20px',
      textAlign: 'center',
      fontSize: '14px',
      color: 'var(--color-text-muted)',
    },
  };

  return (
    <footer style={footerStyles.footer}>
      <div className="container">
        <div style={footerStyles.grid}>
          <div>
            <h4 style={footerStyles.title}>FurniMart</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.8 }}>
              Premium Multi-vendor platform for elegant, crafted, and modern home furniture. Explore verified vendor collections.
            </p>
          </div>

          <div>
            <h4 style={footerStyles.title}>Shop By Room</h4>
            <ul style={footerStyles.linkList}>
              <li><Link to="/shop?category=living-room" style={footerStyles.link}>Living Room</Link></li>
              <li><Link to="/shop?category=bedroom" style={footerStyles.link}>Bedroom</Link></li>
              <li><Link to="/shop?category=office" style={footerStyles.link}>Office Study</Link></li>
              <li><Link to="/shop?category=dining" style={footerStyles.link}>Dining Room</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={footerStyles.title}>Platform Info</h4>
            <ul style={footerStyles.linkList}>
              <li><Link to="/about" style={footerStyles.link}>About Us</Link></li>
              <li><Link to="/contact" style={footerStyles.link}>Contact Support</Link></li>
              <li><Link to="/become-vendor" style={footerStyles.link}>Become a Vendor</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={footerStyles.title}>Customer Care</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '10px' }}>
              Have questions? We are available 24/7.
            </p>
            <p style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
              support@furnimart.com
            </p>
          </div>
        </div>

        <div style={footerStyles.bottom}>
          &copy; {new Date().getFullYear()} FurniMart. All rights reserved. Designed professionally.
        </div>
      </div>
    </footer>
  );
};
