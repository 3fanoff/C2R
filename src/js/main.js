import '@scss/main.app.scss';
import CarouselGallery from "./carouselGallery";

let carousels = null;
document.addEventListener('DOMContentLoaded', () => {
    if ((carousels = document.querySelectorAll('.js-carousel-gallery')).length) {
        Array.from(carousels).forEach((carousel) => {
           new CarouselGallery(carousel).init();
        });
    }
})


/*
document.body.style.setProperty('--view-width', document.documentElement.clientWidth);
window.addEventListener('resize', () => {
    document.body.style.setProperty('--view-width', document.documentElement.clientWidth);
})*/
