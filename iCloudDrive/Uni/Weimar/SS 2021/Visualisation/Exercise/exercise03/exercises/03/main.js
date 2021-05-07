import * as d3 from "d3";
import { loadMoviesDataset } from "../movies";
import { discretize } from "./discretize";
import { parallelsets } from "./parallelsets";
import { mosaicplot, sliceAndDice } from "./mosaicplot";
import { createHierarchy } from "./hierarchy";
import marked from "marked";
import whatwhyhow from "./whatwhyhow.md";
import { parallelcoordinates } from "./parallelcoordinates";

// This line includes the markdown file whatwhyhow.md 
// You will write your answer to Task 4 in it.
d3.select("div#whatwhyhow").html(marked(whatwhyhow));

// Load the movies dataset
loadMoviesDataset().then((movies) => {
  console.log(movies);
  // visualize 4 quantitative attributes using the parallel 
  // coordinates
  parallelcoordinates({svg:d3.select("#parallelcoordinates"), 
  data:movies.slice(0, 1000), 
  attributes:[["releaseDate", d => d.releaseDate],
  ["performance", d => d.revenue - d.budget], 
  ["imdbRating", d => d.imdbRating],
  ["spokenLanguages", d => d.spokenLanguages.length]]});

  // Discretize some variables from the dataset, note
  // that setdata only contains the 4 discretized attributes
  const setdata = discretize(movies);

  // Select and order categorical attributes to visualize in 
  // the parallel sets and mosaic plots
  // You are welcome to play with these but note that both the
  // parallel sets as well as the mosaic plot suffer both from too
  // many attributes and from too high cardinality (so the number
  // of different attribute values)
  let attributeOrder = ["performance", "rating", "internationality", "period"];
  // from the attribute order, a hierarchy is created that 
  // splits the dataset into subsets of same attribute values
  const hierarchy = createHierarchy({data:setdata, attributeOrder: attributeOrder});
  console.log(hierarchy); 
  // the data you get here is of the form
  // {
  //  children: [array of children, they have the same form]
  //  data: {name: attribute value (undefined for the root), nrItems: size of subset}
  //  depth: length of path to the root node
  //  height: length of path to deepest leaf node
  //  parent: parent node, it has the same form, null for root
  // }
  // 
  // plotting the output as parallel sets
  parallelsets({svg: d3.select("#parallelsets"), hierarchy});

  const sampleRectangles = [
    { path: ["one", "one"], height: 0.1, width: 0.1, x:0, y:0, nrItems: 1},
    { path: ["one", "two"], height: 0.4, width: 0.1, x:0, y:0.1, nrItems: 4},
    { path: ["one", "three"], height: 0.5, width: 0.1, x:0, y:0.5, nrItems: 5},
    { path: ["two", "one"], height: 0.33, width: 0.5, x:0.1, y:0, nrItems: 15},
    { path: ["two", "two"], height: 0.33, width: 0.5, x:0.1, y:0.33, nrItems: 15},
    { path: ["two", "three"], height: 0.34, width: 0.5, x:0.1, y:0.66, nrItems: 15},
    { path: ["three", "one"], height: 0.5, width: 0.4, x:0.6, y:0, nrItems: 15},
    { path: ["three", "two"], height: 0.4, width: 0.4, x:0.6, y:0.5, nrItems: 15},
    { path: ["three", "three"], height: 0.1, width: 0.4, x:0.6, y:0.9, nrItems: 15},
  ]
  // apply the slice and dice algorithm
  const rectangles = sliceAndDice({hierarchy});
  // plotting the rectangles as mosaic plot
  mosaicplot({svg: d3.select("#mosaicplot"), rectangles: rectangles.length == 1? sampleRectangles : rectangles});
});
