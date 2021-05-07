import * as d3 from "d3";

/* Function to perform the Slice & Dice algorithm
 - hierarchy: hierarchy of subsets of the form 
  {
    children: [array of children, they have the same form]
    data: {name: attribute value (undefined for the root), nrItems: size of subset}
    depth: length of path to the root node
    height: length of path to deepest leaf node
    parent: parent node, it has the same form, null for root
   }
 RETURN: array of rectangles representing the sliced and diced subsets, form:
 [{x: XXX, y: XXX, width: XXX, height: XXX, path: [attributeValue1, attributeValue2...], nrItems: XXX},
  ...]
 */
export function sliceAndDice({hierarchy}) {
  let rectangle = {x: 0, y: 0, width: 1, height: 1, path: [], nrItems: 0};
  hierarchy.rectangle = rectangle;

  // TODO: Task 2: Implement the slice and dice algorithm to 
  // split the given rectangle according to the hierarchical 
  // subsets given in the variable hierarchy

  
  return [rectangle];
}


export function mosaicplot({svg, rectangles}) {
  // Standard setup of the visualization
  let width = 1000;
  let height = 800;
  let margin = { top: 30, right: 0, bottom: 0, left: 30 };

  // Setup the coordinate system of the svg
  svg.attr("viewBox", [0, 0, width, height]);

  // Colormaps to improve readability:
  // colorMap: mapping color to the second attribute value 
  //  - to be used as: .style("fill", (d) => colorMap(d.attributes[1])) in
  //    your rectangle definition
  // opacityMap: mapping opacitity to the third attribute value
  //  - to be used as: .style("opacity", (d) => opacityMap(d.attributes[2])) in
  //    your rectangle definition 
  // Note: the first attribute causes the initial split and is therefore, easily
  // visually distinguishable, therefore the color and opacity are mapped to second
  // and third, since here matching correspoinding cells is much harder.
  const colorMap = d3
    .scaleOrdinal()
    .domain(
      Array.from(d3.group(rectangles, (d) => d.path[1]).keys()).sort()
    )
    .range(d3.schemePastel1);
  const opacityMap = d3
    .scalePoint()
    .domain(
      Array.from(d3.group(rectangles, (d) => d.path[2]).keys()).sort()
    )
    .range([0.3, 1.0]);
  
  // Define scales to place labels and rectangles
  const x = d3.scaleLinear().domain([0,1]).range([0, width - margin.right - margin.left]);
  const y = d3.scaleLinear().domain([0,1]).range([0, height - margin.bottom - margin.top]);
  
  // Insert the labels for the mosaic plot, not perfect (might overlap if rects to small)
  rectangles[0].path.forEach((d, i) => {
    let labelpositions = null;
    let attribute = "x"; // horizontal split
    if(i%2) { // vertical split
      attribute = "y";
    }  
    labelpositions = d3.rollup(rectangles, 
    v => v.sort((a, b) => d3.ascending(a.x, b.x) || d3.ascending(a[attribute], b[attribute]))[0][attribute], 
    k => k.path.slice(0+i%2, i+1)
    .filter((d,i) => i%2 == 0).join("|"));
    
    svg.append("g")
    .selectAll("text")
    .data(labelpositions)
    .join("text")
    .text(d => d[0].split("|").slice(-1)[0])
    .attr("y", d => 13 + ((attribute=="x")?((d[0].match(/\|/g)||[]).length * 15):((((d[0].match(/\|/g)||[]).length + 1) * -15))))
    .attr("x", d => (attribute=="x")?(x(d[1]) + margin.left):(y(d[1]) + margin.top))
    .style("transform", d => `rotate(${(attribute=="x"?0:90)}deg)`);
  });


  const renderG = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  renderG
  .selectAll("rect")
  .data(rectangles)
  .join("rect")
  .attr("x", (d) => x(d.x))
  .attr("y", (d) => y(d.y))
  .attr("width", (d) => x(d.width)-1)
  .attr("height", (d) => y(d.height)-1)
  .style("fill", (d) => colorMap(d.path[1]))
  .style("opacity", (d) => opacityMap(d.path[2]))
  .call((rect) =>
    rect
      .append("title")
      .text((d) => d.path.join("->") + ":" + d.nrItems)
  );
  
}