import * as d3 from "d3";
export function smallMultiples({ svg, width, movies, numCols } = {}) {
  // TODO: Task 5
  // setup the data structures for the small multiples visualization
  // replace the dummy data below with the actual data from the movies dataset
  //
  // genres:  an array or set of unique genres
  //
  // moviesPerYear:
  // a map from each unique year to the mean and count of all
  // movies for that year
  //
  // moviesByGenrePerYear:
  // a map from each unique genre with another nested map
  // inside that is similar to moviesPerYear but limited
  // to movies with that respective genre

  let genres = [...new Set(movies.map((v) => v.genres[0]))];

  let moviesPerYear = d3.rollup(
    movies,
    (v) => ({
      count: d3.count(v, (d) => d.imdbRating),
      mean: d3.mean(v, (d) => d.imdbRating),
    }),
    (d) => `${d.releaseDate.getFullYear()}`
  );

  /****Alternative 
  let yearMean = d3.rollup(movies, v => d3.mean(v, d => d.imdbRating), d => d.releaseDate.getFullYear())
                 d3.rollups(movies, v => v.length, d => d.releaseDate.getFullYear())
                   .map(d => moviesPerYear.set(d[0], {count: d[1], mean: yearMean.get(d[0])}));
  *****/

  let moviesByGenrePerYear = new Map();
  let moviesByGenrePerYear1 = new Map();

  genres.forEach((element, index) => {
    moviesByGenrePerYear1 = d3.rollup(
      movies.filter((d) => d.genres.includes(element)),
      (v) => ({
        count: d3.count(v, (d) => d.imdbRating),
        mean: d3.mean(v, (d) => d.imdbRating),
      }),
      (d) => `${d.releaseDate.getFullYear()}`
    );

    moviesByGenrePerYear.set(element, moviesByGenrePerYear1);
  });
  // console.log(moviesByGenrePerYear);

  let moviesByGenrePerYearExample = new Map([
    [
      "Action",
      new Map([
        [1980, { count: 3, mean: 6 }],
        [2020, { count: 7, mean: 5 }],
      ]),
    ],
    [
      "Drama",
      new Map([
        [1930, { count: 2, mean: 8 }],
        [1980, { count: 5, mean: 9 }],
        [2020, { count: 3, mean: 7 }],
      ]),
    ],
    [
      "Western",
      new Map([
        [1980, { count: 1, mean: 8 }],
        [2020, { count: 12, mean: 6 }],
      ]),
    ],
  ]);
  //console.log(moviesByGenrePerYearExample);

  // compute the maximum count of movies across all genres
  const maxMoviesByGenre = d3.max(
    moviesByGenrePerYear,
    ([genre, moviesPerYear]) =>
      d3.max(moviesPerYear, ([year, { mean, count }]) => count)
  );

  // TODO: Task 5
  // setup the color scale to map from movie count to a color; replace the
  // dummy function below with your chosen color scale
  // hint:  maxMoviesByGenre already contains the maximum movie count for each
  //        genre computed from moviesByGenrePerYear
  const color = d3
    .scaleLinear()
    .domain([0, maxMoviesByGenre])
    .range(["yellow", "red"]);

  // the number of small multiple rows
  const numRows = Math.ceil(moviesByGenrePerYear.size / numCols);

  // the height of the individual charts
  const chartHeight = 120;

  // the margin of each small multiple
  const margin = { top: 20, right: 10, bottom: 20, left: 20 };

  // the total height of the chart
  const height = (numRows + 1) * chartHeight;

  // the extent of years to show by default
  const yearDomain = d3.extent(movies, (movie) =>
    movie.releaseDate.getFullYear()
  );

  // the extent of ratings to show
  const ratingDomain = [1, 10];

  // formatting helpers for the labels
  const yearFormat = d3.format(".4");
  const ratingFormat = d3.format(".2");

  // set the view box of the svg
  svg.attr("viewBox", [0, 0, width, height]);

  // a scale to compute the vertical position by row index
  const row = d3
    .scaleBand()
    .domain(d3.range(numRows))
    .range([chartHeight, height])
    .paddingInner(0.1);

  // a scale to compute the horizontal position by column index
  const col = d3
    .scaleBand()
    .domain(d3.range(numCols))
    .range([0, width])
    .paddingInner(0.05);

  // the scale for the year of the overview
  const overviewX = d3
    .scaleLinear()
    .domain(yearDomain)
    .range([margin.left, width - margin.right]);

  // the scale to map from year to horizontal position
  const x = d3
    .scaleLinear()
    .domain(yearDomain)
    .range([margin.left, col.bandwidth() - margin.right]);

  // the scale to map from rating to vertical position
  const y = d3
    .scaleLinear()
    .domain(ratingDomain)
    .range([row.bandwidth() - margin.bottom, margin.top])
    .nice();

  // create a group node for the overview
  const overview = svg.append("g");

  // create a group node for each small multiple to translate to the chart's position
  const charts = svg
    .append("g")
    .selectAll("g")
    .data(moviesByGenrePerYear)
    .join("g")
    .attr(
      "transform",
      (d, i) =>
        `translate(${col(i % numCols)}, ${row(Math.floor(i / numCols))})`
    );

  // helper function to transform genres to a unique clip-ID
  function clipPathId(genres) {
    return `clip${genres.split(" ").join("")}`;
  }

  // setup clip rectangles to prevent individual charts from overflowing
  charts
    .append("clipPath")
    .attr("id", ([genre, _]) => clipPathId(genre))
    .append("rect")
    .attr("x", x.range()[0])
    .attr("y", y.range()[1])
    .attr("width", x.range()[1] - x.range()[0])
    .attr("height", y.range()[0] - y.range()[1]);

  // line generator for the line in each small multiple
  const line = d3
    .line()
    .x(([year, { mean, count }]) => x(year))
    .y(([year, { mean, count }]) => y(mean));

  // create the paths for the line in each small multiple
  const lines = charts
    .append("g")
    .attr("clip-path", ([key, _]) => `url(#${clipPathId(key)})`)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .append("path")
    .datum(([genre, movies]) => new Map([...movies.entries()].sort()));

  // create a group node for the circles in each small multiple and use the clip path
  const circles = charts
    .append("g")
    .attr("clip-path", ([genre, _]) => `url(#${clipPathId(genre)})`);

  // create group nodes for the horizontal axes for each small multiple
  const xAxis = charts
    .append("g")
    .attr("transform", `translate(0, ${row.bandwidth() - margin.bottom})`);

  // create group nodes for the vertical axes for each small multiple
  const yAxis = charts
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`);

  // create the label for each small multiple
  charts
    .append("text")
    .attr("x", margin.left + 4)
    .attr("y", margin.top)
    .attr("font-size", 14)
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text(([genre, _]) => genre);

  // setup the brush in the overview
  const brush = d3
    .brushX()
    .extent([
      [overviewX.range()[0], y.range()[1]],
      [overviewX.range()[1], y.range()[0]],
    ])
    .on("brush", onBrush)
    .on("end", onBrushEnd);

  // reset to the default domain and re-draw
  function resetBrush() {
    x.domain(yearDomain);
    updateSmallMultiples();
  }

  // callback whenever a brush is set
  function onBrush({ selection }) {
    // reset brush when there is no valid selection
    if (!selection) {
      resetBrush();
      return;
    }

    // compute detail domain and use it for the small multiples
    const x0 = overviewX.invert(selection[0]);
    const x1 = overviewX.invert(selection[1]);
    x.domain([x0, x1]); // update the domain
    updateSmallMultiples(); // re-draw the small multiples
  }

  // callback when the brush ended
  function onBrushEnd({ selection }) {
    // reset brush when there is no valid selection
    if (!selection) {
      resetBrush();
    }
  }

  // setup the charts
  setupOverview();
  updateSmallMultiples();

  // setup the overview chart visualizing average rating and count across all genres
  function setupOverview() {
    // draw the line
    overview
      .append("path")
      .datum(moviesPerYear)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr(
        "d",
        d3
          .line()
          .x(([year, { mean, count }]) => overviewX(year))
          .y(([year, { mean, count }]) => y(mean))
      );

    // draw the circles
    overview
      .append("g")
      .selectAll("circle")
      .data(moviesPerYear)
      .join("circle")
      .attr("cx", ([year, { mean, count }]) => overviewX(year))
      .attr("cy", ([year, { mean, count }]) => y(mean))
      .attr("r", 3)
      .attr("stroke", "black")
      .attr("fill", ([year, { mean, count }]) => color(count));

    // create the horizontal axis
    overview
      .append("g")
      .attr("transform", `translate(0, ${row.bandwidth() - margin.bottom})`)
      .call(d3.axisBottom(overviewX).ticks(width / 80, yearFormat));

    // create the vertical axis
    overview
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(row.bandwidth() / 30, ratingFormat));

    // add the label for the overview
    overview
      .append("text")
      .attr("x", margin.left + 4)
      .attr("y", margin.top)
      .attr("fill", "black")
      .attr("font-size", 14)
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("All");

    overview.append("g").call(brush);
  }

  // draw the small multiples
  function updateSmallMultiples() {
    lines.attr("d", line);

    circles
      .selectAll("circle")
      .data(([genre, movies]) => movies)
      .join("circle")
      .attr("cx", ([year, { mean, count }]) => x(year))
      .attr("cy", ([year, { mean, count }]) => y(mean))
      .attr("r", 3)
      .attr("stroke", "black")
      .attr("fill", ([year, { mean, count }]) => color(count));

    // update the horizontal axis
    xAxis.call(d3.axisBottom(x).ticks(col.bandwidth() / 80, yearFormat));

    // update the vertical axis
    yAxis.call(d3.axisLeft(y).ticks(row.bandwidth() / 30, ratingFormat));
  }
}
