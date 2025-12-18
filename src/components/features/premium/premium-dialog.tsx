'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ChevronDown, ArrowLeft, CreditCard, Building2, Search } from 'lucide-react';

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'plans' | 'payment';
type PaymentMethod = 'card' | 'bank';

const PLANS = [
  {
    id: 'monthly',
    name: '1 month',
    price: '$7.99',
    period: '/mo',
    yearlyTotal: null,
  },
  {
    id: 'yearly',
    name: '12 months',
    price: '$4.99',
    period: '/mo',
    yearlyTotal: '$59.88',
    badge: '50% OFF - MOST POPULAR',
  },
  {
    id: 'semi-annual',
    name: '6 months',
    price: '$6.99',
    period: '/mo',
    yearlyTotal: '$41.94',
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path fill="currentColor" d="M17.301 10.5h5.898a.375.375 0 0 1 .288.615l-2.949 3.54a.375.375 0 0 1-.576 0l-2.949-3.54a.375.375 0 0 1 .288-.615Zm-16.5 3h5.898a.375.375 0 0 0 .288-.615l-2.949-3.54a.375.375 0 0 0-.576 0l-2.949 3.54a.375.375 0 0 0 .288.615Z" />
        <path fill="currentColor" fillRule="evenodd" d="M12 4.5a7.483 7.483 0 0 0-5.785 2.727.75.75 0 1 1-1.157-.954A9.003 9.003 0 0 1 20.875 10.5H19.35a7.503 7.503 0 0 0-7.35-6Zm-7.35 9a7.503 7.503 0 0 0 13.135 3.273.75.75 0 1 1 1.157.954A9.003 9.003 0 0 1 3.125 13.5H4.65Z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Recurring',
    subtitle: 'Tasks',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path fill="currentColor" d="M21.09 2.16c-1.996 0-4.24 1.1-6.666 3.271-1.692 1.514-3.145 3.248-4.152 4.566A5.625 5.625 0 0 0 3 15.375c0 2.926-1.522 4.23-1.598 4.293A.75.75 0 0 0 1.875 21h6.75a5.626 5.626 0 0 0 5.378-7.272c1.318-1.007 3.052-2.46 4.566-4.151 2.171-2.427 3.272-4.67 3.272-6.668a.75.75 0 0 0-.75-.75ZM8.626 19.5H3.433c.536-.894 1.067-2.253 1.067-4.125A4.125 4.125 0 1 1 8.625 19.5Zm3.041-8.853a37.8 37.8 0 0 1 .954-1.171 7.144 7.144 0 0 1 1.904 1.904c-.384.326-.774.644-1.17.954a5.668 5.668 0 0 0-1.688-1.687Zm3.99-.269a8.644 8.644 0 0 0-2.034-2.033c1.838-1.986 4.31-4.16 6.637-4.604-.444 2.326-2.618 4.799-4.604 6.637Z" />
      </svg>
    ),
    title: 'Custom',
    subtitle: 'Themes',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <path fill="currentColor" d="M23.74 6.327a5.5 5.5 0 0 1-.495 7.212L21.3 15.483a.75.75 0 0 1-1.06 0l-6.718-6.717a.75.75 0 0 1 0-1.06l1.944-1.945a5.501 5.501 0 0 1 7.212-.495l3.045-3.044a.75.75 0 0 1 1.06 1.06L23.74 6.327Zm-2.97 7.566 1.415-1.415a4 4 0 1 0-5.657-5.657l-1.415 1.415 5.657 5.656ZM13.778 11.215a.75.75 0 0 1 0 1.06l-2.127 2.127 2.947 2.947 2.126-2.126a.75.75 0 1 1 1.06 1.06L15.66 18.41l.827.826a.75.75 0 0 1 0 1.06l-1.945 1.946a5.5 5.5 0 0 1-7.212.494L4.286 25.78a.75.75 0 0 1-1.061-1.06l3.045-3.046a5.5 5.5 0 0 1 .494-7.212l1.945-1.944a.75.75 0 0 1 1.06 0l.823.822 2.126-2.126a.75.75 0 0 1 1.06 0ZM7.83 21.188a4 4 0 0 0 5.65-.007l1.415-1.414-5.657-5.657-1.414 1.414a4 4 0 0 0-.007 5.65l.007.007.006.006Z" />
      </svg>
    ),
    title: 'WhatsApp',
    subtitle: 'Integration',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
        <rect x="4" y="14" width="12" height="8" rx="4" stroke="currentColor" strokeWidth="2" />
        <rect x="20" y="14" width="12" height="8" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      </svg>
    ),
    title: 'Color tags',
    subtitle: 'and labels',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
        <path fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 8 2.43 6.57L27 17l-6.57 2.43L18 26l-2.43-6.57L9 17l6.57-2.43L18 8ZM26.5 6l.675 1.825L29 8.5l-1.825.675L26.5 11l-.675-1.825L24 8.5l1.825-.675L26.5 6Z" />
      </svg>
    ),
    title: 'AI-Powered',
    subtitle: 'Features',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
        <circle cx="10" cy="18" r="3" fill="currentColor" />
        <circle cx="18" cy="18" r="3" fill="currentColor" />
        <circle cx="26" cy="18" r="3" fill="currentColor" />
      </svg>
    ),
    title: 'Unlimited Daily',
    subtitle: 'Planner',
  },
];

