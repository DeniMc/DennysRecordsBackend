
/** Select random element from a given array */
export const pickRandomElement = (array) => {
    const rand = Math.floor(Math.random() * array.length);
    return array[rand];
}