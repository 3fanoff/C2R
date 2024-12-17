export default class QuizActions {
    constructor(formNode) {
        this.stepNodes = Array.from(formNode.elements)
            .filter(node => node.type === 'fieldset');
        this.progressNode = formNode.querySelector('.js-progress');
        this.progressStepNode = formNode.querySelector('.js-progress-step');
        this.stepSize = this.stepNodes.length - 1;
        this.currentStep = 0;

        let self = this;

        this.stepNodes.forEach((fieldset, step) => {
            fieldset.querySelectorAll('button').forEach(element => {
                switch (true) {
                    case !element.disabled && element.hasAttribute('data-next'):
                        element.addEventListener('click', this.nextStep.bind(this, fieldset, step+1));
                        break;
                    case !element.disabled && element.hasAttribute('data-prev'):
                        element.addEventListener('click', this.prevStep.bind(this, fieldset, step-1));
                        break;
                    case !element.disabled && element.hasAttribute('data-submit'):
                        element.addEventListener('click', () => {
                            if (self.validateStep(self.stepSize)) {
                                formNode.submit();
                            }
                        });
                }
            })
        })
    }

    progress() {
        this.progressNode.style.width = 100/this.stepSize * this.currentStep + '%';
        this.progressStepNode.innerHTML =
            ((this.currentStep + 1) >= this.stepSize ? this.stepSize : (this.currentStep+1)) + '/' + this.stepSize;
    }

    nextStep(currentStepNode, nextStepIndex) {
        if (this.validateStep(this.currentStep)) {
            //this.progress();
            //let nextStep = this.currentStep + 1;
            currentStepNode.classList.add('d-none');
            this.stepNodes[nextStepIndex].classList.remove('d-none');
            this.currentStep = nextStepIndex;
            this.progress();
        }
    }

    prevStep(currentStepNode, prevStepIndex) {
        //let prevStep = this.currentStep - 1;
        currentStepNode.classList.add('d-none');
        this.stepNodes[prevStepIndex].classList.remove('d-none');
        this.currentStep = prevStepIndex;
        this.progress();
    }

    validateStep (stepNumber) {
        let errorsOnStep = 0;
        if (this.stepNodes[stepNumber]) {
            Array.from(this.stepNodes[stepNumber].elements)
                .filter(input => input.required).forEach(input => {
                if (input.value !== '') {
                    input.classList.remove('is-invalid');
                } else {
                    errorsOnStep++;
                    input.classList.add('is-invalid');
                }
            })
        }
        return errorsOnStep === 0;
    }
}