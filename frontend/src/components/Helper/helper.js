import * as d3 from 'd3';

export function strokeScaleFunc(strokeList) {
  const minStroke = 1;
  const maxStroke = 16;
  const minWeight = d3.min(strokeList);
  const maxWeight = d3.max(strokeList);
  return d3
    .scaleLinear()
    .domain([minWeight, maxWeight])
    .range([minStroke, maxStroke]);
}

export function radiusScaleFunc(radiusList) {
  const minRadius = 1;
  const maxRadius = 16;
  const minWeight = d3.min(radiusList);
  const maxWeight = d3.max(radiusList);
  return d3
    .scaleLinear()
    .domain([minWeight, maxWeight])
    .range([minRadius, maxRadius]);
}

export function colorScaleFunc(colorList) {
  const minWeight = d3.min(colorList);
  const maxWeight = d3.max(colorList);
  return d3
    .scaleSequential(d3.interpolateYlGnBu)
    .domain([minWeight, maxWeight]);
}

export const drag = simulation => {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};

//export default helper({
//    strokeScaler,
//    radiusScaler,
//    colorScaler
//});
