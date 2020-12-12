const getRgb = (h: number) => {
  const i = Math.floor(h * 6);

  switch (i % 6) {
    case 0:
      return {r: 1, g: h * 6 - i, b: 0};
    case 1:
      return {r: 1 - h * 6 + i, g: 1, b: 0};
    case 2:
      return {r: 0, g: 1, b: h * 6 - i};
    case 3:
      return {r: 0, g: 1 - h * 6 + i, b: 1};
    case 4:
      return {r: h * 6 - i, g: 0, b: 1};
    case 5:
    default:
      return {r: 1, g: 0, b: 1 - h * 6 + i};
  }
};

export const rainbowColor = (p: number, n: number) => {
  const {r, g, b} = getRgb((p / n) * 0.85);

  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
};