import React from 'react';

interface PriceDisplayProps {
  salePrice?: number | null;
  rentalDailyRate?: number | null;
  rentalHourlyRate?: number | null;
  isNegotiable?: boolean;
  transactionType?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const formatINR = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN');
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  salePrice,
  rentalDailyRate,
  rentalHourlyRate,
  isNegotiable,
  transactionType = 'SALE',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-3xl font-black',
  };

  const isRentOnly = transactionType === 'RENT';
  const isSaleOnly = transactionType === 'SALE';
  const isBoth = transactionType === 'BOTH';

  return (
    <div className="flex flex-col gap-0.5">
      {/* Sale Price Display */}
      {(isSaleOnly || isBoth) && salePrice && (
        <div className="flex items-baseline gap-2">
          <span className={`text-primary-800 ${sizeClasses[size]}`}>
            {formatINR(salePrice)}
          </span>
          {isNegotiable && (
            <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
              Negotiable
            </span>
          )}
        </div>
      )}

      {/* Rental Price Display */}
      {(isRentOnly || isBoth) && (rentalDailyRate || rentalHourlyRate) && (
        <div className="flex items-center gap-1.5 text-earth-700 font-semibold text-sm">
          <span>Rent:</span>
          {rentalDailyRate ? (
            <span className="text-earth-900 font-bold">
              {formatINR(rentalDailyRate)}<span className="text-xs font-normal text-slate-500">/day</span>
            </span>
          ) : rentalHourlyRate ? (
            <span className="text-earth-900 font-bold">
              {formatINR(rentalHourlyRate)}<span className="text-xs font-normal text-slate-500">/hr</span>
            </span>
          ) : null}
        </div>
      )}

      {/* Fallback if no prices given */}
      {!salePrice && !rentalDailyRate && !rentalHourlyRate && (
        <span className="text-slate-500 text-sm font-medium">Price on Inquiry</span>
      )}
    </div>
  );
};
