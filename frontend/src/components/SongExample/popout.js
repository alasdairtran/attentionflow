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
        let artist = res.data.artist;
        let totalViews = res.data.totalViews;
        let genre = res.data.genre;
        let publishDate = new Date(res.data.publishDate);
        let averageWatch = res.data.averageWatch;
        let channelID = res.data.channelID;
        let duration = res.data.duration;
        let dailyViews = res.data.dailyViews;
        drawPopout(
          d.id,
          artist,
          totalViews,
          genre,
          publishDate,
          averageWatch,
          channelID,
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
  artist,
  totalViews,
  genre,
  publishDate,
  averageWatch,
  channelID,
  duration,
  dailyViews,
  tooltip
) {
  let averageWatchWidth = ((averageWatch * 60) / timeInSeconds(duration)) * 430;

  tooltip.html(
    '<div style="background-color:dimgrey;height:100px;width:200px;margin-right:10px;display:inline-block;float:left;position:relative;">' +
      '<div style="background-color:black;position:absolute;bottom:5px;right:5px;height:15px;color:white;font-size:10px;padding-right:2px;padding-left:2px">' +
      formatTime(duration) +
      '</div>' +
      '</div>' +
      '<div id="songInfo"style="height:100px;width:220px;display:inline-block;">' +
      '<h6>' +
      title +
      '</h6>' +
      '<p style="color:#656565;">' +
      artist +
      '</br>' +
      d3.format('.3s')(totalViews) +
      ' views &#183 ' +
      publishDate.toLocaleDateString(publishDate, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) +
      '</p>' +
      '</div>' +
      '<br/>' +
      formatGenres(genre) +
      '<br/>' +
      '<div style="height:30px;width:430px;background-color:grey;position:relative;z-index:150;vertical-align:middle">' +
      '<div style="background-color:limegreen;position:absolute;bottom:0px;left:0px;z-index:151;height:30px;width:' +
      averageWatchWidth +
      'px;">' +
      '</div>' +
      '<p style="z-index:152;position:absolute;margin-top:4px;margin-left:5px">Average Watch Time: ' +
      Math.floor(averageWatch) +
      ':' +
      (Math.round((averageWatch % 1) * 60) < 10 ? '0' : '') +
      Math.round((averageWatch % 1) * 60) +
      '/' +
      formatTime(duration) +
      '</p>' +
      '</div>' +
      '<br/>' +
      'Daily Views' +
      '<br/>' +
      "<div id='dailyViewsGraph'></div>"
  );

  let graphWidth = 430;
  let graphHeight = 100;
  let viewsArray = JSON.parse(dailyViews);

  let dailyViewsGraph = d3
    .select('#dailyViewsGraph')
    .append('svg')
    .attr('width', graphWidth)
    .attr('height', graphHeight);

  let x = d3
    .scaleLinear()
    .domain([0, viewsArray.length])
    .range([40, graphWidth - 1]);
  let y = d3
    .scaleLinear()
    .domain([0, d3.max(viewsArray)])
    .range([graphHeight - 10, 10]);

  let xAxis = d3
    .axisBottom()
    .scale(x)
    .tickValues([]);
  let yAxis = d3
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
  let len = timeString.length;
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
  let output = arr.length > 1 ? 'Genres: ' : 'Genre: ';
  arr.forEach(genre => (output += genre.split('_').join(' ') + ', '));
  return output.slice(0, -2);
}

function timeInSeconds(time) {
  if (time === null) {
    return null;
  }
  let total = 0;
  let multiplier = 1;
  let len = time.length;
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
