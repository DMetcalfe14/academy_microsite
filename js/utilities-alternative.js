/**
 * @title fetchTemplate
 * @description Fetches the template from a given URL.
 * @param {string} url - The URL of the template to fetch.
 * @returns {Promise<string>} A promise that resolves to the template content.
 * @throws Will throw an error if the fetch operation fails.
 */
async function fetchTemplate(url) {
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (error) {
        console.error(`Error fetching template from ${url}:`, error);
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
 * @title renderItems
 * @description Renders multiple items using the provided template, replacing placeholders with item data.
 * @param {string} template - The template string with placeholders for data.
 * @param {Array} data - The array of data items to render, each being applied to the template.
 * @returns {Promise<string>} A promise that resolves to the combined HTML of all rendered items.
 */
async function renderItems(template, data) {
    const renderedItems = await Promise.all(
        data.map((item) => {
            let itemTemplate = template;
            // Replace placeholders in the template with data from each item
            for (const key of Object.keys(item)) {
                itemTemplate = itemTemplate.replaceAll(`{{${key}}}`, item[key]);
            }
            return itemTemplate;
        })
    );

    return renderedItems.join(""); // Combine all rendered items into one string
}

/**
 * Fetches the template, processes the data, and appends the rendered HTML to a parent container.
 * @param {string} templateUrl - The URL of the template to use for rendering.
 * @param {Array} data - The array of data items to render using the template.
 * @param {HTMLElement} parentContainer - The parent element to append the rendered content.
 */
async function renderAndAppendToParent(templateUrl, data, parentContainer) {
    try {
        const template = await fetchTemplate(templateUrl);
        const renderedHtml = await renderItems(template, data);

        // Create a wrapper element to safely insert the rendered HTML
        const wrapper = document.createElement("div");
        wrapper.innerHTML = renderedHtml;
        parentContainer.appendChild(wrapper);
    } catch (error) {
        console.error("Error rendering and appending items:", error);
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
 * Creates a card component with rendered tags (categories) and appends it to a parent container.
 * @param {Array} categories - An array of category objects to render. Each object should match the placeholders in the tag template.
 * @param {HTMLElement} parentContainer - The parent container where the rendered card will be appended.
 */
async function createCardWithTags(cards, parentContainer) {
    const tagTemplateUrl = "components/tag.html"; // URL of the tag template
    const cardTemplateUrl = "components/card.html"; // URL of the card template

    try {
        cards.forEach(async (card) => {
            const tagTemplate = await fetchTemplate(tagTemplateUrl);
            const renderedTags = await renderItems(tagTemplate, card.categories.map(category => ({ category })));

            const renderedIcon = getIconByType(card.type)

            const duration = toHoursAndMinutes(card.duration)

            const cardData = [{
                ...card,
                categories: renderedTags,
                icon: renderedIcon,
                duration: duration
            }];

            await renderAndAppendToParent(cardTemplateUrl, cardData, parentContainer);
        });
    } catch (error) {
        console.error("Error creating card with tags:", error);
    }
}

const toHoursAndMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
}

export { renderAndAppendToParent, createCardWithTags, fetchJson }