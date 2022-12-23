export const getRandomIntNumberInBetween = (min = 1, max = 5) => {
  // min: 5, max: 10
  return Math.floor(Math.random() * (max - min + 1) + min); // 10.999999999999 => 10
};

export default getRandomIntNumberInBetween;
