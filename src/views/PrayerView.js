import React, { useState, useMemo } from 'react';
import { Heart, Star, Shield, Clock, CheckCircle, ChevronDown, ChevronUp, HandHeart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CATEGORY_COLORS = {
  health: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  personal: { bg: '#eff6ff', text: '#7B2D4E', border: '#E8E0D8' },
  family: { bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe' },
  financial: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  community: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
  thanksgiving: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  other: { bg: '#FAF5EF', text: '#9B9590', border: '#E8E0D8' },
};

const CATEGORIES = ['health', 'personal', 'family', 'financial', 'community', 'thanksgiving', 'other'];

const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};

const PrayerView = ({ prayerPosts, setPrayerPosts, addNotification }) => {
  const { profile } = useAuth();
  const userName = profile?.name || 'Guest';
  const userRole = profile?.role || 'member';

  const [postType, setPostType] = useState('request');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('health');
  const [anonymous, setAnonymous] = useState(false);

  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [expandedPrayers, setExpandedPrayers] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      addNotification('Please enter your prayer request or praise.', 'error');
      return;
    }

    const newPost = {
      id: Date.now(),
      type: postType,
      author: anonymous ? 'Anonymous' : userName,
      content: content.trim(),
      anonymous,
      createdAt: new Date().toISOString(),
      prayedCount: 0,
      prayedBy: [],
      status: 'active',
      category,
    };

    setPrayerPosts((prev) => [newPost, ...prev]);
    setContent('');
    setAnonymous(false);
    addNotification(postType === 'request' ? 'Prayer request submitted!' : 'Praise report shared!', 'success');
  };

  const handlePrayed = (postId) => {
    setPrayerPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          if (post.prayedBy.includes(userName)) {
            return post;
          }
          return {
            ...post,
            prayedCount: post.prayedCount + 1,
            prayedBy: [...post.prayedBy, userName],
          };
        }
        return post;
      })
    );
  };

  const handleMarkAnswered = (postId) => {
    setPrayerPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, status: 'answered' } : post)));
    addNotification('Prayer marked as answered! Praise God!', 'success');
  };

  const toggleExpanded = (postId) => {
    setExpandedPrayers((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const filteredPosts = useMemo(() => {
    let posts = [...prayerPosts];

    if (filterType === 'requests') {
      posts = posts.filter((p) => p.type === 'request');
    } else if (filterType === 'praises') {
      posts = posts.filter((p) => p.type === 'praise');
    }

    if (filterCategory !== 'all') {
      posts = posts.filter((p) => p.category === filterCategory);
    }

    if (sortBy === 'newest') {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      posts.sort((a, b) => b.prayedCount - a.prayedCount);
    }

    return posts;
  }, [prayerPosts, filterType, filterCategory, sortBy]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Heart style={{ height: '28px', width: '28px', color: '#dc2626' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Prayer &amp; Praise</h2>
      </div>
      <p style={{ color: '#9B9590', marginTop: 0, marginBottom: '24px' }}>Supporting each other through prayer</p>

      {/* New Post Form */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setPostType('request')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                backgroundColor: postType === 'request' ? '#FAF5EF' : '#F0E8DD',
                color: postType === 'request' ? '#7B2D4E' : '#9B9590',
                transition: 'all 0.2s',
              }}
            >
              Prayer Request
            </button>
            <button
              type="button"
              onClick={() => setPostType('praise')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                backgroundColor: postType === 'praise' ? '#fef3c7' : '#F0E8DD',
                color: postType === 'praise' ? '#d97706' : '#9B9590',
                transition: 'all 0.2s',
              }}
            >
              Praise Report
            </button>
          </div>

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={postType === 'request' ? 'Share your prayer request...' : 'Share your praise...'}
            required
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />

          {/* Category & Options Row */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: 'white',
                textTransform: 'capitalize',
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: '#4b5563',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Post anonymously
            </label>

            <button
              type="submit"
              style={{
                marginLeft: 'auto',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: postType === 'request' ? '#7B2D4E' : '#d97706',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Type tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'requests', label: 'Prayer Requests' },
            { id: 'praises', label: 'Praises' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: filterType === tab.id ? '600' : '400',
                backgroundColor: filterType === tab.id ? '#7B2D4E' : '#F0E8DD',
                color: filterType === tab.id ? 'white' : '#4b5563',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            backgroundColor: 'white',
          }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            backgroundColor: 'white',
            marginLeft: 'auto',
          }}
        >
          <option value="newest">Newest first</option>
          <option value="most_prayed">Most prayed for</option>
        </select>
      </div>

      {/* Post Feed */}
      {filteredPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
          <Heart style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '16px' }}>No posts yet. Be the first to share!</p>
        </div>
      )}

      {filteredPosts.map((post) => {
        const catColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.other;
        const isRequest = post.type === 'request';
        const isAnswered = post.status === 'answered';
        const hasPrayed = post.prayedBy.includes(userName);
        const isExpanded = expandedPrayers[post.id];
        const canMarkAnswered = isRequest && !isAnswered && (post.author === userName || userRole === 'admin');

        return (
          <div
            key={post.id}
            style={{
              backgroundColor: isRequest ? '#f0f7ff' : '#fffdf0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
              border: isAnswered ? '2px solid #10b981' : `1px solid ${isRequest ? '#FAF5EF' : '#fef3c7'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}
          >
            {/* Top row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isRequest ? (
                  <HandHeart style={{ height: '20px', width: '20px', color: '#7B2D4E' }} />
                ) : (
                  <Star style={{ height: '20px', width: '20px', color: '#d97706' }} />
                )}
                <span style={{ fontWeight: '600', fontSize: '14px', color: '#2D2A26' }}>
                  {post.anonymous ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Shield style={{ height: '14px', width: '14px', color: '#9B9590' }} />
                      Anonymous
                    </span>
                  ) : (
                    post.author
                  )}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#9ca3af',
                  }}
                >
                  <Clock style={{ height: '12px', width: '12px' }} />
                  {getTimeAgo(post.createdAt)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isAnswered && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    <CheckCircle style={{ height: '14px', width: '14px' }} />
                    Answered!
                  </span>
                )}
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: catColor.bg,
                    color: catColor.text,
                    border: `1px solid ${catColor.border}`,
                    fontSize: '12px',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}
                >
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <p style={{ fontSize: '15px', color: '#6B6560', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              {post.content}
            </p>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => handlePrayed(post.id)}
                disabled={hasPrayed}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: hasPrayed ? 'default' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  backgroundColor: hasPrayed ? '#fecaca' : '#fee2e2',
                  color: hasPrayed ? '#dc2626' : '#ef4444',
                  opacity: hasPrayed ? 1 : 0.85,
                  transition: 'all 0.2s',
                }}
              >
                <Heart
                  style={{
                    height: '16px',
                    width: '16px',
                    fill: hasPrayed ? '#dc2626' : 'none',
                  }}
                />
                {isRequest ? 'I Prayed for This' : 'Amen!'} ({post.prayedCount})
              </button>

              {post.prayedBy.length > 0 && (
                <button
                  onClick={() => toggleExpanded(post.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#9B9590',
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp style={{ height: '14px', width: '14px' }} />
                  ) : (
                    <ChevronDown style={{ height: '14px', width: '14px' }} />
                  )}
                  {post.prayedBy.length} {post.prayedBy.length === 1 ? 'person' : 'people'} prayed
                </button>
              )}

              {canMarkAnswered && (
                <button
                  onClick={() => handleMarkAnswered(post.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    marginLeft: 'auto',
                    transition: 'all 0.2s',
                  }}
                >
                  <CheckCircle style={{ height: '16px', width: '16px' }} />
                  Mark as Answered
                </button>
              )}
            </div>

            {/* Expanded prayed-by list */}
            {isExpanded && post.prayedBy.length > 0 && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#4b5563',
                }}
              >
                <span style={{ fontWeight: '600' }}>Prayed by:</span> {post.prayedBy.join(', ')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PrayerView;
