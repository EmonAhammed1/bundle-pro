import React from 'react';
import { useBundle } from '../../../context/BundleContext';
import { Sparkles, Trophy, ShoppingBag } from 'lucide-react';

export const BuyMoreSaveMoreWidget = () => {
  const { rawSubtotal, cartLevelDiscountPercent, widgetStyle } = useBundle();

  const milestones = [
    { target: 50, discount: 10, label: '10% OFF' },
    { target: 100, discount: 20, label: '20% OFF' },
    { target: 150, discount: 30, label: '30% OFF + Gift' }
  ];

  const currentSpend = rawSubtotal;
  const maxTarget = milestones[milestones.length - 1].target;
  const progressPercent = Math.min(100, (currentSpend / maxTarget) * 100);

  const nextMilestone = milestones.find(m => currentSpend < m.target);
  const remainingSpend = nextMilestone ? nextMilestone.target - currentSpend : 0;

  return (
    <div 
      className="bg-slate-900 border text-slate-100 p-5 shadow-xl transition-all space-y-4"
      style={{ 
        borderRadius: widgetStyle.borderRadius,
        borderColor: widgetStyle.primaryColor + '50'
      }}
    >
      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-white">Buy More, Save More Reward Meter</h3>
          <p className="text-xs text-slate-400">
            {nextMilestone 
              ? `Add $${remainingSpend.toFixed(2)} more to unlock ${nextMilestone.label}!`
              : '🎉 Maximum Tier Unlocked! You earned 30% OFF + Free Gift!'}
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
          <div 
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-3 text-center">
          {milestones.map((m) => {
            const isReached = currentSpend >= m.target;
            return (
              <div key={m.target} className="flex flex-col items-center">
                <span className={`text-[10px] font-bold ${isReached ? 'text-emerald-400' : 'text-slate-500'}`}>
                  ${m.target} Cart
                </span>
                <span className={`text-xs font-black ${isReached ? 'text-white' : 'text-slate-400'}`}>
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Current Cart Subtotal:</span>
        <span className="font-mono font-black text-emerald-400 text-sm">${currentSpend.toFixed(2)}</span>
      </div>

    </div>
  );
};
