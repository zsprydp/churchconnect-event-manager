import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, Upload, Trash2, HardDrive } from 'lucide-react';
import { getStorageUsage, formatBytes, exportAllData, importAllData, clearAllData } from '../utils/storage';

const SettingsView = ({ events, eventTemplates, addNotification, setShowCreateEventTemplate, onDataImported }) => {
  const [storageUsed, setStorageUsed] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setStorageUsed(getStorageUsage());
  }, [events]);

  const handleExport = () => {
    const backup = exportAllData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `churchconnect-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Backup exported successfully', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const result = importAllData(parsed);
        if (result.success) {
          addNotification(`Imported: ${result.imported.join(', ')}. Reload the page to see changes.`, 'success');
          setStorageUsed(getStorageUsage());
          if (onDataImported) onDataImported();
        } else {
          addNotification(`Import failed: ${result.error}`, 'error');
        }
      } catch {
        addNotification('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (window.confirm('Delete ALL app data? This cannot be undone.')) {
      clearAllData();
      addNotification('All data cleared. Reload the page.', 'success');
      setStorageUsed(0);
      if (onDataImported) onDataImported();
    }
  };

  const usagePercent = Math.min((storageUsed / (4.5 * 1024 * 1024)) * 100, 100);
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Settings</h2>

      {/* Event Templates Management */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Event Templates</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {Object.entries(eventTemplates).map(([key, template]) => (
            <div key={key} style={{ border: '1px solid #E8E0D8', borderRadius: '8px', padding: '16px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>{template.name}</h4>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete template "${template.name}"?`)) {
                      const newTemplates = { ...eventTemplates };
                      delete newTemplates[key];
                      // In a real app, this would update state
                      addNotification('Template deleted', 'success');
                    }
                  }}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Delete
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#9B9590', marginBottom: '8px' }}>Type: {template.eventType}</p>
              {template.customQuestions && template.customQuestions.length > 0 && (
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Questions:</p>
                  {template.customQuestions.map((q, index) => (
                    <p key={index} style={{ fontSize: '11px', color: '#9B9590', marginLeft: '8px' }}>
                      • {q.question} ({q.type})
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowCreateEventTemplate(true)}
          style={{
            backgroundColor: '#7B2D4E',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus style={{ height: '16px', width: '16px' }} />
          Create New Template
        </button>
      </div>

      {/* Archive Settings */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Archive Settings</h3>
        <div style={{ space: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" />
              <span>Auto-archive events 30 days after completion</span>
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" />
              <span>Archive events when capacity is reached</span>
            </label>
          </div>
          <button
            onClick={() => {
              const archivedCount = events.filter((e) => e.status === 'archived').length;
              addNotification(`${archivedCount} events currently archived`, 'info');
            }}
            style={{
              backgroundColor: '#9B9590',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            View Archive Statistics
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginTop: '20px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Data Management</h3>

        {/* Storage usage bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <HardDrive style={{ height: '16px', width: '16px', color: '#9B9590' }} aria-hidden="true" />
            <span style={{ fontSize: '14px', color: '#6B6560' }}>
              Storage: {formatBytes(storageUsed)} / {formatBytes(4.5 * 1024 * 1024)}
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#E8E0D8', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${usagePercent}%`,
                backgroundColor: usagePercent > 80 ? '#dc2626' : usagePercent > 60 ? '#f59e0b' : '#10b981',
                borderRadius: '4px',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            style={{
              backgroundColor: '#7B2D4E',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}
          >
            <Download style={{ height: '16px', width: '16px' }} aria-hidden="true" />
            Export Backup
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}
          >
            <Upload style={{ height: '16px', width: '16px' }} aria-hidden="true" />
            Import Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            aria-label="Import backup file"
          />

          <button
            onClick={handleClearAll}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}
          >
            <Trash2 style={{ height: '16px', width: '16px' }} aria-hidden="true" />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
