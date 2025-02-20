import {
    renderAndAppendToParent,
    createCardWithTags,
    fetchJson,
} from "./utilities-alternative.js";
import { SearchHandler, FilterHandler, DurationHandler } from "./filter.js";

let results_count = 0;
const results_counter = document.querySelector("#results_count");

const categoriesContainer = document.getElementById("categories");
const typesContainer = document.getElementById("types");
const cardsContainer = document.getElementById("results");

let cards = await fetchJson("../new_learning.json");

const getUniqueValues = (items, key) => {
    if (key === "categories") {
        return [...new Set(items.flatMap(item => item[key]))].map(value => ({
            id: value.toLowerCase().replace(" ", "_"),
            label: value,
        }));
    }
    return [...new Set(items.map(item => item[key]))].map(value => ({
        id: value.toLowerCase().replace(" ", "_"),
        label: value,
    }));
};

let categories = getUniqueValues(cards, "categories");
let types = getUniqueValues(cards, "type");

renderAndAppendToParent(
    "components/checkbox.html",
    categories,
    categoriesContainer
).then((node) => {
    const filters = node.querySelectorAll('input[type="checkbox"]');
    filters.forEach((filter) => {
        filter.addEventListener("change", (event) => {
            const category = event.target.getAttribute("data-category");
            if (event.target.checked) {
                currentCategories.push(category);
            } else {
                currentCategories = currentCategories.filter((x) => x !== category);
            }
            const filtered = chain.handle(
                { searchQuery: currentSearchQuery,
                    categories: currentCategories, 
                    types: currentTypes,
                    minDuration: minDuration,
                    maxDuration: maxDuration },
                cards
            );
            renderCards(filtered);
        });
    });
});

renderAndAppendToParent("components/checkbox.html", types, typesContainer).then((node) => {
    const filters = node.querySelectorAll('input[type="checkbox"]');
    filters.forEach((filter) => {
        filter.addEventListener("change", (event) => {
            const type = event.target.getAttribute("data-category");
            if (event.target.checked) {
                currentTypes.push(type);
            } else {
                currentTypes = currentTypes.filter((x) => x !== type);
            }
            const filtered = chain.handle(
                { searchQuery: currentSearchQuery,
                    categories: currentCategories, 
                    types: currentTypes,
                    minDuration: minDuration,
                    maxDuration: maxDuration },
                cards
            );
            renderCards(filtered);
        });
    });
});

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
let currentCategories = [];
let currentTypes = [];
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
        { searchQuery: currentSearchQuery,
            categories: currentCategories, 
            types: currentTypes,
            minDuration: minDuration,
            maxDuration: maxDuration },
        cards
    );
    renderCards(filtered);
});

// const filters = document.querySelectorAll('input[type="checkbox"]');

// filters.forEach((filter) => {
//     filter.addEventListener("change", (event) => {
//         const category = event.target.getAttribute("data-category");
//         if (event.target.checked) {
//             currentCategories.push(category);
//         } else {
//             currentCategories = currentCategories.filter((x) => x !== category);
//         }
//         const filtered = chain.handle(
//             { searchQuery: currentSearchQuery, checked: currentCategories },
//             cards
//         );
//         renderCards(filtered);
//     });
// });

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
            categories: currentCategories, 
            types: currentTypes,
            minDuration: minDuration,
            maxDuration: maxDuration
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