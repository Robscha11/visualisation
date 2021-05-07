import * as d3 from "d3";

import { scatterplot } from "./scatterplot.js";
import { boxPlots, boxPlot } from "./boxPlot.js";

d3.csv("../data/datasaurus_dozen.csv", d3.autoType).then((data) => {
  // add the datasets to the select
  d3.select("#item")
    .selectAll("option")
    .data(new Set(data.map((d) => d.dataset)))
    .join("option")
    .text((d) => d);
  boxPlot(d3.select("#singlebox"), data, d3.select("#item"), "x");

  // add attributes to the select
  d3.select("#attribute")
    .selectAll("option")
    .data(Object.keys(data[0]).slice(1))
    .join("option")
    .text((d) => d);
  boxPlots(d3.select("#barchart"), data, "dataset", d3.select("#attribute"));

  // add the datasets to the select
  d3.select("#dataset")
    .selectAll("option")
    .data(new Set(data.map((d) => d.dataset)))
    .join("option")
    .text((d) => d);
  const timedata = data.map((d) => ({
    dataset: d.dataset,
    time: new Date(2020 + Math.floor(d.x / 12), (d.x % 12) + 1, 1),
    y: d.y,
  }));
  scatterplot(
    d3.select("#scatterplot"),
    timedata,
    "time",
    "y",
    d3.select("#dataset")
  );
});
