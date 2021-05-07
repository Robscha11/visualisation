import * as d3 from "d3";
import { axisLeft } from "d3";

export function scatterplot(node, data, timeAttribute, attributeY, dataset) {
  let width = 1000;
  let height = 600;
  let margin = { top: 25, right: 50, bottom: 35, left: 80 };

  const svg = node.attr("viewBox", [0, 0, width, height]);

  // TODO: Task 3: create a scale for the x axis
  let x = d3
    .scaleTime()
    .domain([
      d3.min(d3.map(data, (d) => d.time)),
      d3.max(d3.map(data, (d) => d.time)),
    ]) // written on the Axis: from 0 to 100
    .range([0, width])
    .nice();

  // TODO: Task 3: create a scale for the y axis
  let y = d3
    .scaleLinear()
    .domain([100, 0]) // written on the Axis: from 0 to 100
    .range([0, height]); //where the axis is placed: from 0px to height

  // TODO: Task 3: create an axis for the x scale
  const axisX = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(d3.axisTop(x));
  axisX.call((g) =>
    g
      .append("text")
      .attr("x", width)
      .attr("y", margin.bottom - 4)
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .text(timeAttribute)
  );

  // TODO: Task 3: create an axis for the y scale
  const axisY = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(d3.axisLeft(y));

  const renderG = svg.append("g");

  render();
  if (dataset instanceof d3.selection) dataset.on("change", () => render());

  function render() {
    let currentDataset = dataset;
    // get the current selection form the select (if applicable)
    if (dataset instanceof d3.selection) {
      currentDataset = dataset.property("value");
    }

    // Task 3: update the scale and axis
    axisY.call((g) =>
      g
        .selectAll("text.label")
        .data([attributeY])
        .join("text")
        .classed("label", true)
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(attributeY)
    );

    // Task 3: render circle elements for each data item
    // using the join pattern and animate the transitions
    const selectedDatasetOnly = data.filter((d) => d.dataset == currentDataset);
    // Task 3: render circle elements for each data item
    // using the join pattern and animate the transitions
    //
    // The d variable inside .attr() or .style() is of the following form:
    // d = {time: XX, y: XX, dataset: XX}
    //
    renderG
      .selectAll("circle")
      .data(selectedDatasetOnly)
      .join("circle")
      .attr("class", "boxplot")
      .transition()
      .style("fill", "green")
      .duration(2000)
      .attr("cx", (d) => x(d.time))
      .attr("cy", (d) => y(d.y))
      .attr("r", 7);
    // Remember, transitions are introduced by the following
    // lines before defining the attributes to be animated:
    // .transition()
    // .duration(dataset.on("change", () => render()))
  }
}
