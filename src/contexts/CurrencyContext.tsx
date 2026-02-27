import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "KES" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (value: number) => string;
  convertToDisplay: (valueInKES: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

// Exchange rate: 1 USD = approximately 130 KES
const KES_TO_USD_RATE = 0.0077;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem("smartrent-currency");
    return (saved as Currency) || "KES";
  });

  useEffect(() => {
    localStorage.setItem("smartrent-currency", currency);
  }, [currency]);

  const convertToDisplay = (valueInKES: number): number => {
    if (currency === "USD") {
      return valueInKES * KES_TO_USD_RATE;
    }
    return valueInKES;
  };

  const formatCurrency = (value: number): string => {
    const displayValue = convertToDisplay(value);

    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(displayValue);
    }

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(displayValue);
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatCurrency, convertToDisplay }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
