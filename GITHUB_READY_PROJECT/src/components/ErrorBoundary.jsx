import React from 'react';
import logoImg from '../assets/logo.jpg';
import { RotateCw, ShieldCheck, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleSafeReset = () => {
    try {
      // Clear current user session in case of corrupt state
      localStorage.removeItem('dronacharya_rd_current_user_v3');
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl text-center space-y-4">
            <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-[#d4af37] to-amber-200 mx-auto shadow-lg">
              <img
                src={logoImg}
                alt="Dronacharya Logo"
                className="w-full h-full object-cover rounded-full bg-white shadow-inner"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Self-Healing System Active
              </span>
              <h2 className="text-xl font-extrabold text-white mt-2 font-display">
                DRONACHARYA R&D LAB MANAGMENT
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Portal auto-protection has prevented a crash. Your lab records remain safely intact in memory.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reload Portal Safely</span>
              </button>

              <button
                onClick={this.handleSafeReset}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Reset Identity Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
