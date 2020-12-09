const {rainbowColor, getDayNames, getChartData} = (function () {
  const getRgb = (h) => {
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

  const rainbowColor = (p, n) => {
    const {r, g, b} = getRgb((p / n) * 0.85);

    return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
  };

  const range = (start, end) => [...Array(end - start + 1)].map((_, i) => start + i);

  const getStartOfDay = (year, day) =>
    new Date(`${year}-12-${String(day).padStart(2, '0')}T05:00:00.000Z`).getTime() / 1000;

  const parseStats = (stats, year) =>
    Object.values(stats.members).map((member) => ({
      name: member.name,
      score: member.local_score,
      days: range(1, 25).flatMap((day) => {
        const start = getStartOfDay(year, day);

        return [1, 2].map((part) => {
          const star = member.completion_day_level[day]?.[part]?.get_star_ts ?? 0;

          return {time: star ? star - start : Infinity};
        });
      })
    }));

  const getDayNames = () => range(1, 25).flatMap((day) => [1, 2].map((part) => `${day} ${'⭐'.repeat(part)}`));

  const padZero = (seconds) => String(seconds).padStart(2, '0');

  const timeToReadable = (time) => {
    if (!Number.isFinite(time)) {
      return '-';
    }

    const hours = Math.floor(time / 60 / 60);
    const minutes = Math.floor((time - hours * 60 * 60) / 60);
    const seconds = time - hours * 60 * 60 - minutes * 60;

    return hours > 0 ? `${hours}:${padZero(minutes)}:${padZero(seconds)}` : `${minutes}:${padZero(seconds)}`;
  };

  const ignoredDays = {
    2015: [],
    2016: [],
    2017: [],
    2018: [5],
    2019: [],
    2020: [0]
  };

  const getChartData = async (leaderboard, year) => {
    const json = await fetch(`${leaderboard}.json`).then((res) => res.json());

    const stats = parseStats(json, year);

    const timesPerDay = range(0, 49).map((day) => stats.map((member) => member.days[day].time).sort((a, b) => a - b));

    const decorated = stats
      .map((member) => {
        const days = member.days.map(({time}, day) => ({
          time,
          points:
            !ignoredDays[year].includes(Math.floor(day / 2)) && Number.isFinite(time)
              ? stats.length - timesPerDay[day].indexOf(time)
              : 0,
          readableTime: timeToReadable(time)
        }));

        return {
          ...member,
          days,
          accPerDay: days.reduce(
            (acc, day, i) => (day.points ? [...acc, day.points + (acc[i - 1] || 0)] : [...acc, acc[i - 1] || 0]),
            []
          )
        };
      })
      .sort((a, b) => b.score - a.score)
      .filter((m) => m.score > 0);

    const maxEachDay = range(0, 49).map((i) => Math.max(...decorated.map((member) => member.accPerDay[i])));

    return decorated.map((member) => ({
      ...member,
      data: member.accPerDay.map((dayScore, dayIndex) => {
        if (ignoredDays[year].includes(Math.floor(dayIndex / 2))) {
          return 0;
        }
        if (
          dayScore &&
          Date.now() >
            new Date(`${year}-12-${String(Math.floor(dayIndex / 2)).padStart(2, '0')}T05:00:00.000Z`).getTime()
        ) {
          return dayScore - maxEachDay[dayIndex];
        }
        return null;
      })
    }));
  };

  return {rainbowColor, getDayNames, getChartData};
})();
