import * as d3 from "d3";
import { loadMoviesDataset } from "../movies.js";
import { movieTable } from "./table.js";
import { histogram } from "./histogram.js";
import { smallMultiples } from "./smallMultiples.js";
import { barchart } from "./barchart.js";

import marked from "marked";
import answerTask1 from "./task1.md";

const width = 1000;

loadMoviesDataset().then((movies) => {
  console.log( movies.filter(d => d.imdbVotes > 150000).sort(a => d3.descending(a.imdbRating)).slice(0,10));

  // display the markdown file with the answer to task 1
  d3.select("div#task1").html(marked(answerTask1));

  // TODO: Task 2
  // setup an array topMovies with movies that have more than 150,000 imdbVotes
  // and keep only the top-10 highest-rated movies in descending order by
  // imdbRating replace the dummy implementation below that simply holds the
  // last 10 movies
  const topMovies = movies.filter(d => d.imdbVotes > 150000).sort((a,b) => d3.descending(a.imdbRating, b.imdbRating)).slice(0,10);

  movieTable({ table: d3.select("table#movies"), movies: topMovies });

  histogram({
    svg: d3.select("svg#histogram"),
    data: movies,
    yLabel: "number of movies",
    width: width,
    height: 300,
  });

  // TODO: Task 4
  // compute the count of movies per original language
  // the elements of the array have to be objects with a name and value property
  // each as shown below in the dummy; replace the dummy with your solution
  // toss languages with less than 10 movies to reduce clutter
  const movieCountByLanguage = [
    { name: "en", value: 42 },
    { name: "de", value: 28 },
    { name: "dk", value: 12 },
  ];

  barchart({
    svg: d3.select("svg#barchart"),
    data: movieCountByLanguage,
  });

  smallMultiples({
    svg: d3.select("svg#smallMultiples"),
    width: width,
    movies: movies,
    numCols: 3,
  });
});
