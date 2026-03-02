import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Shield, User } from 'lucide-react';

const roleColors = {
  admin: '#dc2626',
  coordinator: '#2563eb',
  volunteer: '#16a34a',
  member: '#6b7280',
};

const UserMenu = () => {
  const { profile, signOut, isDemo } = useAuth();

  if (!profile) return null;

  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User style={{ height: '16px', width: '16px', color: '#2563eb' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#111827',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {profile.name || profile.email}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield style={{ height: '10px', width: '10px', color: roleColors[profile.role] || '#6b7280' }} />
            <span
              style={{
                fontSize: '11px',
                color: roleColors[profile.role] || '#6b7280',
                fontWeight: '500',
                textTransform: 'capitalize',
              }}
            >
              {profile.role}
              {isDemo && ' (demo)'}
            </span>
          </div>
        </div>
      </div>
      {!isDemo && (
        <button
          onClick={signOut}
          style={{
            width: '100%',
            padding: '6px 8px',
            backgroundColor: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <LogOut style={{ height: '12px', width: '12px' }} />
          Sign Out
        </button>
      )}
    </div>
  );
};

export default UserMenu;
