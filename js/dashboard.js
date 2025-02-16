import { renderCards, renderCarouselCards, loadCards, fetchJson, fetchTemplate } from "./utilities.js";

let currentToggle = "";

/**
 * Initializes the carousel for the given container.
 * @param {HTMLElement} container - The container element for the carousel.
 */
const initCarousel = (container) => {
    const glide = new Glide(container, {
      type: "carousel",
      startAt: 0,
      perView: 3,
      gap: 15,
      breakpoints: {
        1280: {
          perView: 3,
        },
        1024: {
          perView: 2,
        },
        768: {
          perView: 1,
        },
      },
    }).mount();

    glide.on(['move.after', 'run'], function() {
      container.querySelectorAll('a:not(.glide__slide--active)').forEach(link => {
        link.setAttribute('tabindex', -1);
      });
      container.querySelector('.glide__slide--active').setAttribute('tabindex', 0);
    });
  setupToggleListeners();
};

/**
 * Renders toggle buttons based on the set of categories using a template.
 * @param {Set} categories - The set of categories to create toggle buttons for.
 */
const renderFeatured = async (cards) => {
  try {
    const featured = await fetchJson("featured.json");
    const container = document.querySelector("#featured_learning");
    const featuredTemplate = await fetchTemplate("components/featured.html");

    const categories = new Set();

    featured.forEach(async (feature, index) => {
      categories.add(feature.category);

      const cardHtmlWithCategories = featuredTemplate
        .replace("{{title}}", feature.title)
        .replace("{{description}}", feature.description)
        .replaceAll("{{category}}", feature.category)
        .replace("{{visible}}", index !== 0 ? "true" : "false");

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = cardHtmlWithCategories.trim();
      const node = container.appendChild(tempDiv.firstElementChild);
      const slides = node.querySelector('.glide__slides');
      await renderCarouselCards(slides, cards, feature.category);
      initCarousel(node);
    });

    renderToggleButtons(categories);

    document.querySelectorAll('#featured_learning_block').forEach((block, index) => {
      if (index > 0) {
        block.classList.add('-translate-x-full', 'h-0', 'overflow-hidden');
      }
    });
  } catch (error) {
    console.error("Error rendering featured:", error);
  }
};

/**
 * Renders toggle buttons based on the set of categories using a template.
 * @param {Set} categories - The set of categories to create toggle buttons for.
 */
const renderToggleButtons = async (categories) => {
  const toggleContainer = document.querySelector("#toggles");
  const toggleTemplate = await fetchTemplate("components/toggle.html");

  let isFirst = true;
  categories.forEach((category) => {
    const buttonHtml = toggleTemplate.replaceAll("{{category}}", category);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = buttonHtml.trim();
    const button = tempDiv.firstElementChild;
    button.classList.add("toggle");
    button.setAttribute("data-category", category);

    if (isFirst) {
      button.classList.add("toggle-active");
      currentToggle = button;
      isFirst = false;
    } else {
      button.classList.add("toggle-inactive");
    }

    toggleContainer.appendChild(button);
  });
};

/**
 * Sets up event listeners for the toggle buttons.
 */
const setupToggleListeners = () => {
  const toggles = document.querySelectorAll(".toggle");
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", async (event) => {
      const category = event.target.getAttribute("data-category");
      const current_feature = document.querySelector(
        "#featured_learning_block:not(.h-0)"
      );
      const new_feature = document.querySelector(
        `div[data-category="${category}"]`
      );
      current_feature.classList.add('-translate-x-full','h-0','overflow-hidden');
      new_feature.classList.remove('-translate-x-full','h-0','overflow-hidden');

      currentToggle.classList.remove("toggle-active");
      currentToggle.classList.add("toggle-inactive");

      event.target.classList.remove("toggle-inactive");
      event.target.classList.add("toggle-active");

      currentToggle = event.target;
    });
  });
};

window.onload = async () => {
  const cards = await loadCards("new_learning.json");
  const new_area = document.querySelector("#new_learning");
  renderCards(new_area, cards);
  renderFeatured(cards);
};

const renderEvents = async (cards) => {
  const eventContainer = document.querySelector("#new_events");
  const eventTemplate = await fetchTemplate("components/horizontal_card.html");
  const tagTemplate = await fetchTemplate("components/tag.html");

  cards = cards.filter((card) => card.type === "event");

  cards.forEach((card, index) => {
    if(index >= 2) {
      return
    }
    
    const categoriesHtml = (card.categories || [])
    .map((tag) => tagTemplate.replace("{{category}}", tag))
    .join(" ");

    const dateStr = formatDate(card.date);

    const cardHtmlWithCategories = eventTemplate
    .replaceAll("{{title}}", card.title)
    .replace("{{content}}", card.content)
    .replace("{{thumbnail}}", card.thumbnail)
    .replace("{{location}}", card.location)
    .replace("{{date}}", dateStr)
    .replace("{{categories}}", categoriesHtml);

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cardHtmlWithCategories.trim();
    const event = tempDiv.firstElementChild;
    eventContainer.appendChild(event);
  });
};

const renderQuickLinks = async () => {
  const linkContainer = document.querySelector("#quick_links");

  const links = await fetchJson("../links.json");
  const linkTemplate = await fetchTemplate("components/quick_links.html");

  links.forEach(link => {
    const linkHtml = linkTemplate
    .replaceAll("{{title}}", link.title)
    .replace("{{icon}}", link.icon)
    .replace("{{href}}", link.href);

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = linkHtml.trim();
    const node = tempDiv.firstElementChild;
    linkContainer.appendChild(node);
  });
};

const formatDate = (dateStr) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [day, month] = dateStr.split("/");
  return `${parseInt(day)}<br>${months[parseInt(month) - 1]}`
}