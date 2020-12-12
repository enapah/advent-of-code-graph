import {getStartOfDay, range} from './utils';

const parseStats = (
  stats: {
    members: {
      name: string;
      local_score: number;
      completion_day_level: {[day: string]: {[part: string]: {get_star_ts: number}}};
    }[];
  },
  year: number
) =>
  Object.values(stats.members).map((member) => ({
    name: member.name,
    score: member.local_score,
    days: range(1, 25).flatMap((day) => {
      const start = getStartOfDay(year, day) / 1000;

      return [1, 2].map((part) => {
        const star = member.completion_day_level[day]?.[part]?.get_star_ts ?? 0;

        return {time: star ? star - start : Infinity};
      });
    })
  }));

export const loadAndParse = async (leaderboard: string) => {
  const json = await fetch(`${leaderboard}.json`).then((res) => res.json());

  return {
    year: json.event,
    stats: parseStats(json, json.event)
  };
};
