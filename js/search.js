import {
  renderAndAppendToParent,
  createCardWithTags,
  fetchJson,
} from "./utilities-alternative.js";
import { SearchHandler, FilterHandler, DurationHandler } from "./filter.js";

let results_count = 0;
const results_counter = document.querySelector("#results_count");

const categoriesContainer = document.getElementById("categories");

let categories = [
  { label: "Analysis" },
  { label: "Change" },
  { label: "Communication" },
  { label: "Debate" },
  { label: "Decision making" },
];

categories = categories.map((category) => {
  return {
    id: category.label.toLowerCase().replace(" ", "_"),
    label: category.label,
  };
});

renderAndAppendToParent(
  "components/checkbox.html",
  categories,
  categoriesContainer
);

const typesContainer = document.getElementById("types");

let types = [
  { label: "Audio Book" },
  { label: "Book" },
  { label: "eLearning" },
  { label: "Event" },
  { label: "Pathway" },
];

types = types.map((type) => {
  return {
    id: type.label.toLowerCase().replace(" ", "_"),
    label: type.label,
  };
});

renderAndAppendToParent("components/checkbox.html", types, typesContainer);

const cardsContainer = document.getElementById("results");

let cards = await fetchJson("../new_learning.json");

createCardWithTags(cards, cardsContainer);

results_count = cards.length;

const updateCount = () => {
  results_counter.innerText = results_count;
};

updateCount();

const chain = new SearchHandler(new FilterHandler(new DurationHandler()));

let currentSearchQuery = "";
let currentFilters = [];
let minDuration = null;
let maxDuration = null;

const search = document.querySelector("#search");

search.addEventListener("input", (event) => {
  currentSearchQuery = event.target.value;
  const filtered = chain.handle(
    { searchQuery: currentSearchQuery, checked: currentFilters },
    cards
  );
  console.log(filtered);
});

const filters = document.querySelectorAll('input[type = "checkbox"]');

filters.forEach((filter) => {
  filter.addEventListener("change", (event) => {
    const category = event.target.getAttribute("data-category");
    if (event.target.checked) {
      currentFilters.push(category);
    } else {
      currentFilters = currentFilters.filter((x) => x !== category);
    }
    const filtered = chain.handle(
      { searchQuery: currentSearchQuery, checked: currentFilters },
      cards
    );
    console.log(currentFilters);
    console.log(filtered);
  });
});

const minDurationInput = document.getElementById("min-duration");
const maxDurationInput = document.getElementById("max-duration");

minDurationInput.addEventListener("input", (event) => {
  event.minDuration = event.target.value
    ? parseInt(event.target.value, 10)
    : null;
  const filtered = chain.handle(
    {
      searchQuery: currentSearchQuery,
      checked: currentFilters,
      minDuration: minDuration,
      maxDuration: maxDuration,
    },
    cards
  );
  console.log(filtered);
});

// document.addEventListener("DOMContentLoaded", async () => {
//     setTimeout(() => {
//         document.getElementById("loading-screen").classList.add("hidden");
//         document.querySelector("main").classList.remove("opacity-0");
//     }, 500);
// });
