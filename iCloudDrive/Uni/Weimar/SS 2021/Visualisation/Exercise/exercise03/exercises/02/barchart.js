import * as d3 from "d3";

export function barchart({
  svg,
  data,
  width = 1000,
  margin = { top: 30, right: 0, bottom: 10, left: 30 },
  barHeight = 20,
} = {}) {
  const height =
    Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;

  svg.attr("viewBox", [0, 0, width, height]);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .rangeRound([margin.top, height - margin.bottom])
    .paddingOuter(0)
    .paddingInner(0.05);

  svg
    .append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data.sort((a, b) => d3.descending(a.value, b.value)))
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d, i) => y(i))
    .attr("width", (d) => x(d.value) - x(0))
    .attr("height", y.bandwidth())
    .append("title")
    .text((d) => `${d.name}: ${d.value}`);

  svg
    .append("g")
    .attr("fill", "white")
    .attr("text-anchor", "end")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("x", (d) => x(d.value))
    .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("dx", -4)
    .text((d) => d.value.toLocaleString())
    .call((text) =>
      text
        .filter((d) => d.value.toLocaleString().length * 10 > x(d.value) - x(0)) // short bars
        .attr("dx", +4)
        .attr("fill", "black")
        .attr("text-anchor", "start")
    );

  svg
    .append("g")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(width / 80, data.format))
    .call((g) => g.select(".domain").remove());

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickFormat((i) => data[i].name)
        .tickSizeOuter(0)
    );
}
