import React, { useState } from 'react';
import { Home, Plus, Search, Edit2, Trash2, X, UserPlus } from 'lucide-react';

const FamiliesView = ({ families, setFamilies, householdMembers, setHouseholdMembers, addNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState(null);

  const [newFamily, setNewFamily] = useState({
    name: '',
    address: '',
    primaryContactName: '',
    primaryContactEmail: '',
  });
  const [newMembers, setNewMembers] = useState([]);
  const [newMemberForm, setNewMemberForm] = useState({ name: '', relationship: 'head' });

  const filteredFamilies = families.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.primaryContactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMembersForFamily = (familyId) => householdMembers.filter((m) => m.householdId === familyId);

  const resetForm = () => {
    setNewFamily({ name: '', address: '', primaryContactName: '', primaryContactEmail: '' });
    setNewMembers([]);
    setNewMemberForm({ name: '', relationship: 'head' });
    setShowAddFamily(false);
    setEditingFamilyId(null);
  };

  const handleAddMember = () => {
    if (!newMemberForm.name.trim()) return;
    setNewMembers((prev) => [...prev, { ...newMemberForm, tempId: Date.now() }]);
    setNewMemberForm({ name: '', relationship: 'head' });
  };

  const handleRemoveNewMember = (tempId) => {
    setNewMembers((prev) => prev.filter((m) => m.tempId !== tempId));
  };

  const handleSaveFamily = () => {
    if (!newFamily.name.trim() || !newFamily.primaryContactName.trim() || !newFamily.primaryContactEmail.trim()) {
      addNotification('Please fill in all required fields.', 'error');
      return;
    }

    if (editingFamilyId) {
      setFamilies((prev) => prev.map((f) => (f.id === editingFamilyId ? { ...f, ...newFamily } : f)));

      const existingMemberIds = householdMembers.filter((m) => m.householdId === editingFamilyId).map((m) => m.id);
      const nextMemberId = householdMembers.length > 0 ? Math.max(...householdMembers.map((m) => m.id)) + 1 : 1;

      setHouseholdMembers((prev) => {
        const withoutOld = prev.filter((m) => !existingMemberIds.includes(m.id));
        const updatedMembers = newMembers.map((m, i) => ({
          id: nextMemberId + i,
          householdId: editingFamilyId,
          name: m.name,
          relationship: m.relationship,
        }));
        return [...withoutOld, ...updatedMembers];
      });

      addNotification('Family updated successfully!', 'success');
    } else {
      const newId = families.length > 0 ? Math.max(...families.map((f) => f.id)) + 1 : 1;
      const familyRecord = {
        id: newId,
        ...newFamily,
        primaryContactId: null,
      };
      setFamilies((prev) => [...prev, familyRecord]);

      const nextMemberId = householdMembers.length > 0 ? Math.max(...householdMembers.map((m) => m.id)) + 1 : 1;
      const memberRecords = newMembers.map((m, i) => ({
        id: nextMemberId + i,
        householdId: newId,
        name: m.name,
        relationship: m.relationship,
      }));
      setHouseholdMembers((prev) => [...prev, ...memberRecords]);

      addNotification('Family added successfully!', 'success');
    }

    resetForm();
  };

  const handleEditFamily = (family) => {
    setEditingFamilyId(family.id);
    setNewFamily({
      name: family.name,
      address: family.address || '',
      primaryContactName: family.primaryContactName,
      primaryContactEmail: family.primaryContactEmail,
    });
    const members = getMembersForFamily(family.id);
    setNewMembers(members.map((m) => ({ ...m, tempId: m.id })));
    setShowAddFamily(true);
  };

  const handleDeleteFamily = (family) => {
    if (window.confirm(`Delete "${family.name}" and all its members?`)) {
      setFamilies((prev) => prev.filter((f) => f.id !== family.id));
      setHouseholdMembers((prev) => prev.filter((m) => m.householdId !== family.id));
      addNotification('Family deleted.', 'success');
    }
  };

  const relationshipLabel = (rel) => {
    const labels = { head: 'Head', spouse: 'Spouse', child: 'Child', other: 'Other' };
    return labels[rel] || rel;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Families</h2>
        <button
          onClick={() => {
            resetForm();
            setShowAddFamily(true);
          }}
          style={{
            backgroundColor: '#3b82f6',
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
          Add Family
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              height: '16px',
              width: '16px',
              color: '#6b7280',
            }}
          />
          <input
            type="text"
            aria-label="Search families"
            placeholder="Search families by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>

      {/* Add/Edit Family Form */}
      {showAddFamily && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              {editingFamilyId ? 'Edit Family' : 'Add New Family'}
            </h3>
            <button
              onClick={resetForm}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X style={{ height: '20px', width: '20px', color: '#6b7280' }} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                Household Name *
              </label>
              <input
                type="text"
                value={newFamily.name}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. The Smith Family"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                Address
              </label>
              <input
                type="text"
                value={newFamily.address}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main St"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                Primary Contact Name *
              </label>
              <input
                type="text"
                value={newFamily.primaryContactName}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, primaryContactName: e.target.value }))}
                placeholder="John Smith"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                Primary Contact Email *
              </label>
              <input
                type="email"
                value={newFamily.primaryContactEmail}
                onChange={(e) => setNewFamily((prev) => ({ ...prev, primaryContactEmail: e.target.value }))}
                placeholder="john@email.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Members Section */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>Members</h4>

            {newMembers.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                {newMembers.map((member) => (
                  <div
                    key={member.tempId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: '14px' }}>{member.name}</span>
                    <span
                      style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {relationshipLabel(member.relationship)}
                    </span>
                    <button
                      onClick={() => handleRemoveNewMember(member.tempId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: '#dc2626',
                      }}
                    >
                      <X style={{ height: '14px', width: '14px' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Member name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMember();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  Relationship
                </label>
                <select
                  value={newMemberForm.relationship}
                  onChange={(e) => setNewMemberForm((prev) => ({ ...prev, relationship: e.target.value }))}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                  }}
                >
                  <option value="head">Head</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                onClick={handleAddMember}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                <UserPlus style={{ height: '14px', width: '14px' }} />
                Add
              </button>
            </div>
          </div>

          {/* Save / Cancel */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button
              onClick={resetForm}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFamily}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {editingFamilyId ? 'Update Family' : 'Save Family'}
            </button>
          </div>
        </div>
      )}

      {/* Family Cards */}
      {filteredFamilies.length === 0 && !showAddFamily && (
        <div style={{ textAlign: 'center', paddingTop: '48px' }}>
          <Home style={{ height: '48px', width: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Families Yet</h3>
          <p style={{ color: '#6b7280' }}>Click "Add Family" to create your first household profile.</p>
        </div>
      )}

      {filteredFamilies.map((family) => {
        const members = getMembersForFamily(family.id);
        return (
          <div
            key={family.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '20px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{family.name}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 2px 0' }}>
                  {family.primaryContactName} &bull; {family.primaryContactEmail}
                </p>
                {family.address && (
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>{family.address}</p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span
                    style={{
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>

                {members.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    {members.map((member) => (
                      <div key={member.id} style={{ fontSize: '14px', color: '#374151', marginBottom: '2px' }}>
                        {member.name}{' '}
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          ({relationshipLabel(member.relationship)})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleEditFamily(family)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                  title="Edit Family"
                >
                  <Edit2 style={{ height: '14px', width: '14px' }} />
                </button>
                <button
                  onClick={() => handleDeleteFamily(family)}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                  title="Delete Family"
                >
                  <Trash2 style={{ height: '14px', width: '14px' }} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FamiliesView;
