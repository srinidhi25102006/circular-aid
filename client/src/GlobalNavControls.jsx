import { useNavigation } from './NavigationContext';

function GlobalNavControls({ style, className = '' }) {
  const { goBack, goForward, canGoBack, canGoForward } = useNavigation();

  return (
    <div
      className={`global-nav-controls ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        userSelect: 'none',
        ...style,
      }}
    >
      <button
        type="button"
        className="nav-control-btn"
        onClick={goBack}
        disabled={!canGoBack}
        title={canGoBack ? 'Back' : 'No previous page in history'}
        aria-label="Back"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid var(--border, #cbd5e1)',
          background: canGoBack ? 'var(--card-bg, #ffffff)' : '#f1f5f9',
          color: canGoBack ? 'var(--text, #0f172a)' : '#94a3b8',
          cursor: canGoBack ? 'pointer' : 'not-allowed',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 800,
          transition: 'all 0.18s ease',
          boxShadow: canGoBack ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
          opacity: canGoBack ? 1 : 0.45,
          padding: 0,
          outline: 'none',
        }}
      >
        ←
      </button>

      <button
        type="button"
        className="nav-control-btn"
        onClick={goForward}
        disabled={!canGoForward}
        title={canGoForward ? 'Forward' : 'No forward page in history'}
        aria-label="Forward"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid var(--border, #cbd5e1)',
          background: canGoForward ? 'var(--card-bg, #ffffff)' : '#f1f5f9',
          color: canGoForward ? 'var(--text, #0f172a)' : '#94a3b8',
          cursor: canGoForward ? 'pointer' : 'not-allowed',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 800,
          transition: 'all 0.18s ease',
          boxShadow: canGoForward ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
          opacity: canGoForward ? 1 : 0.45,
          padding: 0,
          outline: 'none',
        }}
      >
        →
      </button>
    </div>
  );
}

export default GlobalNavControls;
