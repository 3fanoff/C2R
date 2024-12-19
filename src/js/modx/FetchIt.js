export default class FetchIt {
    static forms = [];
    static instances = {};
    static events = {
        before: 'fetchit:before',
        success: 'fetchit:success',
        error: 'fetchit:error',
        after: 'fetchit:after',
        reset: 'fetchit:reset',
    }

    static DELAY = 2000;

    constructor(form, config) {
        if (!(form instanceof HTMLFormElement)) {
            throw new Error('Не форма');
        }

        this.hideErrorsTimeout = {};
        this.form = form;
        this.config = config;

        this.request = new Request(this.config.actionUrl, {
            method: 'post',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-FetchIt-Action': this.config.action,
            },
        });

        this.prepareEvents();

        FetchIt.forms.push(this.form);
        FetchIt.instances[this.config.action] = this;
    }

    prepareEvents() {
        this.form.addEventListener('submit', e => {
            e.preventDefault();

            this.formData = new FormData(this.form);
            this.formData.set('pageId', this.config.pageId);

            this.clearErrors();

            const beforeEvent = new CustomEvent(FetchIt.events.before, {
                cancelable: true,
                detail: {
                    form: this.form,
                    formData: this.formData,
                    fetchit: this,
                },
            });

            FetchIt?.Message?.before?.();

            if (!document.dispatchEvent(beforeEvent)) {
                return;
            }

            this.disableFields();

            try {
                fetch(this.request, {body: this.formData}).then((query) => {
                    return query.json();
                }).then((response) => {

                    const afterEvent = new CustomEvent(FetchIt.events.after, {
                        cancelable: true,
                        detail: {
                            form: this.form,
                            formData: this.formData,
                            response,
                            fetchit: this,
                        },
                    });

                    FetchIt?.Message?.after?.(response.message);

                    if (!document.dispatchEvent(afterEvent)) {
                        return;
                    }

                    if (!response.success) {
                        FetchIt?.Message?.error?.(response.message);

                        const errorEvent = new CustomEvent(FetchIt.events.error, {
                            cancelable: true,
                            detail: {
                                form: this.form,
                                formData: this.formData,
                                response,
                                fetchit: this,
                            },
                        });

                        if (!document.dispatchEvent(errorEvent)) {
                            return;
                        }

                        for (const [name, message] of Object.entries(response.data)) {
                            this.setError(name, message);
                        }

                        return;
                    }

                    this.clearErrors();
                    FetchIt?.Message?.success?.(response.message);

                    if (this.form.dataset.redirect) {
                        setTimeout(() => {
                            window.location.href = this.form.dataset.redirect;
                        }, 2000);
                    }
                    const successEvent = new CustomEvent(FetchIt.events.success, {
                        detail: {
                            form: this.form,
                            formData: this.formData,
                            response,
                            fetchit: this,
                        },
                    });

                    if (!document.dispatchEvent(successEvent)) {
                        return;
                    }

                    if (typeof window.grecaptcha !== 'undefined') {
                        window.grecaptcha.reset();
                    }

                    if (this.config.clearFieldsOnSuccess) {
                        this.form.reset();
                    }


                });

            } catch (e) {
                console.error(e);
            } finally {
                this.enableFields();
            }
        });

        this.form.addEventListener('reset', () => {
            const resetEvent = new CustomEvent(FetchIt.events.reset, {
                detail: {
                    form: this.form,
                    fetchit: this,
                },
            });

            document.dispatchEvent(resetEvent);
            this.clearErrors();
            FetchIt?.Message?.reset?.();
        });

        ['change', 'input'].forEach(eventName => {
            this.form.addEventListener(eventName, ({target}) => {
                this.clearError(target.getAttribute('name'));
                if (target.getAttribute('data-custom')) {
                    this.clearError(target.getAttribute('data-custom'));
                }
            });
        });
    }

    clearErrors() {
        this.fields.forEach(field => this.clearError(field.getAttribute('name')));
    }

    clearError(name) {
        const fields = this.getFields(name);
        fields.forEach(field => {
            if (this.inputInvalidClasses) {
                field.classList.remove(...this.inputInvalidClasses);
            }
            field.removeAttribute('aria-invalid');
            // field.setCustomValidity('');
        });

        const errors = this.getErrors(name);
        errors.forEach(error => {
            error.style.display = 'none';
            error.innerHTML = '';
        });

        const customErrors = this.getCustomErrors(name);
        if (this.customInvalidClasses) {
            customErrors.forEach(({classList}) => classList.remove(...this.customInvalidClasses));
        }

        return {
            fields,
            errors,
            customErrors,
        };
    }

    setError(name, message = '') {
        clearTimeout(this.hideErrorsTimeout[name]);
        this.getFields(name).forEach(field => {
            if (this.inputInvalidClasses) {
                field.classList.add(...this.inputInvalidClasses);
            }
            field.setAttribute('aria-invalid', true);
            // if (!this.form.noValidate) {
            //   field.setCustomValidity(FetchIt.sanitizeHTML(message));
            //   field.reportValidity();
            // }
        });

        if (this.customInvalidClasses) {
            this.getCustomErrors(name).forEach(({classList}) => classList.add(...this.customInvalidClasses));
        }

        this.getErrors(name).forEach(error => {
            error.style.display = '';
            error.innerHTML = message;
        });

        this.hideErrorsTimeout[name] = setTimeout(() => {
            this.getErrors(name).forEach(error => {
                if (error.classList.contains('invalid-tooltip')) {
                    error.style.display = 'none';
                }
            });
        }, FetchIt.DELAY);
    }

    enableFields() {
        this.elements.forEach(field => field.removeAttribute('disabled'));
    }

    disableFields() {
        this.elements.forEach(field => field.setAttribute('disabled', ''));
    }

    getFields(name) {
        if (!name) {
            return [];
        }

        return Array.from(this.form.querySelectorAll(`[name="${name}"], [name="${name}[]"]`));
    }

    getErrors(name) {
        if (!name) {
            return [];
        }

        return Array.from(this.form.querySelectorAll(`[data-error="${name}"], [data-error="${name}[]"]`));
    }

    getCustomErrors(name) {
        if (!name) {
            return [];
        }

        return Array.from(this.form.querySelectorAll(`[data-custom="${name}"]`));
    }

    get elements() {
        return Array.from(this.form.elements);
    }

    get fields() {
        return this.elements.filter(({tagName}) => ['select', 'input', 'textarea'].includes(tagName.toLowerCase()));
    }

    get inputInvalidClasses() {
        return this.config.inputInvalidClass ? this.config.inputInvalidClass.split(' ') : [];
    }

    get customInvalidClasses() {
        return this.config.customInvalidClass ? this.config.customInvalidClass.split(' ') : [];
    }

    static sanitizeHTML(str = '') {
        return str.replace(/(<([^>]+)>)/gi, '');
    }

    static create(config) {
        if (!config.action) {
            throw new Error('Нет идентификатора формы FetchIt');
        }

        const forms = document.querySelectorAll(`form[data-fetchit="${config.action}"]`);
        if (!forms) {
            throw new Error(`В документе не найдено форм по селектору: form[data-fetchit="${config.action}"]`);
        }

        forms.forEach(form => {
            new this(form, config);
        });
    }
}

