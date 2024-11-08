import '@scss/main.app.scss';
import Dropdown from 'bootstrap/js/src/dropdown';
import Offcanvas from 'bootstrap/js/src/offcanvas';
import CarouselGallery from "./carouselGallery";
import IMask from 'imask';

let carousels = null;
let ltLaptop = window.matchMedia('(max-width: 939px)');

document.addEventListener('DOMContentLoaded', () => {
    if ((carousels = document.querySelectorAll('.js-carousel-gallery')).length) {
        Array.from(carousels).forEach((carousel) => {
           new CarouselGallery(carousel, { circular: false, autoplay: false }).init();
        });
    }

    document.querySelectorAll('.js-dropdown-toggle').forEach(element => {
        let dropdownTimer;

        const dropdown = new Dropdown(element, {
            //display: 'static',
            popperConfig: {
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 16],
                        },
                    },
                ],
            }
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
            //let parentCenter = dropdown._parent.offsetWidth / 2;
            //let menuCenter = dropdown._menu.offsetWidth / 2;
            //dropdown._menu.style.left = -(menuCenter - parentCenter) + 'px';
        })

        dropdown._parent.addEventListener('mouseleave', () => {
            dropdownTimer = setTimeout(() => {
                dropdown.hide();
            }, ltLaptop.matches ? 0 : 1000);
        })
    })

    document.querySelectorAll('.js-phone-box').forEach(phoneBoxNode => {
        const inputNode = phoneBoxNode.querySelector('input[type="tel"]');
        const codeNode = phoneBoxNode.querySelector('[data-code]');
        const flagNode = phoneBoxNode.querySelector('[data-flag]');

        //inputNode.placeholder = '(000) 000-00-00';
        const mask = IMask(inputNode, {
            mask: '(###) ###-##-##',
            placeholderChar: '9',
            lazy: true,
            definitions: {
                '#': /[0-9]/
            }
        });

        phoneBoxNode.addEventListener('click', (e) => {
            console.log(e);
            const dataNode = e.target.hasAttribute('data-item') ? e.target :
                e.target.parentNode.hasAttribute('data-item') ? e.target.parentNode : null;
            if (dataNode) {
                let phoneMask = dataNode.dataset.mask.split(',')[0];

                inputNode.placeholder = phoneMask.replace(/\#/g, '9');
                codeNode.innerHTML = dataNode.dataset.code;
                flagNode.style.backgroundImage = 'url("' + dataNode.dataset.flag + '")';

                mask.updateOptions({
                    mask: phoneMask
                })
            }
        }, false);
    });
})


/*
document.body.style.setProperty('--view-width', document.documentElement.clientWidth);
window.addEventListener('resize', () => {
    document.body.style.setProperty('--view-width', document.documentElement.clientWidth);
})*/
