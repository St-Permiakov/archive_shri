class Scenarios {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'Scenarios';

        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.$sliderCont = self.$el.find('.js-scenarios-slider-inner');
        self.$sliderItems = self.$el.find('.js-scenarios-slider-item');

        self.$arrowBack = self.$el.find('.js-scenarios-slider-left');
        self.$arrowForth = self.$el.find('.js-scenarios-slider-right');

        self.curGroup = 0;

        if (window.innerWidth > 767) {
            self.setListeners();
            self.init();
        }
    }

    setListeners() {
        const self = this;

        self.$arrowForth.on('click', function(e) {
            e.preventDefault();
            if (!self.animated) {
                self.changeSlides('forth');
            }
        });

        self.$arrowBack.on('click', function(e) {
            e.preventDefault();
            if (!self.animated) {
                self.changeSlides('back');
            }
        });
    }

    init() {
        this.calculatePlace();
        this.changeSlides();
        this.checkArrows();
    }

    calculatePlace() {
        const self = this;

        self.height = self.$sliderCont.outerHeight();
        self.width = self.$sliderCont.outerWidth();
        self.itemWidth = self.$sliderItems.outerWidth(true);
        self.itemHeight = self.$sliderItems.outerHeight(true);

        self.maxItems = Math.floor(self.height / self.itemHeight) * Math.floor(self.width / self.itemWidth);
    }

    changeSlides(direction) {
        const self = this;

        self.animated = true;

        switch (direction) {
            case 'back':
                self.curGroup -= 1;
                break;
            case 'forth':
                self.curGroup += 1;
                break;
        }

        self.$sliderItems.each(function(i, item) {
            if (i >= self.curGroup * self.maxItems && i + 1 <= self.curGroup * self.maxItems + self.maxItems) {

                setTimeout(() => {
                    $(item).removeClass('disabled').addClass('in');
                }, 300);

                setTimeout(() => {
                    $(item).removeClass('in');
                }, 350);

            } else {

                $(item).addClass('out');

                setTimeout(() => {
                    $(item).addClass('disabled').removeClass('out');
                }, 300);

            }
        });

        setTimeout(() => {
            self.checkArrows();
            self.animated = false;
        }, 350);
    }

    checkArrows() {
        const self = this;

        if (self.$sliderItems.last().hasClass('disabled')) {
            self.$arrowForth.removeClass('disabled');
        } else {
            self.$arrowForth.addClass('disabled');
        }

        if (self.$sliderItems.first().hasClass('disabled')) {
            self.$arrowBack.removeClass('disabled');
        } else {
            self.$arrowBack.addClass('disabled');
        }
    }
}

$(() => {
    $('.js-scenarios').each(function(i, item) {
        new Scenarios(item);
    });
});