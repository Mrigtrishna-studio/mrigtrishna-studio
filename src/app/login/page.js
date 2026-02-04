'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // State to track if we are typing Email (step 1) or Code (step 2)
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Handle Sending the Code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email }),
      });

      const data = await res.json();
      
      if (data.success) {
        setStep(2); // Move to next step
        setMessage('Code sent! Check your email.');
      } else {
        setMessage(data.message || 'Failed to send code.');
      }
    } catch (err) {
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Verifying the Code
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, code }),
      });

      const data = await res.json();

      if (data.success) {
        // Success! Redirect to Admin Dashboard
        router.push('/admin'); 
      } else {
        setMessage(data.message || 'Invalid code.');
      }
    } catch (err) {
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-6">
      
      <div className="w-full max-w-md bg-navy-light border border-taupe/30 rounded-2xl p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-navy border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
            <Lock size={20} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Studio Access</h1>
          <p className="text-slate text-sm mt-2">Restricted to authorized personnel only.</p>
        </div>

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-light">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mrigtrishna.com"
                  className="w-full bg-navy border border-taupe rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-gold transition-colors"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-hover text-navy font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Send Access Code <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Form */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-light">Enter 6-Digit Code</label>
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-navy border border-taupe rounded-lg py-2.5 px-4 text-center text-2xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-gold transition-colors"
                maxLength={6}
                required
              />
              <p className="text-xs text-center text-slate">Code sent to {email}</p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-hover text-navy font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Login"}
            </button>
            
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate hover:text-white mt-4"
            >
              ← Use a different email
            </button>
          </form>
        )}

        {/* Status Messages */}
        {message && (
          <div className="mt-6 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm text-center">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}   