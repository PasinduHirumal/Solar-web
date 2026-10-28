export const currencyType = import.meta.env.VITE_APP_CURRENCY_TYPE || "USD";

export const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return `${currencyType} 0.00`;
    return `${currencyType} ${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};
