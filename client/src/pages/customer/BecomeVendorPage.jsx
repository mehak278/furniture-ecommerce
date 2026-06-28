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

  // Onboarding Step State
  const [step, setStep] = useState(1);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);

  // Signup form inputs (Step 1)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);

  // Shop form inputs (Step 2 - sectioned form)
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [businessType, setBusinessType] = useState('Single Owner (Independently Selling)');
  const [hasPhysicalStore, setHasPhysicalStore] = useState(false);
  const [storeAddress, setStoreAddress] = useState('');
  const [businessDocuments, setBusinessDocuments] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [submittingVendor, setSubmittingVendor] = useState(false);

  // Fetch status if logged in
  const fetchApplicationStatus = () => {
    setCheckingStatus(true);
    api.get('/admin/vendors')
      .then(({ data }) => {
        const app = data.vendors?.find(v => v.user?._id === user?._id);
        if (app) {
          setExistingApplication(app);
          setStep(3); // Go straight to application status timeline
        } else {
          setStep(2); // Logged in but no shop form submitted
        }
      })
      .catch(() => {
        setStep(2);
      })
      .finally(() => setCheckingStatus(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplicationStatus();
    } else {
      setStep(1);
    }
  }, [isAuthenticated, user]);

  // Submit Signup form (Step 1)
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword || !age || !gender) {
      toast.error('Please fill in all signup fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmittingUser(true);
    const res = await register(name, email, password, phone, Number(age), gender, 'vendor');
    setSubmittingUser(false);

    if (res.success) {
      toast.success('Account created! Please complete your shop registration.');
      setStep(2);
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  // Submit Shop Registration (Step 2)
  const handleShopSubmit = async (e) => {
    e.preventDefault();
    if (!shopName || !shopDescription || !businessDocuments || !bankName || !accountName || !accountNumber) {
      toast.error('Please fill in all required shop details');
      return;
    }

    if (hasPhysicalStore && !storeAddress) {
      toast.error('Please enter your physical shop address');
      return;
    }

    setSubmittingVendor(true);
    try {
      const payload = {
        shopName,
        shopDescription,
        businessType,
        hasPhysicalStore,
        storeAddress: hasPhysicalStore ? storeAddress : 'Online Seller Only',
        businessDocuments, // CNIC / Document ID
        bankDetails: {
          bankName,
          accountName,
          accountNumber,
        },
      };

      const { data } = await api.post('/vendor/register', payload);
      if (data.success) {
        toast.success('Shop application submitted to admin!');
        setExistingApplication(data.vendor);
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit shop details');
    } finally {
      setSubmittingVendor(false);
    }
  };

  const pageStyles = {
    layout: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '50px 20px',
      backgroundColor: '#fdfbf9',
      fontFamily: 'var(--font-primary)',
    },
    card: {
      width: '100%',
      maxWidth: '650px',
      padding: '45px 35px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #e8e0d5',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 10px 40px rgba(44, 26, 14, 0.05)',
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
      marginBottom: '35px',
    },
    sectionDivider: {
      color: '#2c1a0e',
      fontSize: '16px',
      fontWeight: 700,
      borderBottom: '2px solid #f0e8dc',
      paddingBottom: '8px',
      marginBottom: '20px',
      marginTop: '30px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    btn: {
      width: '100%',
      backgroundColor: '#d4a054',
      color: '#ffffff',
      padding: '14px',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '15px',
      boxShadow: '0 4px 15px rgba(212, 160, 84, 0.25)',
      marginTop: '25px',
      transition: 'all 0.2s',
    },
    radioGroup: {
      display: 'flex',
      gap: '20px',
      margin: '12px 0 20px',
    },
    radioOption: (selected) => ({
      flex: 1,
      padding: '16px',
      border: selected ? '2px solid #d4a054' : '1px solid #e8e0d5',
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: selected ? 'rgba(212, 160, 84, 0.05)' : '#fff',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }),
    timeline: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      marginTop: '25px',
      padding: '24px',
      backgroundColor: '#fdfcfb',
      borderRadius: '10px',
      border: '1px solid #f0e8dc',
    },
    timelineItem: (done, active) => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '15px',
      opacity: done ? 1 : active ? 0.9 : 0.4,
    }),
    dot: (done, color) => ({
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: done ? color : '#e8e0d5',
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: 'bold',
      marginTop: '2px',
    })
  };

  if (checkingStatus) {
    return (
      <div style={pageStyles.layout}>
        <div style={pageStyles.card}>
          <p style={{ textAlign: 'center', color: '#9a7a5a' }}>Verifying registration status...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.layout}>
      <div style={pageStyles.card}>
        <h2 style={pageStyles.title}>🏪 Sell on FurniMart</h2>
        <p style={pageStyles.subtitle}>Set up your showroom and start selling premium furniture</p>

        {/* STEP 1: USER SIGNUP FORM */}
        {step === 1 && (
          <form onSubmit={handleSignup} className="animate-fade-in">
            <h3 style={{ fontSize: '18px', color: '#2c1a0e', fontWeight: 600, marginBottom: '20px', textAlign: 'center' }}>
              Create Seller Account
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mehak Fatima"
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
                placeholder="e.g. mehak@example.com"
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
                placeholder="e.g. 03001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="24"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-control"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" style={pageStyles.btn} disabled={submittingUser}>
              {submittingUser ? 'Creating account...' : 'Create Account & Continue'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#9a7a5a' }}>
              Already registered? <Link to="/vendor/login" style={{ color: '#d4a054', fontWeight: 600 }}>Login here</Link>
            </p>
          </form>
        )}

        {/* STEP 2: SECTIONED SHOP REGISTRATION FORM */}
        {step === 2 && (
          <form onSubmit={handleShopSubmit} className="animate-fade-in">
            <h3 style={{ fontSize: '18px', color: '#2c1a0e', fontWeight: 600, marginBottom: '5px', textAlign: 'center' }}>
              Shop Details Form
            </h3>
            <p style={{ fontSize: '13px', color: '#9a7a5a', textAlign: 'center', marginBottom: '20px' }}>
              Please complete all three sections to submit your registration
            </p>

            {/* SECTION 1: BUSINESS PROFILE */}
            <div style={pageStyles.sectionDivider}>
              <span>📁 Section 1: Business Profile</span>
            </div>

            <div className="form-group">
              <label className="form-label">Shop Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Royal Oak Furniture Gallery"
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
                placeholder="Describe your wood, style, and specialization (e.g. Bridal Bed Sets, Sofa Sets, Luxury Dining)..."
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Setup Type *</label>
              <select className="form-control" value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                <option value="Single Owner (Independently Selling)">Single Owner (Independently Selling)</option>
                <option value="Registered Company/Brand">Registered Company/Brand</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '5px' }}>
              <label className="form-label">Do you have a physical showroom/shop? *</label>
            </div>
            <div style={pageStyles.radioGroup}>
              <div
                style={pageStyles.radioOption(hasPhysicalStore === true)}
                onClick={() => setHasPhysicalStore(true)}
              >
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#2c1a0e' }}>Yes, I have a physical showroom</span>
                <span style={{ fontSize: '11px', color: '#9a7a5a' }}>Display shop address in the storefront catalog</span>
              </div>
              <div
                style={pageStyles.radioOption(hasPhysicalStore === false)}
                onClick={() => {
                  setHasPhysicalStore(false);
                  setStoreAddress('');
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#2c1a0e' }}>No, I sell online only</span>
                <span style={{ fontSize: '11px', color: '#9a7a5a' }}>Home-based seller or online factory outlet</span>
              </div>
            </div>

            {hasPhysicalStore && (
              <div className="form-group animate-fade-in" style={{ marginTop: '12px' }}>
                <label className="form-label">Showroom/Shop Address *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Shop # 24, Main Kurram Road, Rawalpindi"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  required
                />
              </div>
            )}

            {/* SECTION 2: IDENTITY VERIFICATION */}
            <div style={pageStyles.sectionDivider}>
              <span>🛡️ Section 2: Identity Verification</span>
            </div>

            <div className="form-group">
              <label className="form-label">CNIC or Business Registration Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. CNIC: 37405-1234567-8 or NTN Number"
                value={businessDocuments}
                onChange={(e) => setBusinessDocuments(e.target.value)}
                required
              />
            </div>

            {/* SECTION 3: BANK DETAILS */}
            <div style={pageStyles.sectionDivider}>
              <span>🏦 Section 3: Billing & Payout Bank Details</span>
            </div>

            <div className="form-group">
              <label className="form-label">Bank Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bank Alfalah, Habib Bank Limited, Meezan Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Holder Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Must match your bank records exactly"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Number / IBAN *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. PK83MEZN00100987654321"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>

            <button type="submit" style={pageStyles.btn} disabled={submittingVendor}>
              {submittingVendor ? 'Submitting Application...' : 'Submit Shop Application'}
            </button>
          </form>
        )}

        {/* STEP 3: SUBMISSION TIMELINE STATUS (Including Rejection Case) */}
        {step === 3 && (
          <div className="animate-fade-in">
            {existingApplication?.status === 'suspended' ? (
              // REJECTED ACCOUNT VIEW
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '56px', display: 'block', marginBottom: '15px' }}>❌</span>
                <h3 style={{ color: '#d93838', fontSize: '22px', fontWeight: 700, margin: '0 0 10px' }}>
                  Seller Account Cannot Be Opened
                </h3>
                <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.6', margin: '0 0 25px' }}>
                  Unfortunately, your vendor application for <strong>{existingApplication?.shopName}</strong> has been rejected by the administrator. Your seller account cannot be created or opened at this time.
                </p>
                <div style={{ padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '13px', textAlign: 'left', marginBottom: '25px' }}>
                  ⚠️ <strong>Reason:</strong> Your submitted document ID or bank details could not be verified. Please contact support if you believe this is an error.
                </div>
                <Link to="/" style={{ color: '#d4a054', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                  ← Return to Storefront Homepage
                </Link>
              </div>
            ) : (
              // PENDING / APPROVED TIMELINE VIEW
              <div>
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <span style={{ fontSize: '48px' }}>
                    {existingApplication?.status === 'approved' ? '🎉' : '⏳'}
                  </span>
                  <h3 style={{ color: '#2c1a0e', fontSize: '20px', fontWeight: 700, marginTop: '12px' }}>
                    {existingApplication?.status === 'approved' 
                      ? 'Shop Application Approved!' 
                      : 'Application Pending Review'}
                  </h3>
                  <p style={{ color: '#9a7a5a', fontSize: '14px', marginTop: '6px' }}>
                    For Shop: <strong>{existingApplication?.shopName}</strong>
                  </p>
                </div>

                <div style={pageStyles.timeline}>
                  <div style={pageStyles.timelineItem(true, true)}>
                    <span style={pageStyles.dot(true, '#22c55e')}>✓</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#2c1a0e', fontWeight: 600 }}>Account Registered</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9a7a5a' }}>Registered email: {user?.email}</p>
                    </div>
                  </div>

                  <div style={pageStyles.timelineItem(true, true)}>
                    <span style={pageStyles.dot(true, '#22c55e')}>✓</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#2c1a0e', fontWeight: 600 }}>Shop Application Submitted</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9a7a5a' }}>
                        Details submitted successfully on {existingApplication ? new Date(existingApplication.createdAt).toLocaleDateString() : 'Today'}
                      </p>
                    </div>
                  </div>

                  <div style={pageStyles.timelineItem(existingApplication?.status === 'approved', existingApplication?.status === 'pending')}>
                    <span style={pageStyles.dot(existingApplication?.status === 'approved', '#d4a054')}>
                      {existingApplication?.status === 'approved' ? '✓' : '●'}
                    </span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#2c1a0e', fontWeight: 600 }}>Admin Verification</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9a7a5a' }}>
                        {existingApplication?.status === 'approved'
                          ? 'Approved! Your platform seller console is now ready.'
                          : 'Under review. The platform manager is verifying your shop details.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  {existingApplication?.status === 'approved' ? (
                    <Link to="/vendor/dashboard" style={{ ...pageStyles.btn, display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                      Open Vendor Console
                    </Link>
                  ) : (
                    <Link to="/" style={{ color: '#d4a054', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                      ← Return to Storefront
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
