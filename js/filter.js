class EventHandler {
  constructor(next = null) {
    this.next = next;
  }

  handle(event, items) {
    const filtered = this.applyFilter(event, items);
    return this.next ? this.next.handle(event, filtered) : filtered;
  }

  applyFilter(event, items) {
    return items;
  }
}

class SearchHandler extends EventHandler {
  applyFilter(event, items) {
    if (event.searchQuery) {
      const query = event.searchQuery.toLowerCase();
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }
    return items;
  }
}

class FilterHandler extends EventHandler {
  applyFilter(event, items) {
    let filteredItems = items;

    if (event.categories.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        event.categories.some((category) => item.categories.includes(category))
      );
    }

    if (event.types.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        event.types.some((type) => item.type === type)
      );
    }

    return filteredItems;
  }
}

class DurationHandler extends EventHandler {
    applyFilter(event, items) {
      const { minDuration, maxDuration } = event;

      if (minDuration == null && maxDuration == null) {
        return items;
      }

      return items.filter((item) => {
        const duration = item.duration;
        const meetsMin = minDuration != null ? duration >= minDuration : true;
        const meetsMax = maxDuration != null ? duration <= maxDuration : true;
        return meetsMin && meetsMax;
      });
    }
  }

export { SearchHandler, FilterHandler, DurationHandler };
