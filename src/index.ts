import {loadData} from './data';
import Chart from 'chart.js';
import {rainbowColor} from './colors';
import {getDayNames} from './utils';

const getLeaderboard = () => {
  const match = window.location.href.match(/leaderboard\/private\/view\/(\d+)/);

  return match && match[1];
};

const run = async () => {
  const leaderboard = getLeaderboard();

  if (!leaderboard) {
    return;
  }

  const me = document.querySelector('.user')?.firstChild?.textContent!.trim();

  const api = await loadData(leaderboard);
  const canvas = document.createElement('canvas');

  document.body.appendChild(canvas);

  const data = api.getChartData(me!);
  const times = api.getTimes();

  Array.from(document.querySelectorAll('.privboard-row'))
    .slice(1)
    .forEach((row, i) => {
      const stars = row.querySelectorAll('.privboard-star-both,.privboard-star-firstonly,.privboard-star-unlocked');

      stars.forEach((star, day) => {
        star.setAttribute('title', times[i].slice(day * 2, day * 2 + 2).join('|'));
      });
    });

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: getDayNames(),
      datasets: data.map((member, i) => ({
        label: member.name,
        borderColor: rainbowColor(i, data.length),
        borderWidth: 1,
        fill: false,
        data: member.data,
        hidden: i >= 5 && member.name !== me
      }))
    },
    options: {
      scales: {
        xAxes: [
          {
            ticks: {
              fontColor: 'white',
              fontFamily: 'monospace'
            },
            gridLines: {
              color: '#777'
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              fontColor: 'white',
              fontFamily: 'monospace'
            },
            gridLines: {
              color: '#777'
            }
          }
        ]
      },
      spanGaps: true,
      tooltips: {
        callbacks: {
          label: ({datasetIndex, index: day, yLabel}) => {
            const member = data[datasetIndex!];

            return `${member.name}: ${member.days[day!].readableTime} ${yLabel}`;
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20
        }
      },
      onClick: (e) => {
        const [clickedElement] = chart.getElementAtEvent(e);

        if (clickedElement) {
          const recentered = api.getChartData((clickedElement as any)._datasetIndex!);

          chart.data.datasets = chart.data.datasets!.map((dataset, i) => ({
            ...dataset,
            data: recentered[i].data
          }));
          chart.update();
        }
      }
    }
  });
};

run();
