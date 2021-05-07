import * as d3 from "d3";

export function boxPlot(node, data, dataset, attribute) {
  const width = 1000;
  const height = 70;
  const margin = { top: 0, right: 10, bottom: 40, left: 10 };

  const svg = node.attr("viewBox", [0, 0, width, height]);

  // TODO: Task 1: create a suitable scale to map the x attribute

  let scaleX = d3
    .scaleLinear()
    .domain([0, 100]) // written on the Axis: from 0 to 100
    .range([0, width - 100]); //where the axis is placed: from 0px to width - 100px
  // TODO: Task 1: add a bottom axis to the plot
  const axisX = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.bottom})`)
    .call(d3.axisBottom(scaleX));
  const renderG = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  // we render now, and every time someone changes the select
  render();
  if (dataset instanceof d3.selection) dataset.on("change", () => render());

  function render() {
    let currentDataset = dataset;
    // get the current selection form the select (if applicable)
    if (dataset instanceof d3.selection) {
      currentDataset = dataset.property("value");
    }
    // and filter the data accordingly
    const set = data
      .filter((d) => d.dataset == currentDataset)
      .map((d) => d[attribute]);

    // TODO: Task 1: determine the min, max, mean and deviation
    // of the selected dataset
    var max = d3.max(set);
    var min = d3.min(set);
    var mean = d3.mean(set);
    var deviation = d3.deviation(set);

    const verticalMiddle = (height - margin.bottom - margin.top) / 2;
    // TODO: Task 1: input your data in the render function (only dummy values here)
    renderG.selectAll("*").remove();
    renderBoxPlot(min, max, mean, deviation, renderG, scaleX, verticalMiddle);
  }
}

function renderBoxPlot(
  min,
  max,
  mean,
  deviation,
  renderG,
  scaleX,
  verticalMiddle
) {
  // then draw a line from min to max
  renderG
    .append("line")
    .attr("class", "boxplot")
    .attr("x1", scaleX(min))
    .attr("y1", verticalMiddle)
    .attr("x2", scaleX(max))
    .attr("y2", verticalMiddle);

  // add a slightly thicker line => rect to
  // show standard deviation
  renderG
    .append("rect")
    .attr("class", "boxplot")
    .attr("x", scaleX(mean) - scaleX(deviation))
    .attr("y", verticalMiddle - 2)
    .attr("width", 2 * scaleX(deviation))
    .attr("height", 4);

  // add a circle to show the mean
  renderG
    .append("circle")
    .attr("class", "boxplot")
    .attr("cx", scaleX(mean))
    .attr("cy", verticalMiddle)
    .attr("r", 7);
}

export function boxPlots(node, data, keyattribute, attribute) {
  const width = 1000;
  const height = 500;
  const margin = { top: 0, right: 20, bottom: 40, left: 80 };
  const gap = 5;

  const svg = node.attr("viewBox", [0, 0, width, height]);
  const verticalMiddle =
    (height - margin.bottom - margin.top) /
    (d3.group(data, (d) => d[keyattribute]).size * 2);

  // TODO: Task 2: create a scale for the x axis
  // Tipp: please note, that the scale depends on the
  // selected attribute and changes on user interaction
  let scaleX = d3
    .scaleLinear()
    .domain([0, 100]) // written on the Axis: from 0 to 100
    .range([10, width - 100]); //where the axis is placed: from 0px to width - 100px

  // TODO: Task 2: create a scale for the y axis
  let scaleY = d3
    .scalePoint()
    .domain(d3.map(data, (d) => d.dataset)) // categorical data
    .range([50, 420]); //where the axis is placed: from 0px to width - 100px

  // TODO: Task 2: create an axis for the x scale
  // Tipp: please note, that the axis too depends on the
  // selected attribute and changes on user interaction
  const axisX = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${450})`)
    .call(d3.axisBottom(scaleX));

  // TODO: Task 2: create an axis for the x scale
  const axisY = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(d3.axisLeft(scaleY));

  const renderG = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // we render now, and every time someone changes the select
  render();
  if (attribute instanceof d3.selection) attribute.on("change", () => render());

  function render() {
    // get the current selection form the select
    let currentAttribute = attribute;
    if (attribute instanceof d3.selection)
      currentAttribute = attribute.property("value");

    // TODO: Task 2: update the scaleX and the axisX according
    // to user interaction
    axisX.call((g) =>
      g
        .selectAll("text.label")
        .data([currentAttribute])
        .join("text")
        .classed("label", true)
        .attr("x", width / 2)
        .attr("y", margin.bottom + 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(currentAttribute)
        .attr(
          scaleX.domain([
            d3.min(d3.map(data, (d) => d[currentAttribute])),
            d3.max(d3.map(data, (d) => d[currentAttribute])),
          ])
        )
    );

    // TODO: Task 2: calculate stats for each dataset
    const statistics = d3.rollup(
      data,
      (v) => {
        const values = v.map((d) => d[currentAttribute]); //array of values for the chosen attribute and dataset
        return {
          min: d3.min(values),
          max: d3.max(values),
          mean: d3.mean(values),
          deviation: d3.deviation(values),
        };
      },
      (d) => d[keyattribute]
    );

    // TODO: Task 2: map data items to line, rect and
    // circle element using
    // the join pattern
    // add the line

    // add a slightly thicker line => rect to
    // show standard deviation

    // add a circle to show the mean

    // then draw a line from min to max
    renderG
      .selectAll("line")
      .data(statistics)
      .join("line")
      .attr("class", "boxplot")
      .attr("x1", (d) => scaleX(d[1].min))
      .attr("y1", (d) => scaleY(d[0]))
      .attr("x2", (d) => scaleX(d[1].max))
      .attr("y2", (d) => scaleY(d[0]))
      .style("stroke", "blue");

    renderG
      .selectAll("rect")
      .data(statistics)
      .join("rect")
      .attr("class", "boxplot")
      .attr("x", (d) => scaleX(d[1].mean) - scaleX(d[1].deviation))
      .attr("y", (d) => scaleY(d[0]) - 2)
      .attr("width", (d) => 2 * scaleX(d[1].deviation))
      .attr("height", 4)
      .style("fill", "green");

    renderG
      .selectAll("circle")
      .data(statistics)
      .join("circle")
      .attr("class", "circle")
      .attr("cx", (d) => scaleX(d[1].mean))
      .attr("cy", (d) => scaleY(d[0]))
      .attr("r", 5);
  }
}
