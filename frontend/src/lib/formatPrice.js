export const currencyType = import.meta.env.VITE_APP_CURRENCY_TYPE || "USD";

export const formatPrice = (price) => {
    return `${currencyType} ${Number(price).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};