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

const renderCards = (filteredCards) => {
    cardsContainer.innerHTML = "";
    createCardWithTags(filteredCards, cardsContainer);
    results_count = filteredCards.length;
    updateCount();
};

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

const params = new URLSearchParams(window.location.search);

const search = document.querySelector("#search");

if (params.has("query")) {
    search.value = params.get("query");
}

search.addEventListener("input", (event) => {
    currentSearchQuery = event.target.value;
    const filtered = chain.handle(
        { searchQuery: currentSearchQuery, checked: currentFilters },
        cards
    );
    renderCards(filtered);
});

const filters = document.querySelectorAll('input[type="checkbox"]');

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
        renderCards(filtered);
    });
});

const minDurationInput = document.getElementById("min-duration");
const maxDurationInput = document.getElementById("max-duration");

const handleDurationInput = (event, type) => {
    if (type === "min") {
        minDuration = event.target.value || null;
    } else if (type === "max") {
        maxDuration = event.target.value || null;
    }
    const filtered = chain.handle(
        {
            searchQuery: currentSearchQuery,
            checked: currentFilters,
            minDuration: minDuration,
            maxDuration: maxDuration,
        },
        cards
    );
    renderCards(filtered);
};

minDurationInput.addEventListener("input", (event) =>
    handleDurationInput(event, "min")
);
maxDurationInput.addEventListener("input", (event) =>
    handleDurationInput(event, "max")
);
