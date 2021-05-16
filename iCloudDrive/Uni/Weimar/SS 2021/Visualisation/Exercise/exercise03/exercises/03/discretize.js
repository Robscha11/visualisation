import * as d3 from "d3";

/* Function to discretize the defined ordered attributes to categorical attributes
  - data, the given dataset in our case the whole movies.csv
  RETURN: same dataset reduced to the 4 discretized attributes
*/
export function discretize(data) {
  // TODO: Task 1: define a scale to map performance (revenue - budget) to
  // the following categories and explain you choice shortly
  // Your explanation: 
  const performanceCategories = ["negative", "no", "positive"];
  //console.log(performanceCategories);
  //const performanceScale = (_) => performanceCategories[Math.round(Math.random()*(performanceCategories.length-1))];
  const performanceScale = d3.scaleThreshold()
  .domain([1000000, 10000000])
  .range(performanceCategories);
  // TODO: Task 1: define a scale to map imdbRating to
  // the following categories and explain you choice shortly
  // Your explanation:
  const ratingCategories = ["low", "medium", "high"];
  // Note: since the films have been chosen based on high rating the lowest
  // category was defined as high (you are free to choose your own categories) 
  const ratingScale = d3.scaleThreshold()
  .domain([7, 8])
  .range(ratingCategories);

  // TODO: Task 1: define a scale to map spokenLanguages to
  // the following categories and explain you choice shortly
  // local         means only one spoken language
  // international means more then one language
  // Your explanation:
  const internationality = ["local", "international"];
  const interantionalityScale = d3.scaleThreshold()
  .domain([2, 2])
  .range(internationality);

  // TODO: Task 1: define a scale to map releaseDate to
  // the following categories and explain your choice shortly
  // Your explanation:
  const yearCategories = [`${d3.min(data, d => d.releaseDate.getFullYear())} - 1950`, 
  "1950 - 2000", `2000 - ${d3.max(data, d => d.releaseDate.getFullYear())}`];
  const fiftyYearScale = (_) => yearCategories[Math.round(Math.random()*(yearCategories.length-1))];


  // Apply the defined scales to the respective 
  // attributes of the data and return them. 
  // The resulting dataset will be an array of objects that only
  // contain the newly created discretized attributes and the movies title
  return data.map((d) => {
    let entry = { title: d.title };

    // transform releaseDate 
    entry.period = fiftyYearScale(d.releaseDate.getFullYear());

    // transform performance (revenue - budget)
    entry.performance = performanceScale(d.revenue - d.budget);

    // transform imdbRating
    entry.rating = ratingScale(d.imdbRating);

    // transform spokenLanguages
    entry.internationality = interantionalityScale(d.spokenLanguages.length);

    return entry;
  });
}
