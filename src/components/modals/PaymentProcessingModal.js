import React from 'react';
import { X } from 'lucide-react';

const PaymentProcessingModal = ({
  paymentFormData,
  setPaymentFormData,
  onClose,
  onSubmit
}) => {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 id="modal-title" style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Process Payment</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Amount ($) *</label>
            <input 
              type="number" 
              step="0.01" 
              min="0.01"
              value={paymentFormData.amount} 
              onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))} 
              placeholder="0.00"
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} 
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Payment Method</label>
            <select 
              value={paymentFormData.paymentMethod} 
              onChange={(e) => setPaymentFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            >
              <option value="stripe">Stripe (2.9% + 30¢)</option>
              <option value="square">Square (2.6% + 10¢)</option>
              <option value="paypal">PayPal (2.9% + fixed fee)</option>
              <option value="ach">Bank Transfer (ACH - $0.25)</option>
              <option value="plaid">Plaid (Bank Connect - $0.25)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Description *</label>
            <input 
              type="text" 
              value={paymentFormData.description} 
              onChange={(e) => setPaymentFormData(prev => ({ ...prev, description: e.target.value }))} 
              placeholder="What is this payment for?"
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} 
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Recipient Email (Optional)</label>
            <input 
              type="email" 
              value={paymentFormData.recipientEmail} 
              onChange={(e) => setPaymentFormData(prev => ({ ...prev, recipientEmail: e.target.value }))} 
              placeholder="recipient@email.com"
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} 
            />
          </div>

          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '4px', border: '1px solid #dbeafe' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1d4ed8' }}>Cost Breakdown:</h4>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              <p style={{ margin: '0 0 4px 0' }}>Amount: ${paymentFormData.amount || '0.00'}</p>
              {paymentFormData.amount && (
                <>
                  {paymentFormData.paymentMethod === 'stripe' && (
                    <p style={{ margin: '0 0 4px 0' }}>Fee: ${(parseFloat(paymentFormData.amount) * 0.029 + 0.30).toFixed(2)}</p>
                  )}
                  {paymentFormData.paymentMethod === 'square' && (
                    <p style={{ margin: '0 0 4px 0' }}>Fee: ${(parseFloat(paymentFormData.amount) * 0.026 + 0.10).toFixed(2)}</p>
                  )}
                  {paymentFormData.paymentMethod === 'paypal' && (
                    <p style={{ margin: '0 0 4px 0' }}>Fee: ~${(parseFloat(paymentFormData.amount) * 0.029 + 0.49).toFixed(2)}</p>
                  )}
                  {paymentFormData.paymentMethod === 'ach' && (
                    <p style={{ margin: '0 0 4px 0' }}>Fee: $0.25</p>
                  )}
                  {paymentFormData.paymentMethod === 'plaid' && (
                    <p style={{ margin: '0 0 4px 0' }}>Fee: $0.25</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit"
              style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Process Payment
            </button>
            <button 
              type="button"
              onClick={onClose} 
              style={{ flex: 1, backgroundColor: 'white', color: '#374151', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentProcessingModal;