const BANKS = [
  { id: 'mercury', name: 'Mercury', icon: 'simple-icons:mercurial', color: '#5865F2' },
  { id: 'chase', name: 'Chase', icon: 'simple-icons:chase', color: '#117ACA' },
  { id: 'bofa', name: 'Bank of Amer...', icon: 'simple-icons:bankofamerica', color: '#012169' },
  { id: 'wellsfargo', name: 'Wells Fargo', icon: 'simple-icons:wellsfargo', color: '#D71E28' },
  { id: 'capitalone', name: 'Capital One', icon: 'simple-icons:capitalone', color: '#D03027' },
  { id: 'relay', name: 'Relay Financial', icon: 'lucide:building-2', color: '#1a1a2e' },
  { id: 'paypal', name: 'PayPal', icon: 'logos:paypal', color: '#003087' },
  { id: 'usbank', name: 'US Bank', icon: 'simple-icons:usbank', color: '#D22630' },
  { id: 'citi', name: 'Citibank', icon: 'simple-icons:citibank', color: '#003B70' },
];

const COUNTRIES = [
  'Egypt', 'United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia',
];

export function PremiumDialog({ open, onOpenChange }: PremiumDialogProps) {
  const [selectedPlan, setSelectedPlan] = React.useState('yearly');
  const [step, setStep] = React.useState<Step>('plans');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('card');
  const [country, setCountry] = React.useState('Egypt');
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
  const [bankSearch, setBankSearch] = React.useState('');

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);
  const totalPrice = selectedPlanData?.yearlyTotal || selectedPlanData?.price || '$7.99';

  const handleStartTrial = () => {
    setStep('payment');
  };

  const handleBack = () => {
    setStep('plans');
  };

  const filteredBanks = BANKS.filter(bank => 
    bank.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <Dialog  open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}   className="max-w-[1300px] p-0 border-2 border-primary overflow-hidden shadow-2xl"
 style={{maxWidth: '850px'}}>
        <VisuallyHidden>
          <DialogTitle>Upgrade to Premium</DialogTitle>
        </VisuallyHidden>
        
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-10 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon icon="solar:close-circle-linear" className="size-6" />
          </button>

          {/* Header */}
          <div className="text-center pt-8 pb-6 px-8">
            <h1 className="text-3xl font-bold text-white">
              Level up. Go Premium.
            </h1>
            <p className="text-gray-400 mt-2">
              Save one hour every day. Guaranteed.
            </p>
          </div>

          {/* Main Content - Two Columns */}
          <div className="flex px-8 pb-6 gap-6">
            {/* Left Column - Features */}
            <div className="flex-1">
              {/* Features Card */}
             <div className="relative rounded-2xl border border-gray-700/50 p-6 pt-10">
  
  {/* Floating Header */}
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 
                  bg-background text-xs uppercase tracking-wider 
                  text-gray-400">
    Includes
  </div>

  {/* Content */}
  <div className="grid grid-cols-3 gap-6">
    {FEATURES.map((feature, index) => (
      <motion.div
        key={feature.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex flex-col items-center text-center"
      >
        <div className="size-12 rounded-full bg-primary flex items-center justify-center text-white mb-3">
          {feature.icon}
        </div>
        <p className="text-sm text-white font-medium leading-tight">
          {feature.title}
        </p>
        <p className="text-xs text-gray-400">{feature.subtitle}</p>
      </motion.div>
    ))}
  </div>
</div>


             {/* Review Section */}
<div className="mt-6 flex flex-col items-center text-center max-w-xs mx-auto">
  
  {/* Stars */}
  <div className="flex gap-0.5 mb-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <Icon
        key={star}
        icon="solar:star-bold"
        className="size-3 text-yellow-500"
      />
    ))}
  </div>

  {/* Quote */}
  <p className="text-xs text-gray-400 italic leading-relaxed mb-3">
    “Any.do's reminders jog my memory. It helped endlessly with keeping me on top
    of my tasks and has made me far more productive.”
  </p>

  {/* Author */}
  <div className="flex items-center gap-2">
    <div className="size-8 rounded-full bg-gradient-to-br 
                    from-amber-500 to-orange-600 
                    flex items-center justify-center 
                    text-white text-xs font-semibold">
      CD
    </div>
    <span className="text-[11px] text-gray-400">
      Claire Dolan · Fairfax County, VA
    </span>
  </div>
