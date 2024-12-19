import '@scss/main.app.scss';
import Dropdown from 'bootstrap/js/src/dropdown';
import Modal from 'bootstrap/js/src/modal';
import Offcanvas from 'bootstrap/js/src/offcanvas';
import Toast from 'bootstrap/js/src/toast';
import CarouselGallery from "./carouselGallery";
import IMask from 'imask';
import QuizActions from "./QuizActions.js";
import FetchIt from "./modx/FetchIt.js";

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
        const hiddenNode = phoneBoxNode.querySelector('[data-hidden]');

        //inputNode.placeholder = '(000) 000-00-00';
        const mask = IMask(inputNode, {
            mask: '(###) ###-##-##',
            placeholderChar: '9',
            lazy: true,
            definitions: {
                '#': /[0-9]/
            }
        });
        mask.on('accept', function () {
            hiddenNode.value = '';
        })
        mask.on('complete', function () {
            hiddenNode.value = codeNode.innerHTML + ' ' + mask.value;
        })

        phoneBoxNode.addEventListener('click', (e) => {
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

    document.querySelectorAll('.js-quiz-form').forEach(quizFormNode => {
        new QuizActions(quizFormNode);
    });

    function setValueInNodes(nodes, value) {
        nodes.forEach(node => {
            if (node instanceof HTMLInputElement) {
                node.value = value;
            } else {
                node.innerHTML = value;
            }
        })
    }

    document.querySelectorAll('.js-modal').forEach(modalNode => {
        const defaultTitle = modalNode.dataset.defaultTitle;
        const defaultDesc = modalNode.dataset.defaultDescription;

        modalNode.addEventListener('show.bs.modal', e => {
            if (!e.relatedTarget) return;
            if (e.relatedTarget.dataset.name) {
                const nameNodes = modalNode.querySelectorAll('[data-name]');
                setValueInNodes(nameNodes, e.relatedTarget.dataset.name);
            }
            if (e.relatedTarget.dataset.title) {
                const titleNodes = modalNode.querySelectorAll('[data-title]');
                setValueInNodes(titleNodes, e.relatedTarget.dataset.title);
            }
            if (e.relatedTarget.dataset.description) {
                const titleNodes = modalNode.querySelectorAll('[data-decription]');
                setValueInNodes(titleNodes, e.relatedTarget.dataset.description);
            }
        });

        modalNode.addEventListener('hide.bs.modal', e => {
            if (defaultTitle) {
                const titleNodes = modalNode.querySelectorAll('[data-title]');
                setValueInNodes(titleNodes, defaultTitle);
            }
            if (defaultDesc) {
                const descNodes = modalNode.querySelectorAll('[data-description]');
                setValueInNodes(descNodes, defaultDesc);
            }
        })
    });

    FetchIt.Message = {
        _toastBootstrap: null,
        _toastNode: null,
        SUCCESS_CLS: 'bg-success',
        ERROR_CLS: 'bg-secondary',
        createToast(state = 'success', message) {
            if (!this._toastNode) {
                this._toastNode = document.getElementById('toast-fetchit');
                this._toastBootstrap = Toast.getOrCreateInstance(this._toastNode, { delay: FetchIt.DELAY });
            }

            this._toastNode.addEventListener('show.bs.toast', () => {
                this._toastNode.classList.remove(FetchIt.Message.SUCCESS_CLS);
                this._toastNode.classList.remove(FetchIt.Message.ERROR_CLS);
                this._toastNode.classList.add(state === 'success' ? FetchIt.Message.SUCCESS_CLS : FetchIt.Message.ERROR_CLS);
            }, {once: true});

            this._toastNode.querySelector('[data-message]').innerText = message;

            return this._toastBootstrap;
        },
        success(message) {
            this.createToast('success', message).show();
        },

        error(message) {
            this.createToast('error', message).show();
        }
    }

    document.head.querySelectorAll('script[data-fetchit-config]').forEach((script) => {
        FetchIt.create(JSON.parse(script.dataset['fetchitConfig']));
    });
})


/*
document.body.style.setProperty('--view-width', document.documentElement.clientWidth);
window.addEventListener('resize', () => {
    document.body.style.setProperty('--view-width', document.documentElement.clientWidth);
})*/
