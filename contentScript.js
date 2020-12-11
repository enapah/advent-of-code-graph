const run = async () => {
  const [, year, leaderboard] = window.location.href.match(/\/(\d+)\/leaderboard\/private\/view\/(\d+)/);
  const me = document.querySelector('.user').firstChild.textContent.trim();
  const data = await getChartData(leaderboard, year, me);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  document.querySelector('body').appendChild(canvas);

  const chart = new Chart(ctx, {
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
          label: (tooltipItem) => {
            const member = data[tooltipItem.datasetIndex];
            const day = tooltipItem.index;

            return `${member.name}: ${member.days[day].readableTime} ${tooltipItem.yLabel}`;
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20
        }
      },
      onClick: (e, arr) => {
        const elements = chart.getElementAtEvent(e);

        if (elements.length > 0) {
          let data = selectDataSet(year, elements[0]._datasetIndex);
          chart.data.datasets = data.map((member, i) => ({
            label: member.name,
            borderColor: rainbowColor(i, data.length),
            borderWidth: 1,
            fill: false,
            data: member.data,
            hidden: arr.find((x) => x._datasetIndex === i)?.hidden ?? true
          }));
          console.log(chart.data);
          chart.update();
        }
      }
    }
  });
};

run();
