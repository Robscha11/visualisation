import * as d3 from "d3";
import { getCountryFlag } from "../utils.js";

export function movieTable({ table, movies }) {
  function titleFormat(movie) {
    return `<a href="https://www.imdb.com/title/${movie.imdbId}">${movie.title}</a>`;
  }

  // TODO: Task 2
  // setup formatting functions that improve the readability of the runtime,
  // imdbRating, and imdbVotes
  // format the runtime in hours and minutes, for example 1:46 instead of 106
  const ratingFormat = (d) => d3.format(".1f")(d); // one decimal place
  const votesFormat = (d) => d3.format(".2s")(d); // choose a format that suits these large numbers
  const runtimeFormat = (d) => d3.timeFormat("%H")(d); // HH:MM as explained above

  //use d3 format

  // TODO: Task 2
  // setup color scales with adequate color schemes that determine the
  // background color of the respective cells; replace the dummy functions
  // below with your chosen color scale
  const runtimeColor = d3
  .scaleLinear()
  .domain(d3.extent(movies, d => d.runtime))
  .range(["orange", "red"]);
  const ratingColor = d3
  .scaleSequential(d3.interpolateRdYlGn)
  .domain(d3.extent(movies, d => d.imdbRating));
  const votesColor = d3
  .scaleSequential(d3.interpolateGreys)
  .domain(d3.extent(movies, d => d.imdbVotes));
  const genresColor = d3
  .scaleOrdinal(d3.schemeSet1)
  .domain(d3.extent(movies, d => d.votesColor));

  const columns = ["title", "countries", "length", "rating", "votes", "genres"];

  // header row with the attribute names
  table
    .append("thead")
    .append("tr")
    .selectAll("th")
    .data(columns)
    .join("th")
    .text((col) => col);

  // create a row for each movie
  const rows = table.append("tbody").selectAll("tr").data(movies).join("tr");

  // title
  rows.append("td").html((movie) => titleFormat(movie));

  // countries
  rows
    .append("td")
    .style("text-align", "right")
    .text((movie) =>
      movie.productionCountries
        .map((countryCode) => getCountryFlag(countryCode))
        .join(" ")
    );

  // runtime
  rows
    .append("td")
    .style("text-align", "right")
    .append("span")
    .style("color", "white")
    .style("background-color", (movie) => runtimeColor(movie.runtime))
    .text((movie) => runtimeFormat(movie.runtime));

  // idmb rating
  rows
    .append("td")
    .style("text-align", "right")
    .append("span")
    .style("color", "white")
    .style("background-color", (movie) => ratingColor(movie.imdbRating))
    .text((movie) => ratingFormat(movie.imdbRating));

  // number of votes
  rows
    .append("td")
    .style("text-align", "right")
    .append("span")
    .style("color", "white")
    .style("background-color", (movie) => votesColor(movie.imdbVotes))
    .text((movie) => votesFormat(movie.imdbVotes));

  // genre
  rows
    .append("td")
    .style("text-align", "right")
    .selectAll("span")
    .data((movie) => movie.genres)
    .join("span")
    .style("background", (genre) => genresColor(genre))
    .style("color", "white")
    .style("padding", "0px 4px")
    .style("margin", "2px 2px")
    .style("text-align", "center")
    // use only the first two letters for each genre
    .text((genre) => genre.slice(0, 2))
    // add a title element that reveals the full genre name on hover
    .attr("title", (genre) => genre);
}
