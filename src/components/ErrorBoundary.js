import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px 32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              An unexpected error occurred. Your data is safe in local storage.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{
                textAlign: 'left',
                fontSize: '12px',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'auto',
                maxHeight: '160px'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
