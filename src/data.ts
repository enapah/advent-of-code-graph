import {getStartOfDay, range, timeToReadable} from './utils';
import {loadAndParse} from './api';

const ignoredDays: {[year: number]: number[]} = {
  2015: [],
  2016: [],
  2017: [],
  2018: [5],
  2019: [],
  2020: [0]
};

export const loadData = async (leaderboard: string) => {
  const {stats, year} = await loadAndParse(leaderboard);
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
          (acc, day, i) => (day.points ? [...acc, day.points + (acc[i - 1] || 0)] : [...acc, null]),
          [] as (number | null)[]
        )
      };
    })
    .sort((a, b) => b.score - a.score);

  const getChartData = (me: string | number) => {
    const baseline = (decorated.find((member, i) => member.name === me || i === me) || decorated[0]).accPerDay;

    return decorated.map(({accPerDay, days, name}) => ({
      name,
      days,
      data: accPerDay.map((dayScore, dayIndex) => {
        if (ignoredDays[year].includes(Math.floor(dayIndex / 2))) {
          return 0;
        }
        return dayScore && Date.now() > getStartOfDay(year, Math.floor((dayIndex + 2) / 2))
          ? dayScore - (baseline[dayIndex] ?? 0)
          : null;
      })
    }));
  };

  const getTimes = () => decorated.map((d) => d.days.map((dd) => dd.readableTime));

  return {
    getChartData,
    getTimes
  };
};
