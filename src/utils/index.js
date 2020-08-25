export const convertEuroToCents = price => {
    return (price * 100).toFixed(0);
}
export const convertCentsToEuros = price => {
    return (price / 100).toFixed(2);
}

