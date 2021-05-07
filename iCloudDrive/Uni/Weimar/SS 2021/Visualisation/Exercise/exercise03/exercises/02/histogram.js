import * as d3 from "d3";
import { loadMoviesDataset } from "../movies";

export function histogram({
  svg,
  data,
  yLabel = "count",
  width = 1000,
  height = 500,
  margin = { top: 40, right: 50, bottom: 40, left: 50 },
} = {}) {
  svg.attr("viewBox", [0, 0, width, height]);

  const attributeSelect = d3.select("select#binAttribute");

  // TODO: Task 3
  // replace this list of dummy attributes with all ordered attributes from the
  // movies dataset
  //console.log(data.columns);
  //console.log(d3.set(data.map((d) => d.genres)).values());
  const binAttributes = [
    "budget",
    "revenue",
    "imdbRating",
    "imdbVotes",
    "releaseDate",
    "runtime",
  ];

  // setup the combobox with all attributes
  attributeSelect
    .selectAll("option")
    .data(binAttributes)
    .join("option")
    .text((attribute) => attribute);

  // update the histogram every time the chosen attribute is changed
  attributeSelect.on("change", () => update());

  // create a group node for the bars
  const bars = svg.append("g").attr("fill", "steelblue");

  // create a group node for the x-axis
  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0 ${height - margin.bottom})`);

  // create a text element for the x-axis label
  const xAxisLabel = xAxis
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", -4)
    .attr("fill", "currentColor")
    .attr("font-weight", "bold")
    .attr("text-anchor", "center")
    .attr("dy", "3.5em");

  // create a group node for the y-axis
  const yAxis = svg
    .append("g")
    .attr("transform", `translate(${margin.left} 0)`);

  // add a text element with the y-label
  yAxis
    .append("text")
    .attr("x", 4)
    .attr("y", margin.top)
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .attr("fill", "black")
    .text(yLabel);

  // update the histogram to draw it initially
  update();

  function update() {
    // read the select attribute
    const binAttribute = attributeSelect.property("value");

    // TODO: Task 3
    // create the actual bins of the respective attribute and replace the dummy
    // data below
    //console.log(d3.map(data, d => d[binAttribute]));
    const bins = d3
      .bin()
      .value((d) => d[binAttribute])
      .thresholds(15)(data);
    //thresholds(10)(data)
    /*d3.bin()
          .value(d => d.date)
          .thresholds(thresholdTime(20))
          (data) for time*/
    //Object.assign(data.slice(0, 3), { x0: 0, x1: 5 }),
    //Object.assign(data.slice(100, 107), { x0: 5, x1: 10 }),
    //Object.assign(data.slice(10, 18), { x0: 10, x1: 15 }),
    //Object.assign(data.slice(-4), { x0: 15, x1: 20 }),

    // TODO: Task 3
    // setup a format function for the tick labels on the x-axis
    // the formatting should fit the selected attribute type
    // replace the identity function below

    const tickFormat =
      binAttribute === "runtime"
        ? (d) => d3.timeFormat("%H:%M")(Math.floor(d * 60000 - 3600000))
        : binAttribute === "imdbRating"
        ? (d) => d3.format(".1f")(d)
        : binAttribute === "releaseDate"
        ? (d) => d3.timeFormat("%m-%Y")(d)
        : (d) => d3.format(".2s")(d);

    // setup the scales
    const xScale =
      binAttribute === "releaseDate" ? d3.scaleTime() : d3.scaleLinear();
    const x = xScale
      .domain([bins[0].x0, bins[bins.length - 1].x1])
      .range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // draw the bars
    bars
      .selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", (d) => x(d.x0) + 1)
      .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("y", (d) => y(d.length))
      .attr("height", (d) => y(0) - y(d.length));

    // draw the x-axis and the label
    xAxis.call(
      d3
        .axisBottom(x)
        .tickFormat(tickFormat)
        .ticks(width / 80)
        .tickSizeOuter(0)
    );
    xAxisLabel.text(binAttribute);

    // draw the y-axis
    yAxis.call(d3.axisLeft(y).ticks(height / 60));
  }
}
