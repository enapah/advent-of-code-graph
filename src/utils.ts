export const range = (start: number, end: number) => [...Array(end - start + 1)].map((_, i) => start + i);

export const getStartOfDay = (year: number, day: number) =>
  new Date(`${year}-12-${String(day).padStart(2, '0')}T05:00:00.000Z`).getTime();

export const getDayNames = () => range(1, 25).flatMap((day) => [1, 2].map((part) => `${day} ${'⭐'.repeat(part)}`));

const padZero = (seconds: number) => String(seconds).padStart(2, '0');

export const timeToReadable = (time: number) => {
  if (!Number.isFinite(time)) {
    return '-';
  }

  const hours = Math.floor(time / 60 / 60);
  const minutes = Math.floor((time - hours * 60 * 60) / 60);
  const seconds = time - hours * 60 * 60 - minutes * 60;

  return hours > 0 ? `${hours}:${padZero(minutes)}:${padZero(seconds)}` : `${minutes}:${padZero(seconds)}`;
};
