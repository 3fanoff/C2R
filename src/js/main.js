import '@scss/main.app.scss';
import * as bs from 'bootstrap';
import CarouselGallery from "./carouselGallery";

let carousels = null;
let ltLaptop = window.matchMedia('(max-width: 939px)');

document.addEventListener('DOMContentLoaded', () => {
    if ((carousels = document.querySelectorAll('.js-carousel-gallery')).length) {
        Array.from(carousels).forEach((carousel) => {
           new CarouselGallery(carousel).init();
        });
    }

    document.querySelectorAll('.js-dropdown-toggle').forEach(element => {
        let dropdownTimer;


        const dropdown = new bs.Dropdown(element, {
            display: 'static'
        });

        element.addEventListener('click', (e) => {
            if (ltLaptop.matches) {
                e.preventDefault();
            }
        })

        element.addEventListener('mouseover', () => {
            clearTimeout(dropdownTimer);
            console.log(dropdown);
            dropdown.show();
            let parentCenter = dropdown._parent.offsetWidth / 2;
            let menuCenter = dropdown._menu.offsetWidth / 2;
            dropdown._menu.style.left = -(menuCenter - parentCenter) + 'px';
        })

        dropdown._parent.addEventListener('mouseleave', () => {
            dropdownTimer = setTimeout(() => {
                dropdown.hide();
            }, ltLaptop.matches ? 0 : 1000);
        })
    })

})


/*
document.body.style.setProperty('--view-width', document.documentElement.clientWidth);
window.addEventListener('resize', () => {
    document.body.style.setProperty('--view-width', document.documentElement.clientWidth);
})*/
