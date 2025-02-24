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
            currentPage = 1;
            renderPaginatedCards(filtered);
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
            renderPaginatedCards(filtered);
        });
    });
});

results_count = cards.length;

const updateCount = () => {
    results_counter.innerText = results_count;
};

const chain = new SearchHandler(new FilterHandler(new DurationHandler()));

let currentSearchQuery = "";
let currentCategories = [];
let currentTypes = [];
let minDuration = null;
let maxDuration = null;

const params = new URLSearchParams(window.location.search);

const search = document.querySelector("#search");

let debounceTimeout;
const debounce = (func, delay) => {
    return (...args) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(this, args), delay);
    };
};

const handleSearchInput = (event) => {
    currentSearchQuery = event.target.value;
    const filtered = chain.handle(
        { searchQuery: currentSearchQuery,
            categories: currentCategories, 
            types: currentTypes,
            minDuration: minDuration,
            maxDuration: maxDuration },
        cards
    );
    renderPaginatedCards(filtered);
};

search.addEventListener("input", debounce(handleSearchInput, 500));

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
    )
    currentPage = 1;
    renderPaginatedCards(filtered);
}

minDurationInput.addEventListener("input", (event) =>
    handleDurationInput(event, "min")
);
maxDurationInput.addEventListener("input", (event) =>
    handleDurationInput(event, "max")
);

const itemsPerPage = 5;
let currentPage = 1;

const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const currentPageText = document.getElementById("current_page");
const noPagesText = document.getElementById("no_pages");

const renderPaginatedCards = (filteredCards) => {
    cardsContainer.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedCards = filteredCards.slice(start, end);
    createCardWithTags(paginatedCards, cardsContainer);
    results_count = filteredCards.length;
    updateCount();
    updatePagination(filteredCards.length);
};

const updatePagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    currentPageText.innerText = currentPage;
    noPagesText.innerText = totalPages;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
};

prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
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
        renderPaginatedCards(filtered);
    }
});

nextButton.addEventListener("click", () => {
    const totalPages = Math.ceil(results_count / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
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
        renderPaginatedCards(filtered);
    }
});

// Initial render

if (params.has("query")) {
    search.value = params.get("query");
    currentSearchQuery = params.get("query");
    const filtered = chain.handle(
        { searchQuery: currentSearchQuery,
            categories: currentCategories, 
            types: currentTypes,
            minDuration: minDuration,
            maxDuration: maxDuration },
        cards
    );
    renderPaginatedCards(filtered);
    updatePagination(filtered.length);
} else {
    renderPaginatedCards(cards);
    updatePagination(cards.length);
}

updateCount();

