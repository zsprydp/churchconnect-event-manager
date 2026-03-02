import React, { useState, useMemo, useCallback } from 'react';
import { PlayCircle, Search, Plus, Eye, X, Youtube, Headphones, FileText, Film, Link as LinkIcon } from 'lucide-react';

const TYPE_COLORS = {
  sermon: { bg: '#f3e8ff', text: '#7c3aed', border: '#ddd6fe', accent: '#8b5cf6' },
  video: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', accent: '#ef4444' },
  document: { bg: '#eff6ff', text: '#7B2D4E', border: '#E8E0D8', accent: '#7B2D4E' },
};

const TYPE_ICONS = {
  sermon: '\uD83C\uDFA4',
  video: '\uD83C\uDFA5',
  document: '\uD83D\uDCC4',
};

const extractYoutubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
};

const MediaView = ({ mediaItems, setMediaItems, events, addNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [speakerFilter, setSpeakerFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedia, setNewMedia] = useState({
    title: '',
    type: 'sermon',
    speaker: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    youtubeUrl: '',
    audioUrl: '',
    notesUrl: '',
    tags: '',
    series: '',
    eventId: '',
  });

  const uniqueSeries = useMemo(() => {
    const series = mediaItems.map((item) => item.series).filter((s) => s && s.trim() !== '');
    return [...new Set(series)].sort();
  }, [mediaItems]);

  const uniqueSpeakers = useMemo(() => {
    const speakers = mediaItems.map((item) => item.speaker).filter((s) => s && s.trim() !== '');
    return [...new Set(speakers)].sort();
  }, [mediaItems]);

  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        (item.speaker && item.speaker.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(term)));
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesSeries = seriesFilter === 'all' || item.series === seriesFilter;
      const matchesSpeaker = speakerFilter === 'all' || item.speaker === speakerFilter;
      return matchesSearch && matchesType && matchesSeries && matchesSpeaker;
    });
  }, [mediaItems, searchTerm, typeFilter, seriesFilter, speakerFilter]);

  const latestMedia = useMemo(() => {
    if (filteredMedia.length === 0) return null;
    const sorted = [...filteredMedia].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0];
  }, [filteredMedia]);

  const gridMedia = useMemo(() => {
    if (!latestMedia) return filteredMedia;
    return filteredMedia.filter((item) => item.id !== latestMedia.id);
  }, [filteredMedia, latestMedia]);

  const handleAddMedia = useCallback(() => {
    if (!newMedia.title.trim()) {
      addNotification('Please enter a title for the media item.', 'error');
      return;
    }

    const linkedEvent = newMedia.eventId ? events.find((e) => e.id === parseInt(newMedia.eventId)) : null;

    const item = {
      id: Date.now(),
      eventId: linkedEvent ? linkedEvent.id : null,
      eventName: linkedEvent ? linkedEvent.name : null,
      title: newMedia.title.trim(),
      type: newMedia.type,
      speaker: newMedia.speaker.trim(),
      date: newMedia.date,
      description: newMedia.description.trim(),
      youtubeUrl: newMedia.youtubeUrl.trim(),
      audioUrl: newMedia.audioUrl.trim(),
      notesUrl: newMedia.notesUrl.trim(),
      tags: newMedia.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t),
      views: 0,
      series: newMedia.series.trim(),
    };

    setMediaItems((prev) => [...prev, item]);
    setNewMedia({
      title: '',
      type: 'sermon',
      speaker: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      youtubeUrl: '',
      audioUrl: '',
      notesUrl: '',
      tags: '',
      series: '',
      eventId: '',
    });
    setShowAddForm(false);
    addNotification('Media item added successfully!', 'success');
  }, [newMedia, events, setMediaItems, addNotification]);

  const handleInputChange = useCallback((field, value) => {
    setNewMedia((prev) => ({ ...prev, [field]: value }));
  }, []);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const renderThumbnail = (item, large) => {
    const videoId = extractYoutubeId(item.youtubeUrl);
    const colors = TYPE_COLORS[item.type] || TYPE_COLORS.sermon;
    const height = large ? '280px' : '160px';

    if (videoId) {
      return (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height,
            overflow: 'hidden',
            borderRadius: large ? '12px 12px 0 0' : '8px 8px 0 0',
          }}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayCircle
              style={{
                height: large ? '64px' : '40px',
                width: large ? '64px' : '40px',
                color: 'white',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          width: '100%',
          height,
          background: `linear-gradient(135deg, ${colors.bg}, ${colors.border})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: large ? '12px 12px 0 0' : '8px 8px 0 0',
        }}
      >
        <span style={{ fontSize: large ? '64px' : '40px' }}>{TYPE_ICONS[item.type] || TYPE_ICONS.sermon}</span>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PlayCircle style={{ height: '28px', width: '28px', color: '#7c3aed' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Media Library</h2>
          </div>
          <p style={{ fontSize: '14px', color: '#9B9590', margin: '4px 0 0 40px' }}>
            Sermons, recordings, and resources
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          <Plus style={{ height: '18px', width: '18px' }} />
          Add Media
        </button>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              height: '16px',
              width: '16px',
              color: '#9ca3af',
            }}
          />
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'sermon', label: 'Sermons' },
            { value: 'video', label: 'Videos' },
            { value: 'document', label: 'Documents' },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setTypeFilter(btn.value)}
              style={{
                padding: '8px 16px',
                border: '1px solid',
                borderColor: typeFilter === btn.value ? '#7c3aed' : '#d1d5db',
                borderRadius: '6px',
                backgroundColor: typeFilter === btn.value ? '#f3e8ff' : 'white',
                color: typeFilter === btn.value ? '#7c3aed' : '#6B6560',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: typeFilter === btn.value ? '600' : '400',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <select
          value={seriesFilter}
          onChange={(e) => setSeriesFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'white',
            minWidth: '140px',
          }}
        >
          <option value="all">All Series</option>
          {uniqueSeries.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={speakerFilter}
          onChange={(e) => setSpeakerFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'white',
            minWidth: '140px',
          }}
        >
          <option value="all">All Speakers</option>
          {uniqueSpeakers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Featured / Latest */}
      {latestMedia && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '32px',
            overflow: 'hidden',
          }}
        >
          {renderThumbnail(latestMedia, true)}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  backgroundColor: (TYPE_COLORS[latestMedia.type] || TYPE_COLORS.sermon).bg,
                  color: (TYPE_COLORS[latestMedia.type] || TYPE_COLORS.sermon).text,
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {latestMedia.type}
              </span>
              {latestMedia.series && (
                <span
                  style={{
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {latestMedia.series}
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 6px 0' }}>{latestMedia.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#9B9590', fontSize: '14px' }}>
              {latestMedia.speaker && <span>{latestMedia.speaker}</span>}
              <span>{formatDate(latestMedia.date)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye style={{ height: '14px', width: '14px' }} />
                {latestMedia.views}
              </span>
            </div>
            {latestMedia.description && (
              <p style={{ color: '#9B9590', fontSize: '14px', margin: '10px 0 0 0', lineHeight: '1.5' }}>
                {latestMedia.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Media Grid */}
      {gridMedia.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {gridMedia.map((item) => {
            const colors = TYPE_COLORS[item.type] || TYPE_COLORS.sermon;
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {renderThumbnail(item, false)}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px' }}>{TYPE_ICONS[item.type] || TYPE_ICONS.sermon}</span>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0, flex: 1, lineHeight: '1.3' }}>
                      {item.title}
                    </h4>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      fontSize: '13px',
                      color: '#9B9590',
                    }}
                  >
                    {item.speaker && <span>{item.speaker}</span>}
                    {item.speaker && <span>·</span>}
                    <span>{formatDate(item.date)}</span>
                  </div>

                  {item.series && (
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '500',
                        marginBottom: '8px',
                      }}
                    >
                      {item.series}
                    </span>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            backgroundColor: '#F0E8DD',
                            color: '#9B9590',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <span
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '12px' }}
                    >
                      <Eye style={{ height: '13px', width: '13px' }} />
                      {item.views} views
                    </span>
                    {item.eventName && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: colors.text,
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                        title={`Linked to: ${item.eventName}`}
                      >
                        <LinkIcon style={{ height: '12px', width: '12px' }} />
                        {item.eventName}
                      </span>
                    )}
                  </div>

                  {/* Media links */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {item.youtubeUrl && (
                      <a
                        href={item.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'none',
                        }}
                      >
                        <Youtube style={{ height: '14px', width: '14px' }} />
                        YouTube
                      </a>
                    )}
                    {item.audioUrl && (
                      <a
                        href={item.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#f0fdf4',
                          color: '#16a34a',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'none',
                        }}
                      >
                        <Headphones style={{ height: '14px', width: '14px' }} />
                        Audio
                      </a>
                    )}
                    {item.notesUrl && (
                      <a
                        href={item.notesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#eff6ff',
                          color: '#7B2D4E',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'none',
                        }}
                      >
                        <FileText style={{ height: '14px', width: '14px' }} />
                        Notes
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !latestMedia && (
          <div style={{ textAlign: 'center', paddingTop: '48px' }}>
            <Film style={{ height: '48px', width: '48px', color: '#9B9590', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Media Items</h3>
            <p style={{ color: '#9B9590' }}>Add sermons, videos, and documents to build your media library.</p>
          </div>
        )
      )}

      {/* Add Media Modal */}
      {showAddForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Add Media Item</h3>
              <button
                onClick={() => setShowAddForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ height: '20px', width: '20px', color: '#9B9590' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Title */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#6B6560',
                  }}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={newMedia.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter title..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Type & Date row */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#6B6560',
                    }}
                  >
                    Type
                  </label>
                  <select
                    value={newMedia.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="sermon">Sermon</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#6B6560',
                    }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={newMedia.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Speaker */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#6B6560',
                  }}
                >
                  Speaker
                </label>
                <input
                  type="text"
                  value={newMedia.speaker}
                  onChange={(e) => handleInputChange('speaker', e.target.value)}
                  placeholder="Speaker name..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#6B6560',
                  }}
                >
                  Description
                </label>
                <textarea
                  value={newMedia.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* URLs */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#6B6560',
                  }}
                >
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={newMedia.youtubeUrl}
                  onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#6B6560',
                  }}
                >
                  Audio URL
                </label>
                <input
                  type="url"
                  value={newMedia.audioUrl}
                  onChange={(e) => handleInputChange('audioUrl', e.target.value)}
                  placeholder="https://example.com/audio/..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#6B6560',
                  }}
                >
                  Notes / PDF URL
                </label>
                <input
                  type="url"
                  value={newMedia.notesUrl}
                  onChange={(e) => handleInputChange('notesUrl', e.target.value)}
                  placeholder="https://example.com/docs/..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Tags */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#6B6560',
                  }}
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newMedia.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Easter, Hope, Faith..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Series */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#6B6560',
                  }}
                >
                  Series
                </label>
                <input
                  type="text"
                  list="series-list"
                  value={newMedia.series}
                  onChange={(e) => handleInputChange('series', e.target.value)}
                  placeholder="Series name..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                <datalist id="series-list">
                  {uniqueSeries.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* Link to Event */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#6B6560',
                  }}
                >
                  Link to Event
                </label>
                <select
                  value={newMedia.eventId}
                  onChange={(e) => handleInputChange('eventId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">None</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#6B6560',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMedia}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Add Media
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaView;
