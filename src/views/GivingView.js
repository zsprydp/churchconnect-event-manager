import React, { useState, useCallback } from 'react';
import {
  Heart,
  Search,
  Download,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Calendar,
  DollarSign,
  User,
  Mail,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  processOneTimeDonation,
  processEventPayment,
  formatCurrency,
  isStripeConfigured,
} from '../services/stripeService';

const CAMPAIGNS = [
  { value: 'General Fund', color: '#7B2D4E' },
  { value: 'Building Fund', color: '#10b981' },
  { value: 'Youth Ministry', color: '#8b5cf6' },
  { value: 'Missions', color: '#f97316' },
  { value: 'Other', color: '#9B9590' },
];

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

const getCampaignColor = (campaign) => {
  const found = CAMPAIGNS.find((c) => c.value === campaign);
  return found ? found.color : '#9B9590';
};

const GivingView = ({ donations, setDonations, payments, setPayments, events, addNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState('give');

  // Give form state
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [campaign, setCampaign] = useState('General Fund');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // History state
  const [historySearch, setHistorySearch] = useState('');
  const [historyCampaignFilter, setHistoryCampaignFilter] = useState('all');

  // Event Tickets state
  const [purchasingTicket, setPurchasingTicket] = useState(null);

  const getAmount = useCallback(() => {
    if (selectedAmount === 'custom') {
      return parseFloat(customAmount) || 0;
    }
    return selectedAmount || 0;
  }, [selectedAmount, customAmount]);

  const resetForm = useCallback(() => {
    setSelectedAmount(null);
    setCustomAmount('');
    setCampaign('General Fund');
    setIsRecurring(false);
    setIsAnonymous(false);
    setDonorName('');
    setDonorEmail('');
    setMessage('');
  }, []);

  const handleGiveNow = useCallback(async () => {
    const amount = getAmount();
    if (amount <= 0) {
      addNotification('Please select or enter a donation amount.', 'warning');
      return;
    }
    if (!isAnonymous && !donorName.trim()) {
      addNotification('Please enter your name or choose anonymous giving.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processOneTimeDonation({
        amount,
        campaign,
        recurring: isRecurring,
        donorName: isAnonymous ? 'Anonymous' : donorName.trim(),
        donorEmail: donorEmail.trim(),
        message: message.trim(),
      });

      if (result.success) {
        const newDonation = {
          id: Date.now(),
          donorName: isAnonymous ? 'Anonymous Donor' : donorName.trim(),
          donorEmail: donorEmail.trim(),
          amount,
          campaign,
          paymentMethod: 'Credit Card',
          recurring: isRecurring,
          anonymous: isAnonymous,
          message: message.trim(),
          date: new Date().toISOString().split('T')[0],
          transactionId: result.transactionId,
          status: 'completed',
        };
        setDonations((prev) => [newDonation, ...prev]);
        addNotification(`Thank you! Your ${formatCurrency(amount)} donation to ${campaign} was successful.`, 'success');
        resetForm();
      } else {
        addNotification(result.message || 'Donation could not be processed.', 'error');
      }
    } catch {
      addNotification('An error occurred while processing your donation.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [
    getAmount,
    campaign,
    isRecurring,
    isAnonymous,
    donorName,
    donorEmail,
    message,
    setDonations,
    addNotification,
    resetForm,
  ]);

  const handlePurchaseTicket = useCallback(
    async (event) => {
      setPurchasingTicket(event.id);
      try {
        const result = await processEventPayment({
          eventId: event.id,
          eventName: event.name,
          amount: event.registrationFee,
        });

        if (result.success) {
          const newPayment = {
            id: Date.now(),
            eventId: event.id,
            eventName: event.name,
            attendeeName: 'Online Purchase',
            attendeeCount: 1,
            amount: event.registrationFee,
            paymentMethod: 'Credit Card',
            status: 'completed',
            date: new Date().toISOString().split('T')[0],
            transactionId: result.transactionId,
          };
          setPayments((prev) => [newPayment, ...prev]);
          addNotification(`Ticket purchased for ${event.name}! ${formatCurrency(event.registrationFee)}`, 'success');
        } else {
          addNotification(result.message || 'Payment could not be processed.', 'error');
        }
      } catch {
        addNotification('An error occurred while processing payment.', 'error');
      } finally {
        setPurchasingTicket(null);
      }
    },
    [setPayments, addNotification]
  );

  // Filtered donations for history tab
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      !historySearch ||
      d.donorName.toLowerCase().includes(historySearch.toLowerCase()) ||
      (d.campaign && d.campaign.toLowerCase().includes(historySearch.toLowerCase()));
    const matchesCampaign = historyCampaignFilter === 'all' || d.campaign === historyCampaignFilter;
    return matchesSearch && matchesCampaign;
  });

  const runningTotal = filteredDonations.reduce((sum, d) => sum + d.amount, 0);

  // Events with registration fees
  const paidEvents = events.filter((e) => e.registrationFee > 0 && e.status === 'active');

  const downloadStatement = useCallback(() => {
    const year = new Date().getFullYear();
    let csv = `Annual Giving Statement - ${year}\n\n`;
    csv += 'Date,Amount,Campaign,Method,Status\n';
    donations.forEach((d) => {
      csv += `${d.date},${d.amount.toFixed(2)},${d.campaign || 'General'},${d.paymentMethod},${d.status || 'completed'}\n`;
    });
    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    csv += `\nTotal,${total.toFixed(2)},,,\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `giving-statement-${year}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification('Giving statement downloaded!', 'success');
  }, [donations, addNotification]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Heart style={{ height: '28px', width: '28px', color: '#ef4444' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Giving</h2>
        </div>
        {!isStripeConfigured && (
          <span
            style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '1px solid #fbbf24',
            }}
          >
            Stripe Demo Mode
          </span>
        )}
      </div>

      {/* Sub-tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E8E0D8' }}>
          {[
            { id: 'give', label: 'Give', icon: Heart },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'tickets', label: 'Event Tickets', icon: Ticket },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderBottom: activeSubTab === tab.id ? '2px solid #7B2D4E' : 'none',
                  color: activeSubTab === tab.id ? '#7B2D4E' : '#9B9590',
                  fontWeight: activeSubTab === tab.id ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                }}
              >
                <Icon style={{ height: '16px', width: '16px' }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== GIVE SUB-TAB ==================== */}
      {activeSubTab === 'give' && (
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <Heart
                style={{
                  height: '40px',
                  width: '40px',
                  color: '#ef4444',
                  margin: '0 auto 12px',
                }}
              />
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Make a Gift</h3>
              <p style={{ color: '#9B9590', margin: 0, fontSize: '14px' }}>Your generosity makes a difference</p>
            </div>

            {/* Preset amounts */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: '#6B6560',
                }}
              >
                Select Amount
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                }}
              >
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    style={{
                      padding: '14px 8px',
                      borderRadius: '10px',
                      border: selectedAmount === amt ? '2px solid #7B2D4E' : '2px solid #E8E0D8',
                      backgroundColor: selectedAmount === amt ? '#FAF5EF' : 'white',
                      color: selectedAmount === amt ? '#7B2D4E' : '#6B6560',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      transition: 'all 0.15s',
                    }}
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedAmount('custom')}
                  style={{
                    padding: '14px 8px',
                    borderRadius: '10px',
                    border: selectedAmount === 'custom' ? '2px solid #7B2D4E' : '2px solid #E8E0D8',
                    backgroundColor: selectedAmount === 'custom' ? '#FAF5EF' : 'white',
                    color: selectedAmount === 'custom' ? '#7B2D4E' : '#6B6560',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Custom
                </button>
              </div>
              {selectedAmount === 'custom' && (
                <div style={{ marginTop: '10px', position: 'relative' }}>
                  <DollarSign
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '18px',
                      width: '18px',
                      color: '#9B9590',
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    aria-label="Custom donation amount"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 38px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '18px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Campaign */}
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="giving-campaign"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#6B6560',
                }}
              >
                Campaign
              </label>
              <select
                id="giving-campaign"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                }}
              >
                {CAMPAIGNS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <button
                onClick={() => setIsRecurring((prev) => !prev)}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'none',
                  border: '1px solid #E8E0D8',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {isRecurring ? (
                  <ToggleRight style={{ height: '22px', width: '22px', color: '#7B2D4E' }} />
                ) : (
                  <ToggleLeft style={{ height: '22px', width: '22px', color: '#9ca3af' }} />
                )}
                <span style={{ fontSize: '14px', color: '#6B6560' }}>Make this a recurring gift (monthly)</span>
              </button>
              <button
                onClick={() => setIsAnonymous((prev) => !prev)}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'none',
                  border: '1px solid #E8E0D8',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {isAnonymous ? (
                  <ToggleRight style={{ height: '22px', width: '22px', color: '#7B2D4E' }} />
                ) : (
                  <ToggleLeft style={{ height: '22px', width: '22px', color: '#9ca3af' }} />
                )}
                <span style={{ fontSize: '14px', color: '#6B6560' }}>Give anonymously</span>
              </button>
            </div>

            {/* Name & Email */}
            {!isAnonymous && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="giving-donor-name"
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#6B6560',
                    }}
                  >
                    <User
                      style={{
                        height: '14px',
                        width: '14px',
                        display: 'inline',
                        marginRight: '4px',
                        verticalAlign: 'text-bottom',
                      }}
                    />
                    Name
                  </label>
                  <input
                    id="giving-donor-name"
                    type="text"
                    placeholder="Your name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="giving-donor-email"
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#6B6560',
                    }}
                  >
                    <Mail
                      style={{
                        height: '14px',
                        width: '14px',
                        display: 'inline',
                        marginRight: '4px',
                        verticalAlign: 'text-bottom',
                      }}
                    />
                    Email
                  </label>
                  <input
                    id="giving-donor-email"
                    type="email"
                    placeholder="your@email.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Message */}
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="giving-message"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: '#6B6560',
                }}
              >
                <MessageSquare
                  style={{
                    height: '14px',
                    width: '14px',
                    display: 'inline',
                    marginRight: '4px',
                    verticalAlign: 'text-bottom',
                  }}
                />
                Message / Dedication (optional)
              </label>
              <textarea
                id="giving-message"
                placeholder="In honor of..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Give Now button */}
            <button
              onClick={handleGiveNow}
              disabled={isProcessing || getAmount() <= 0}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isProcessing || getAmount() <= 0 ? '#93c5fd' : '#7B2D4E',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: isProcessing || getAmount() <= 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Heart style={{ height: '20px', width: '20px' }} />
              {isProcessing
                ? 'Processing...'
                : getAmount() > 0
                  ? `Give ${formatCurrency(getAmount())} Now`
                  : 'Give Now'}
            </button>
          </div>
        </div>
      )}

      {/* ==================== HISTORY SUB-TAB ==================== */}
      {activeSubTab === 'history' && (
        <div>
          {/* Running total */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ fontSize: '14px', color: '#9B9590', margin: '0 0 4px 0' }}>Total Giving</p>
              <p
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  margin: 0,
                  color: '#10b981',
                }}
              >
                {formatCurrency(runningTotal)}
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={downloadStatement}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#7B2D4E',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
            >
              <Download style={{ height: '16px', width: '16px' }} />
              Download Statement
            </button>
          </div>

          {/* Filters */}
          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '16px',
                  width: '16px',
                  color: '#9B9590',
                }}
              />
              <input
                type="text"
                aria-label="Search donation history"
                placeholder="Search by donor name..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter style={{ height: '16px', width: '16px', color: '#9B9590' }} />
              <select
                aria-label="Filter by campaign"
                value={historyCampaignFilter}
                onChange={(e) => setHistoryCampaignFilter(e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                }}
              >
                <option value="all">All Campaigns</option>
                {CAMPAIGNS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Donation history table */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#FAF5EF' }}>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6B6560',
                      borderBottom: '1px solid #E8E0D8',
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6B6560',
                      borderBottom: '1px solid #E8E0D8',
                    }}
                  >
                    Donor
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#6B6560',
                      borderBottom: '1px solid #E8E0D8',
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6B6560',
                      borderBottom: '1px solid #E8E0D8',
                    }}
                  >
                    Campaign
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6B6560',
                      borderBottom: '1px solid #E8E0D8',
                    }}
                  >
                    Method
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#6B6560',
                      borderBottom: '1px solid #E8E0D8',
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: '32px',
                        textAlign: 'center',
                        color: '#9ca3af',
                      }}
                    >
                      No donations found
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #F0E8DD' }}>
                      <td style={{ padding: '12px 16px', color: '#9B9590' }}>
                        {new Date(d.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                        {d.donorName}
                        {d.recurring && (
                          <span
                            style={{
                              marginLeft: '6px',
                              backgroundColor: '#ede9fe',
                              color: '#7c3aed',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                            }}
                          >
                            Recurring
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          textAlign: 'right',
                          fontWeight: 'bold',
                          color: '#10b981',
                        }}
                      >
                        {formatCurrency(d.amount)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getCampaignColor(d.campaign),
                            marginRight: '6px',
                          }}
                        />
                        {d.campaign || 'General'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#9B9590' }}>{d.paymentMethod}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {(d.status || 'completed') === 'completed' ? (
                          <CheckCircle
                            style={{
                              height: '16px',
                              width: '16px',
                              color: '#10b981',
                            }}
                          />
                        ) : (
                          <AlertCircle
                            style={{
                              height: '16px',
                              width: '16px',
                              color: '#f59e0b',
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== EVENT TICKETS SUB-TAB ==================== */}
      {activeSubTab === 'tickets' && (
        <div>
          {paidEvents.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '40px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center',
                color: '#9ca3af',
              }}
            >
              <Ticket style={{ height: '40px', width: '40px', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No ticketed events available</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
              }}
            >
              {paidEvents.map((event) => {
                const spotsRemaining = event.capacity;
                const isPurchasing = purchasingTicket === event.id;
                return (
                  <div
                    key={event.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #E8E0D8',
                    }}
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <h4
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          margin: '0 0 6px 0',
                        }}
                      >
                        {event.name}
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#9B9590',
                          fontSize: '13px',
                        }}
                      >
                        <Calendar style={{ height: '14px', width: '14px' }} />
                        {event.dates && event.dates.length > 0
                          ? new Date(event.dates[0]).toLocaleDateString()
                          : event.recurrencePattern || 'TBD'}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: '#FAF5EF',
                        borderRadius: '8px',
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#7B2D4E',
                            margin: 0,
                          }}
                        >
                          {formatCurrency(event.registrationFee)}
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#9B9590',
                            margin: '2px 0 0 0',
                          }}
                        >
                          per ticket
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: spotsRemaining > 10 ? '#10b981' : '#f59e0b',
                            margin: 0,
                          }}
                        >
                          {spotsRemaining}
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#9B9590',
                            margin: '2px 0 0 0',
                          }}
                        >
                          spots left
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchaseTicket(event)}
                      disabled={isPurchasing}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isPurchasing ? '#93c5fd' : '#7B2D4E',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: isPurchasing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Ticket style={{ height: '16px', width: '16px' }} />
                      {isPurchasing ? 'Processing...' : 'Purchase Ticket'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GivingView;
