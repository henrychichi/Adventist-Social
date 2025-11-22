import React, { useState } from 'react';
import { X, CreditCard, CheckCircle, Lock, Loader2, Zap, Star, Smartphone, Signal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { upgradeAccount } = useAuth();
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');

  // Mobile Money State
  const [mobileProvider, setMobileProvider] = useState('Airtel Money');
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const selectPlan = (val: string) => {
    setAmount(val);
    setStep('payment');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    upgradeAccount(); // Unlock features
    setIsProcessing(false);
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('plan');
    setAmount('');
    setIsProcessing(false);
    setPaymentMethod('card');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-blue-900 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full opacity-10 blur-2xl -mr-10 -mt-10"></div>
          <button 
            onClick={resetAndClose}
            className="absolute top-4 right-4 p-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-amber-400 p-2 rounded-full text-blue-900">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Monthly Subscription</h2>
              <p className="text-blue-200 text-xs">Support the platform & ministry.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'plan' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-center text-slate-600 font-medium mb-2">Choose a plan to support us</h3>
              
              <button
                onClick={() => selectPlan('10')}
                className="w-full group relative overflow-hidden border-2 border-blue-100 hover:border-blue-500 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-md"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Basic
                  </span>
                  <span className="text-2xl font-bold text-slate-900">K10<span className="text-sm text-slate-500 font-normal">/mo</span></span>
                </div>
                <p className="text-sm text-slate-500">Standard monthly contribution to support local church digital initiatives.</p>
              </button>

              <button
                onClick={() => selectPlan('100')}
                className="w-full group relative overflow-hidden border-2 border-amber-100 hover:border-amber-400 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-md"
              >
                <div className="absolute top-0 right-0 bg-amber-400 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                  MOST POPULAR
                </div>
                <div className="flex justify-between items-center mb-2">
                   <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1">
                    <Star className="w-3 h-3" /> Premium
                  </span>
                  <span className="text-2xl font-bold text-slate-900">K100<span className="text-sm text-slate-500 font-normal">/mo</span></span>
                </div>
                <p className="text-sm text-slate-500">Become a pillar supporter helping expand our reach and development.</p>
              </button>
            </div>
          )}

          {step === 'payment' && (
            <form onSubmit={handleSubscribe} className="space-y-5 animate-fade-in">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Plan Selected</p>
                  <p className="font-bold text-slate-900">Monthly Subscription</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold">Billed Today</p>
                  <p className="font-bold text-xl text-blue-900">K{amount}</p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${paymentMethod === 'card' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <CreditCard className="w-4 h-4" /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${paymentMethod === 'mobile' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Smartphone className="w-4 h-4" /> Mobile Money
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Card Details</label>
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <div className="flex items-center border-b border-slate-300 px-4 py-3 bg-white">
                      <CreditCard className="w-5 h-5 text-slate-400 mr-3" />
                      <input 
                        type="text" 
                        placeholder="Card number" 
                        className="flex-1 outline-none text-sm"
                      />
                    </div>
                    <div className="flex bg-white">
                      <input 
                        type="text" 
                        placeholder="MM / YY" 
                        className="w-1/2 px-4 py-3 border-r border-slate-300 outline-none text-sm"
                      />
                      <input 
                        type="text" 
                        placeholder="CVC" 
                        className="w-1/2 px-4 py-3 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Network Provider</label>
                    <div className="relative">
                      <Signal className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <select 
                        className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 outline-none text-sm bg-white appearance-none"
                        value={mobileProvider}
                        onChange={(e) => setMobileProvider(e.target.value)}
                      >
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="MTN Mobile Money">MTN Mobile Money</option>
                        <option value="Zamtel Kwacha">Zamtel Kwacha</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 097xxxxxxx" 
                        className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-100">
                    You will receive a prompt on your phone to approve the transaction.
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                <Lock className="w-3 h-3" />
                Secure SSL Encrypted Transaction
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('plan')}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (paymentMethod === 'card' ? 'Confirm Payment' : 'Send Prompt')}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Subscription Active!</h3>
              <p className="text-slate-600 mb-8">
                Thank you for subscribing to the <strong>K{amount}/month</strong> plan via {paymentMethod === 'card' ? 'Card' : mobileProvider}. Your account is now fully unlocked.
              </p>
              <button
                onClick={resetAndClose}
                className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-md"
              >
                Return to App
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};