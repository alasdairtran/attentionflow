import * as d3 from 'd3';
import axios from 'axios';

export function getSongInfo(d, tooltip) {
  const options = {
    params: {
      title: d.id,
    },
  };
  axios
    .get('/vevo/song_info/', options)
    .then(res => {
      if (res.data.error) {
        console.log('error');
      } else {
        const { artistName } = res.data;
        const { totalViews } = res.data;
        const { genre } = res.data;
        const publishedAt = new Date(res.data.publishedAt);
        const { avgWatch } = res.data;
        const { channelId } = res.data;
        const { duration } = res.data;
        const { dailyViews } = res.data;

        console.log(artistName);
        console.log(totalViews);
        console.log(genre);
        console.log(publishedAt);
        console.log(avgWatch);
        console.log(channelId);
        console.log(duration);
        console.log(dailyViews);

        drawPopout(
          d.id,
          artistName,
          totalViews,
          genre,
          publishedAt,
          avgWatch,
          channelId,
          duration,
          dailyViews,
          tooltip
        );
      }
    })
    .catch(function(error) {
      console.error(error);
    });
}

function drawPopout(
  title,
  artistName,
  totalViews,
  genre,
  publishedAt,
  avgWatch,
  channelId,
  duration,
  dailyViews,
  tooltip
) {
  const avgWatchWidth =
    (timeInSeconds(avgWatch) / timeInSeconds(duration)) * 430;

  tooltip.html(
    `${'<div style="background-color:dimgrey;height:100px;width:200px;margin-right:10px;display:inline-block;float:left;position:relative;">' +
      '<div style="background-color:black;position:absolute;bottom:5px;right:5px;height:15px;color:white;font-size:10px;padding-right:2px;padding-left:2px">'}${formatTime(
      duration
    )}</div>` +
      `</div>` +
      `<div id="songInfo"style="height:100px;width:220px;display:inline-block;">` +
      `<h6>${title}</h6>` +
      `<p style="color:#656565;">${artistName}</br>${d3.format('.3s')(
        totalViews
      )} views &#183 ${publishedAt.toLocaleDateString(publishedAt, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}</p>` +
      `</div>` +
      `<br/>${formatGenres(genre)}<br/>` +
      `<div style="height:30px;width:430px;background-color:grey;position:relative;z-index:150;vertical-align:middle">` +
      `<div style="background-color:limegreen;position:absolute;bottom:0px;left:0px;z-index:151;height:30px;width:${avgWatchWidth}px;">` +
      `</div>` +
      `<p style="z-index:152;position:absolute;margin-top:4px;margin-left:5px">Average Watch Time: ${timeInSeconds(
        avgWatch
      )}:${timeInSeconds(avgWatch) < 10 ? '0' : ''}${timeInSeconds(
        avgWatch
      )}/${formatTime(duration)}</p>` +
      `</div>` +
      `<br/>` +
      `Daily Views` +
      `<br/>` +
      `<div id='dailyViewsGraph'></div>`
  );

  const graphWidth = 430;
  const graphHeight = 100;
  const viewsArray = JSON.parse(dailyViews);

  const dailyViewsGraph = d3
    .select('#dailyViewsGraph')
    .append('svg')
    .attr('width', graphWidth)
    .attr('height', graphHeight);

  const x = d3
    .scaleLinear()
    .domain([0, viewsArray.length])
    .range([40, graphWidth - 1]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(viewsArray)])
    .range([graphHeight - 10, 10]);

  const xAxis = d3
    .axisBottom()
    .scale(x)
    .tickValues([]);
  const yAxis = d3
    .axisLeft()
    .scale(y)
    .ticks(7)
    .tickFormat(d3.format('.3s'));
  dailyViewsGraph
    .append('g')
    .attr('transform', 'translate(0,90)')
    .call(xAxis);
  dailyViewsGraph
    .append('g')
    .attr('transform', 'translate(40,0)')
    .call(yAxis);

  dailyViewsGraph
    .append('path')
    .datum(viewsArray)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr(
      'd',
      d3
        .line()
        .x((d, i) => x(i))
        .y(d => y(d))
    );
}

function formatTime(timeString) {
  if (timeString === null) {
    return null;
  }
  let finalArr = [];
  const len = timeString.length;
  for (let i = 1; i <= len; i++) {
    if (timeString.charAt(len - i) === 'M') {
      if (finalArr.length === 0) {
        finalArr = [':', '0', '0'];
      } else if (finalArr.length === 1) {
        finalArr.unshift(':', '0');
      } else {
        finalArr.unshift(':');
      }
    } else if (timeString.charAt(len - i) === 'H') {
      if (finalArr.length === 3) {
        finalArr.unshift(':', '0', '0');
      } else if (finalArr.length === 4) {
        finalArr.unshift(':', '0');
      } else {
        finalArr.unshift(':');
      }
    } else if (timeString.charAt(len - i) === 'T') {
      return finalArr.join('');
    } else if (timeString.charAt(len - i) !== 'S') {
      finalArr.unshift(timeString.charAt(len - i));
    }
  }
}

function formatGenres(genreString) {
  if (genreString === null) {
    return null;
  }
  let arr = genreString.slice(2, -2).split("', '");
  arr = arr.filter(genre => genre !== 'Music');
  if (arr.length === 0) {
    return 'Genre: Other';
  }
  let output = arr.length > 1 ? 'Genres: ' : 'Genre: ';
  arr.forEach(genre => (output += `${genre.split('_').join(' ')}, `));
  return output.slice(0, -2);
}

function timeInSeconds(time) {
  if (time === null) {
    return null;
  }
  let total = 0;
  let multiplier = 1;
  console.log(time);
  const len = time.length;
  for (let i = 1; i <= len; i++) {
    if (time.charAt(len - i) === 'M') {
      multiplier = 60;
    } else if (time.charAt(len - i) === 'H') {
      multiplier = 3600;
    } else if (time.charAt(len - i) === 'T') {
      return total;
    } else if (time.charAt(len - i) !== 'S' && time.charAt(len - i) !== ' ') {
      total += parseInt(time.charAt(len - i)) * multiplier;
      multiplier *= 10;
    }
  }
}
