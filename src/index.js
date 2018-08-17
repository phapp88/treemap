import * as d3 from 'd3';
import data from './gameData.json';
import './index.css';

const colors = [...d3.schemeSet1, ...d3.schemeSet2, ...d3.schemeSet3];

const svg = d3.select('#treemap-svg');
const width = +svg.attr('width');
const height = +svg.attr('height');

const fader = color => d3.interpolateRgb(color, '#fff')(0.2);
const color = d3.scaleOrdinal(colors.map(fader));

const legend = d3.select('#legend-svg').append('g')
  .attr('id', 'legend')
  .attr('transform', 'translate(391, 25)');

const tooltip = d3.select('body')
  .append('div').attr('id', 'tooltip').style('opacity', 0);

const treemap = d3.treemap()
  .size([width, height])
  .paddingInner(1);

const root = d3.hierarchy(data)
  .sum(d => d.value)
  .sort((a, b) => b.height - a.height || b.value - a.value);

treemap(root);

const cell = svg.selectAll('g')
  .data(root.leaves())
  .enter()
  .append('g')
  .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

cell.append('rect')
  .attr('class', 'tile')
  .attr('id', (d) => {
    d.data.id = d.data.name.split(' ').join('-');
    return d.data.id;
  })
  .attr('width', d => d.x1 - d.x0)
  .attr('height', d => d.y1 - d.y0)
  .attr('fill', d => color(d.parent.data.name))
  .attr('data-name', d => d.data.name)
  .attr('data-category', d => d.data.category)
  .attr('data-value', d => d.data.value)
  .on('mouseover', (d) => {
    tooltip.transition().style('opacity', 0.9);
    tooltip
      .html(
        `Name: ${d.data.name}<br />
        Category: ${d.data.category}<br />
        Value: ${d.data.value}`,
      )
      .attr('data-value', d.data.value)
      .style('left', `${d3.event.pageX + 12.5}px`)
      .style('top', `${d3.event.pageY - 20}px`);
  })
  .on('mouseout', () => {
    tooltip.transition().style('opacity', 0);
  });

cell.append('clipPath')
  .attr('id', d => `clip-${d.data.id}`)
  .append('use')
  .attr('href', d => `#${d.data.id}`);

cell.append('text')
  .attr('clip-path', d => `url(#clip-${d.data.id})`)
  .selectAll('tspan')
  .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
  .enter()
  .append('tspan')
  .attr('x', 4)
  .attr('y', (d, i) => 13 + i * 10)
  .text(d => d);

legend.selectAll('rect')
  .data(root.children)
  .enter()
  .append('rect')
  .attr('class', 'legend-item')
  .attr('height', 18)
  .attr('width', 18)
  .attr('x', (d, i) => (i % 3) * 75)
  .attr('y', (d, i) => Math.floor(i / 3) * 27)
  .attr('fill', d => color(d.data.name));

legend.selectAll('text')
  .data(root.children)
  .enter()
  .append('text')
  .attr('x', (d, i) => (i % 3) * 75 + 27)
  .attr('y', (d, i) => Math.floor(i / 3) * 27 + 16)
  .text(d => d.data.name);
