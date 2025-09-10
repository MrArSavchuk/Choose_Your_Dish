// src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error("[ErrorBoundary]", err, info); }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app text-app flex items-center justify-center px-4">
          <div className="card max-w-xl text-center">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-muted mb-4">Please refresh the page. If the issue persists, try again later.</p>
            <button className="btn-primary" onClick={() => location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
