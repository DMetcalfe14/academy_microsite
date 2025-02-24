const main_carousel = document.querySelector('#main_carousel');

new Glide(main_carousel, {
    type: 'carousel',
    startAt: 0,
    perView: 1
  }).mount();