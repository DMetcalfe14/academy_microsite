/**
 * @title Fetch Template
 * @description Fetches a template from a given URL.
 * @param {string} url - The URL of the template to fetch.
 * @returns {Promise<string>} A promise that resolves to the template content.
 * @throws Will throw an error if the fetch operation fails.
 */
async function fetchTemplate(url) {
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
}

/**
 * @title Fetch JSON
 * @description Fetches JSON data from a given URL.
 * @param {string} url - The URL of the JSON data to fetch.
 * @returns {Promise<Object>} A promise that resolves to the JSON data.
 * @throws Will throw an error if the fetch operation fails.
 */
async function fetchJson(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching JSON from ${url}:`, error);
        throw error;
    }
}

/**
 * @title Get Icon By Type
 * @description Gets the icon class name based on the type.
 * @param {string} type - The type of the icon.
 * @returns {string} The icon class name.
 */
function getIconByType(type) {
    const icons = {
        pathway: "iconoir-path-arrow",
        video: "iconoir-video-camera",
        event: "iconoir-calendar",
        article: "iconoir-journal-page",
        file: "iconoir-empty-page",
        default: "iconoir-question-mark",
    };
    return icons[type] || icons.default;
}

/**
 * @title Create Card HTML
 * @description Creates the HTML for a learning card.
 * @param {Object} card - The card data.
 * @param {string} cardTemplate - The card template.
 * @param {string} tagTemplate - The tag template.
 * @returns {string} The generated card HTML.
 */
function createCardHtml(card, cardTemplate, tagTemplate) {
    const categoriesHtml = (card.categories || [])
        .map((tag) => tagTemplate.replace("{{category}}", tag))
        .join(" ");

    return cardTemplate
        .replaceAll("{{title}}", card.title)
        .replace("{{content}}", card.content)
        .replaceAll("{{type}}", card.type)
        .replace("{{categories}}", categoriesHtml)
        .replaceAll("{{duration}}", card.duration)
        .replace("{{thumbnail}}", card.thumbnail)
        .replace("{{alt}}", card.alt)
        .replace("{{icon}}", getIconByType(card.type));
}

/**
 * @title Render Cards
 * @description Renders cards in a container element.
 * @param {HTMLElement} container - The container element.
 * @param {Object[]} cards - The array of card data.
 * @param {string} [category] - Optional category to filter the cards.
 * @param {string} [elementType=div] - The type of element to create for each card.
 * @param {boolean} [isCarousel=false] - Whether the cards are for a carousel.
 * @returns {Promise<void>} A promise that resolves when the cards are rendered.
 * @throws Will throw an error if the container element is not found or if the fetch operation fails.
 */
async function renderCards(container, cards, category, elementType = "div", isCarousel = false) {
    if (!container) {
        console.error(`Error: container element not found`);
        return;
    }

    try {
        const [cardTemplate, tagTemplate] = await Promise.all([
            fetchTemplate("components/card.html"),
            fetchTemplate("components/tag.html"),
        ]);

        const filteredCards = category
            ? cards.filter((card) => card.categories && card.categories.includes(category))
            : cards;

        filteredCards.forEach((card) => {
            const cardHtml = createCardHtml(card, cardTemplate, tagTemplate);
            const newCard = document.createElement(elementType);
            newCard.innerHTML = cardHtml.trim();
            if (isCarousel) {
                newCard.classList.add("glide__slide");
            }
            container.appendChild(newCard.firstElementChild);
        });
    } catch (error) {
        console.error("Error rendering cards:", error);
    }
}

/**
 * @title Render Carousel Cards
 * @description Renders carousel cards in a container element.
 * @param {HTMLElement} container - The container element.
 * @param {Object[]} cards - The array of card data.
 * @param {string} [category] - Optional category to filter the cards.
 * @returns {Promise<void>} A promise that resolves when the cards are rendered.
 * @throws Will throw an error if the container element is not found or if the fetch operation fails.
 */
async function renderCarouselCards(container, cards, category) {
    return renderCards(container, cards, category, "li", true);
}

/**
 * @title Load Cards
 * @description Asynchronously loads card data from a JSON file.
 * @param {string} file - The path to the JSON file.
 * @returns {Promise<Object[]>} A promise that resolves to an array of card objects.
 * @throws Will throw an error if the fetch operation fails.
 */
const loadCards = async (file) => {
    try {
      const cards = await fetch(file).then((res) => res.json());
      return cards;
    } catch (error) {
      console.error("Error loading cards:", error);
    }
};

export { renderCards, renderCarouselCards, loadCards, fetchTemplate, fetchJson };