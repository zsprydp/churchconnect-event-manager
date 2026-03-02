import React from 'react';
import { DollarSign, CreditCard, Plus, Heart, Users, Search } from 'lucide-react';

const PaymentsView = ({
  paymentsTab,
  setPaymentsTab,
  payments,
  donations,
  getTotalRevenue,
  getEventPaymentsTotal,
  getDonationsTotal,
  getActiveDonorsCount,
  getRecentPaymentsActivity,
  getMonthlyRevenueData,
  getTopDonors,
  filterPayments,
  filterDonations,
  paymentSearchTerm,
  setPaymentSearchTerm,
  paymentFilterStatus,
  setPaymentFilterStatus,
  donationSearchTerm,
  setDonationSearchTerm,
  donationFilterType,
  setDonationFilterType,
  getPaymentStatusColor,
  handleViewPaymentDetails,
  handleRefundPayment,
  handleViewDonationDetails,
  handleSendThankYou,
  exportPaymentsReport,
  exportDonationsReport,
  exportFinancialSummary,
  setShowPaymentForm,
  setShowCreateDonation,
  setShowCreatePayment,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Payments & Donations</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowPaymentForm(true)}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
            }}
          >
            <CreditCard style={{ height: '16px', width: '16px' }} />
            Process Payment
          </button>
          <button
            onClick={() => setShowCreateDonation(true)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
            }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
            New Donation
          </button>
          <button
            onClick={() => setShowCreatePayment(true)}
            style={{
              backgroundColor: '#7B2D4E',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
            }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Payment Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E8E0D8' }}>
          {['overview', 'payments', 'donations', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setPaymentsTab(tab)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderBottom: paymentsTab === tab ? '2px solid #7B2D4E' : 'none',
                color: paymentsTab === tab ? '#7B2D4E' : '#9B9590',
                fontWeight: paymentsTab === tab ? 'bold' : 'normal',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {paymentsTab === 'overview' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ backgroundColor: '#FAF5EF', padding: '8px', borderRadius: '6px' }}>
                  <DollarSign style={{ height: '20px', width: '20px', color: '#7B2D4E' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#9B9590', margin: 0 }}>Total Revenue</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#7B2D4E' }}>
                    ${getTotalRevenue().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ backgroundColor: '#fef3c7', padding: '8px', borderRadius: '6px' }}>
                  <CreditCard style={{ height: '20px', width: '20px', color: '#d97706' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#9B9590', margin: 0 }}>Event Payments</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#d97706' }}>
                    ${getEventPaymentsTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ backgroundColor: '#dcfce7', padding: '8px', borderRadius: '6px' }}>
                  <Heart style={{ height: '20px', width: '20px', color: '#16a34a' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#9B9590', margin: 0 }}>Donations</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#16a34a' }}>
                    ${getDonationsTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ backgroundColor: '#fef2f2', padding: '8px', borderRadius: '6px' }}>
                  <Users style={{ height: '20px', width: '20px', color: '#dc2626' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#9B9590', margin: 0 }}>Active Donors</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#dc2626' }}>
                    {getActiveDonorsCount()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Recent Activity</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {getRecentPaymentsActivity()
                .slice(0, 10)
                .map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#FAF5EF',
                      borderRadius: '6px',
                      border: '1px solid #E8E0D8',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          backgroundColor: activity.type === 'donation' ? '#dcfce7' : '#FAF5EF',
                          padding: '6px',
                          borderRadius: '4px',
                        }}
                      >
                        {activity.type === 'donation' ? (
                          <Heart style={{ height: '14px', width: '14px', color: '#16a34a' }} />
                        ) : (
                          <CreditCard style={{ height: '14px', width: '14px', color: '#7B2D4E' }} />
                        )}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>{activity.description}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9B9590' }}>
                          {activity.donorName || activity.eventName} • {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#10b981' }}>
                        +${activity.amount.toFixed(2)}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9B9590' }}>{activity.status}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {paymentsTab === 'payments' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                aria-label="Search payments"
                placeholder="Search payments by event or attendee..."
                value={paymentSearchTerm}
                onChange={(e) => setPaymentSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <select
              aria-label="Filter payments by status"
              value={paymentFilterStatus}
              onChange={(e) => setPaymentFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            >
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {filterPayments(payments, paymentSearchTerm, paymentFilterStatus).map((payment) => (
              <div
                key={payment.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #E8E0D8',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{payment.eventName}</h4>
                    <p style={{ fontSize: '14px', color: '#9B9590', margin: 0 }}>Attendee: {payment.attendeeName}</p>
                  </div>
                  <span
                    style={{
                      backgroundColor: getPaymentStatusColor(payment.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    {payment.status}
                  </span>
                </div>

                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#10b981' }}>
                      ${payment.amount.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9B9590', margin: '2px 0 0 0' }}>Amount</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', width: '18px', fontWeight: 'bold', margin: '0', color: '#8b5cf6' }}>
                      {payment.attendeeCount}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9B9590', margin: '2px 0 0 0' }}>People</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#f59e0b' }}>
                      {payment.paymentMethod}
                    </p>
                    <p style={{ fontSize: '12px', color: '6b7280', margin: '2px 0 0 0' }}>Method</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleViewPaymentDetails(payment)}
                    style={{
                      flex: 1,
                      backgroundColor: '#7B2D4E',
                      color: 'white',
                      padding: '8px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    View Details
                  </button>
                  {payment.status === 'completed' && (
                    <button
                      onClick={() => handleRefundPayment(payment.id)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '8px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donations Tab */}
      {paymentsTab === 'donations' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                aria-label="Search donations"
                placeholder="Search donations by donor or campaign..."
                value={donationSearchTerm}
                onChange={(e) => setDonationSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <select
              aria-label="Filter donations by campaign"
              value={donationFilterType}
              onChange={(e) => setDonationFilterType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="campaign">Campaign</option>
              <option value="memorial">Memorial</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {filterDonations(donations, donationSearchTerm, donationFilterType).map((donation) => (
              <div
                key={donation.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #E8E0D8',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{donation.donorName}</h4>
                    <p style={{ fontSize: '14px', color: '#9B9590', margin: 0 }}>
                      {donation.campaign || 'General Donation'}
                    </p>
                  </div>
                  <span
                    style={{
                      backgroundColor: donation.recurring ? '#8b5cf6' : '#10b981',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    {donation.recurring ? 'Recurring' : 'One-time'}
                  </span>
                </div>

                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#10b981' }}>
                      ${donation.amount.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9B9590', margin: '2px 0 0 0' }}>Amount</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#8b5cf6' }}>
                      {donation.paymentMethod}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9B9590', margin: '2px 0 0 0' }}>Method</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#f59e0b' }}>
                      {donation.anonymous ? 'Anonymous' : 'Named'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9B9590', margin: '2px 0 0 0' }}>Display</p>
                  </div>
                </div>

                {donation.message && (
                  <div
                    style={{
                      backgroundColor: '#FAF5EF',
                      padding: '12px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      border: '1px solid #E8E0D8',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic', color: '#9B9590' }}>
                      "{donation.message}"
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleViewDonationDetails(donation)}
                    style={{
                      flex: 1,
                      backgroundColor: '#7B2D4E',
                      color: 'white',
                      padding: '8px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleSendThankYou(donation)}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '8px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    Thank You
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {paymentsTab === 'reports' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Monthly Revenue</h4>
              <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '4px' }}>
                {getMonthlyRevenueData().map((month, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        backgroundColor: '#7B2D4E',
                        width: '100%',
                        height: `${(month.amount / Math.max(...getMonthlyRevenueData().map((m) => m.amount))) * 150}px`,
                        borderRadius: '4px 4px 0 0',
                      }}
                    />
                    <p style={{ fontSize: '10px', margin: '4px 0 0 0', color: '#9B9590' }}>{month.month}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Top Donors</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {getTopDonors()
                  .slice(0, 5)
                  .map((donor, index) => (
                    <div
                      key={donor.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: index < 4 ? '1px solid #F0E8DD' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            backgroundColor: '#7B2D4E',
                            color: 'white',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          {index + 1}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>{donor.name}</span>
                      </div>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>${donor.total.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Export Options</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => exportPaymentsReport()}
                style={{
                  backgroundColor: '#7B2D4E',
                  color: 'white',
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Export Payments CSV
              </button>
              <button
                onClick={() => exportDonationsReport()}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '10px 16px',
                  border: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Export Donations CSV
              </button>
              <button
                onClick={() => exportFinancialSummary()}
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Export Summary PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsView;
