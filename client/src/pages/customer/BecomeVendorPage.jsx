import React, { useState, useEffect } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const BecomeVendorPage = () => {
  usePageTitle('Become a Vendor');
  const navigate = useNavigate();
  const { user, isAuthenticated, register } = useAuth();

  // Step state
  const [step, setStep] = useState(1);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);

  // Step 1 Form state (Signup)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);

  // Step 2 Form state (Vendor profile)
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [businessType, setBusinessType] = useState('Individual');
  const [businessDocuments, setBusinessDocuments] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [submittingVendor, setSubmittingVendor] = useState(false);

  // Check if authenticated user already has an application
  useEffect(() => {
    if (isAuthenticated) {
      setCheckingStatus(true);
      api.get('/admin/vendors') // Admins can check, wait, normal users can check by attempting or hitting a status check route
        .then(({ data }) => {
          // Find if this user has an entry in vendor applications list
          const app = data.vendors?.find(v => v.user?._id === user?._id);
          if (app) {
            setExistingApplication(app);
            setStep(3); // Go straight to confirmation status
          } else {
            setStep(2); // Logged in, show application form
          }
        })
        .catch(() => {
          // If we fail or role restricts, assume we can register
          setStep(2);
        })
        .finally(() => setCheckingStatus(false));
    } else {
      setStep(1); // Not logged in, show signup
    }
  }, [isAuthenticated, user]);

  // Handle Step 1: User Account Registration
  const handleUserRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      toast.error('Please fill in all details');
      return;
    }
    setSubmittingUser(true);
    const res = await register(name, email, password, phone);
    setSubmittingUser(false);
    
    if (res.success) {
      toast.success('Account created! Now complete your shop details.');
      setStep(2);
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  // Handle Step 2: Vendor Application Registration
  const handleVendorRegister = async (e) => {
    e.preventDefault();
    if (!shopName || !shopDescription || !businessDocuments || !bankName || !accountName || !accountNumber) {
      toast.error('Please fill in all required shop fields');
      return;
    }
    setSubmittingVendor(true);
    try {
      const payload = {
        shopName,
        shopDescription,
        businessType,
        businessDocuments, // saved as Document ID/CNIC number
        bankDetails: {
          bankName,
          accountName,
          accountNumber
        }
      };
      
      const { data } = await api.post('/vendor/register', payload);
      if (data.success) {
        toast.success('Application submitted successfully!');
        setExistingApplication(data.vendor);
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmittingVendor(false);
    }
  };

  const pageStyles = {
    layout: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px 20px',
      backgroundColor: '#fbf9f6',
      fontFamily: 'var(--font-primary)',
    },
    card: {
      width: '100%',
      maxWidth: '550px',
      padding: '40px 30px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #e8e0d5',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 8px 32px rgba(44, 26, 14, 0.04)',
    },
    title: {
      textAlign: 'center',
      fontSize: '28px',
      marginBottom: '10px',
      color: '#2c1a0e',
      fontWeight: 700,
    },
    subtitle: {
      textAlign: 'center',
      color: '#9a7a5a',
      fontSize: '14px',
      marginBottom: '30px',
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '30px',
      position: 'relative',
    },
    stepNode: (active) => ({
      width: '35px',
      height: '35px',
      borderRadius: '50%',
      backgroundColor: active ? '#d4a054' : '#e8e0d5',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '14px',
      zIndex: 2,
    }),
    progressLine: {
      position: 'absolute',
      top: '17px',
      left: '0',
      right: '0',
      height: '2px',
      backgroundColor: '#e8e0d5',
      zIndex: 1,
    },
    btn: {
      width: '100%',
      backgroundColor: '#d4a054',
      color: '#ffffff',
      padding: '13px',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '15px',
      boxShadow: '0 4px 12px rgba(212, 160, 84, 0.2)',
      marginTop: '15px',
    },
    timeline: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      marginTop: '25px',
      padding: '20px',
      backgroundColor: '#fdfbf7',
      borderRadius: '8px',
      border: '1px solid #f0e8dc',
    },
    timelineItem: (done) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      opacity: done ? 1 : 0.5,
    })
  };

  if (checkingStatus) {
    return (
      <div style={pageStyles.layout}>
        <div style={pageStyles.card}>
          <p style={{ textAlign: 'center', color: '#9a7a5a' }}>Checking your vendor status...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.layout}>
      <div style={pageStyles.card}>
        <h2 style={pageStyles.title}>🏪 Sell on FurniMart</h2>
        <p style={pageStyles.subtitle}>Launch your online furniture showroom</p>

        {/* Step Indicators */}
        <div style={pageStyles.stepIndicator}>
          <div style={pageStyles.progressLine}></div>
          <div style={pageStyles.stepNode(step >= 1)}>1</div>
          <div style={pageStyles.stepNode(step >= 2)}>2</div>
          <div style={pageStyles.stepNode(step >= 3)}>3</div>
        </div>

        {/* STEP 1: SIGNUP FORM */}
        {step === 1 && (
          <form onSubmit={handleUserRegister}>
            <p style={{ fontSize: '13px', color: '#9a7a5a', marginBottom: '15px', textAlign: 'center' }}>
              Step 1: Create a seller account to get started
            </p>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="03001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" style={pageStyles.btn} disabled={submittingUser}>
              {submittingUser ? 'Registering Account...' : 'Continue to Shop Info'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#9a7a5a' }}>
              Already registered? <Link to="/vendor/login" style={{ color: '#d4a054', fontWeight: 600 }}>Login here</Link>
            </p>
          </form>
        )}

        {/* STEP 2: VENDOR DETAILS FORM */}
        {step === 2 && (
          <form onSubmit={handleVendorRegister}>
            <p style={{ fontSize: '13px', color: '#9a7a5a', marginBottom: '15px', textAlign: 'center' }}>
              Step 2: Enter your shop and billing details
            </p>

            <div className="form-group">
              <label className="form-label">Shop Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Royal Oak Furnishers"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shop Description *</label>
              <textarea
                className="form-control"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Brief description about your furniture specializations..."
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Type *</label>
              <select className="form-control" value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                <option value="Individual">Individual (Proprietor)</option>
                <option value="Company">Registered Company</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">CNIC or Business Registration Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 42101-1234567-1"
                value={businessDocuments}
                onChange={(e) => setBusinessDocuments(e.target.value)}
                required
              />
            </div>

            <h4 style={{ color: '#2c1a0e', marginTop: '20px', borderBottom: '1px solid #f0e8dc', paddingBottom: '8px', fontSize: '15px', fontWeight: 600 }}>
              🏦 Payout Bank Account Details
            </h4>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">Bank Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Alfalah, HBL, Bank Islami"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Holder Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Account Title matching Bank Records"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Number or IBAN *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., PK73ALFH12345678901234"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>

            <button type="submit" style={pageStyles.btn} disabled={submittingVendor}>
              {submittingVendor ? 'Submitting Details...' : 'Submit Application'}
            </button>
          </form>
        )}

        {/* STEP 3: SUBMISSION PENDING CONFIRMATION */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <span style={{ fontSize: '48px' }}>⏳</span>
              <h3 style={{ color: '#2c1a0e', fontSize: '20px', fontWeight: 600, marginTop: '10px' }}>
                Application Pending Approval
              </h3>
              <p style={{ color: '#9a7a5a', fontSize: '14px', marginTop: '6px' }}>
                Your shop application for <strong>{existingApplication?.shopName}</strong> is under review.
              </p>
            </div>

            <div style={pageStyles.timeline}>
              <div style={pageStyles.timelineItem(true)}>
                <span style={{ color: '#22c55e', fontSize: '18px' }}>✓</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#2c1a0e' }}>Account Registered</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9a7a5a' }}>You are logged in as {user?.email}</p>
                </div>
              </div>

              <div style={pageStyles.timelineItem(true)}>
                <span style={{ color: '#22c55e', fontSize: '18px' }}>✓</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#2c1a0e' }}>Application Submitted</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9a7a5a' }}>Submitted on {existingApplication ? new Date(existingApplication.createdAt).toLocaleDateString() : 'Today'}</p>
                </div>
              </div>

              <div style={pageStyles.timelineItem(existingApplication?.status === 'approved')}>
                <span style={{ color: existingApplication?.status === 'approved' ? '#22c55e' : '#f59e0b', fontSize: '18px' }}>
                  {existingApplication?.status === 'approved' ? '✓' : '●'}
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#2c1a0e' }}>Admin Verification</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9a7a5a' }}>
                    {existingApplication?.status === 'approved' 
                      ? 'Approved! You now have vendor access.' 
                      : 'Under review. We will verify your business and bank records.'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              {existingApplication?.status === 'approved' ? (
                <Link to="/vendor/dashboard" style={{ ...pageStyles.btn, display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                  Go to Vendor Panel
                </Link>
              ) : (
                <Link to="/" style={{ color: '#d4a054', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                  ← Back to Storefront
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