</div>

            </div>

            {/* Right Column - Plan Selection or Payment */}
            <div className="w-[340px]">
              <AnimatePresence mode="wait">
                {step === 'plans' ? (
                  <motion.div
                    key="plans"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    {PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={cn(
                          "w-full relative flex items-center p-4 rounded-xl border-2 transition-all text-left",
                          selectedPlan === plan.id
                            ? "border-[#0083FF] bg-[#0083FF]/10"
                            : "border-gray-700/50 hover:border-gray-600"
                        )}
                      >
                        {plan.badge && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#0083FF] text-white text-[10px] font-semibold rounded-full whitespace-nowrap">
                            {plan.badge}
                          </span>
                        )}
                        
                        {/* Radio */}
                        <div className={cn(
                          "size-5 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0",
                          selectedPlan === plan.id
                            ? "border-[#0083FF]"
                            : "border-gray-600"
                        )}>
                          {selectedPlan === plan.id && (
                            <div className="size-2.5 rounded-full bg-[#0083FF]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <p className="text-white font-medium">{plan.name}</p>
                          <p className="text-gray-400 text-sm">{plan.price}{plan.period}</p>
                        </div>
                      </button>
                    ))}

                    {/* CTA Button */}
                    <Button
                      onClick={handleStartTrial}
                      className="w-full h-12 mt-4 rounded-xl text-base font-semibold bg-[#0083FF] hover:bg-[#0083FF]/90 text-white"
                    >
                      Start 7-day Free Trial
                    </Button>

                    <button
                      onClick={() => onOpenChange(false)}
                      className="w-full py-3 text-gray-400 hover:text-white font-medium transition-colors uppercase tracking-wider text-sm"
                    >
                      NO, THANKS
                    </button>
                    {/* Footer */}
          <div className="border-t border-gray-700/50 py-4 text-center">
            <button className="text-gray-400 hover:text-white transition-colors">
              Looking for team plans?
            </button>
          </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Back Button & Payment Method Tabs */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleBack}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="size-5" />
                      </button>
                      
                      <div className="flex-1 flex gap-2">
                        <button
                          onClick={() => setPaymentMethod('card')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all",
                            paymentMethod === 'card'
                              ? "bg-[#0083FF] text-white"
                              : "bg-[#252538] text-gray-400 hover:text-white"
                          )}
                        >
                          <CreditCard className="size-4" />
                          <span className="font-medium">Card</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('bank')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all relative",
                            paymentMethod === 'bank'
                              ? "bg-[#0083FF] text-white"
                              : "bg-[#252538] text-gray-400 hover:text-white"
                          )}
                        >
                          <Building2 className="size-4" />
                          <span className="font-medium">Bank</span>
                          {paymentMethod !== 'bank' && (
                            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-semibold rounded">
                              $5 back
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {paymentMethod === 'card' ? (
                        <motion.div
                          key="card-form"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          {/* Card Number */}
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="1234 1234 1234 1234"
                              className="h-12 bg-[#252538] border-gray-700/50 text-white placeholder:text-gray-500 rounded-lg pr-16"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                              <Icon icon="logos:mastercard" className="size-6" />
                              <Icon icon="logos:visa" className="size-6" />
                            </div>
                          </div>

                          {/* Expiry & CVC */}
                          <div className="flex gap-3">
                            <Input
                              type="text"
                              placeholder="MM / YY"
                              className="h-12 bg-[#252538] border-gray-700/50 text-white placeholder:text-gray-500 rounded-lg"
                            />
                            <div className="relative flex-1">
                              <Input
                                type="text"
                                placeholder="CVC"
                                className="h-12 bg-[#252538] border-gray-700/50 text-white placeholder:text-gray-500 rounded-lg pr-12"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-gray-600 px-1 rounded">
                                123
                              </span>
                            </div>
                          </div>

                          {/* Country Selector */}
                          <div className="relative">
                            <button
                              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                              className="w-full h-12 px-4 bg-[#252538] border border-gray-700/50 text-white rounded-lg flex items-center justify-between"
                            >
                              <span>{country}</span>
                              <ChevronDown className={cn(
                                "size-5 text-gray-400 transition-transform",
                                showCountryDropdown && "rotate-180"
                              )} />
                            </button>
                            
                            {showCountryDropdown && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-[#252538] border border-gray-700/50 rounded-lg overflow-hidden z-10">
                                {COUNTRIES.map((c) => (
                                  <button
                                    key={c}
                                    onClick={() => {
                                      setCountry(c);
                                      setShowCountryDropdown(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors"
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="bank-form"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          {/* $5 Back Banner */}
                          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <Icon icon="solar:tag-bold" className="size-5 text-green-500" />
                            <div>
                              <p className="text-sm text-white">Get $5 when you pay for the first time with your bank.</p>
                              <button className="text-[#0083FF] text-sm hover:underline">See terms</button>
                            </div>
                          </div>

                          {/* Bank Search */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                            <Input
                              type="text"
                              placeholder="Search for your bank"
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                              className="h-12 pl-10 bg-[#252538] border-gray-700/50 text-white placeholder:text-gray-500 rounded-lg"
                            />
                          </div>

                          {/* Bank Grid */}
                          <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                            {filteredBanks.map((bank) => (
                              <button
                                key={bank.id}
                                className="flex flex-col items-center gap-2 p-3 bg-[#252538] hover:bg-[#303050] border border-gray-700/50 rounded-lg transition-colors"
                              >
                                <div 
                                  className="size-10 rounded-lg flex items-center justify-center text-white font-bold"
                                  style={{ backgroundColor: bank.color }}
                                >
                                  {bank.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-xs text-gray-400 truncate w-full text-center">{bank.name}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Total & Continue */}
                    <div className="pt-2">
                      <p className="text-white font-semibold mb-3">
                        Total now: <span className="text-[#0083FF]">{totalPrice}</span>
                      </p>
                      <Button
                        className="w-full h-12 rounded-xl text-base font-semibold bg-[#0083FF]/30 hover:bg-[#0083FF]/50 text-[#0083FF]"
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          

          {/* Terms */}
          <div className="bg-primary py-4 px-8 text-center text-xs text-white">
            By subscribing to Any.do Premium, you agree to our auto-renewal subscription plan,{' '}
            <a href="#" className="text-white underline hover:text-white">terms of service</a>
            {' '}and{' '}
            <a href="#" className="text-white underline hover:text-white">privacy policy</a>.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PremiumDialog;
