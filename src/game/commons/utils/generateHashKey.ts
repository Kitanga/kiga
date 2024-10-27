export const generateHashKey = (a: number, b: number, bits = 4) => {
    return (a << bits) | b;
}