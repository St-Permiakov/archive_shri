class Section {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'Section';

        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.$slider = self.$el.find('.js-section-slider-inner');
        self.$slides = self.$el.find('.js-section-slider-item');
        self.$prevBtn = self.$el.find('.js-section-slider-left');
        self.$nextBtn = self.$el.find('.js-section-slider-right');

        self.setListeners();
        self.updateArrows();
    }

    setListeners() {
        const self = this;

        $(window).on('resize', function() {
            self.updateArrows();
        });

        self.$el.on('filter:change', function() {
            self.updateArrows();
        });

        self.$slider.on('scroll', function() {
            self.updateArrows();
        });

        self.$prevBtn.on('click', function(e) {
            e.preventDefault();
            if (!$(this).hasClass('disabled')) {
                self.moveLeft();
            }
        });

        self.$nextBtn.on('click', function(e) {
            e.preventDefault();
            if (!$(this).hasClass('disabled')) {
                self.moveRight();
            }
        });
    }

    moveLeft() {
        const self = this;
        self.$slider.animate({scrollLeft: self.$slider.scrollLeft() - self.$slider.width()}, 400);
    }

    moveRight() {
        const self = this;
        self.$slider.animate({scrollLeft: self.$slider.scrollLeft() + self.$slider.width()}, 400);
    }

    updateArrows() {
        const self = this;

        if (self.$slides.first().position().left < 0) {
            self.$prevBtn.removeClass('disabled');
        } else {
            self.$prevBtn.addClass('disabled');
        }

        if (self.$slides.last().position().left + self.$slides.last().outerWidth() > self.$slider.outerWidth()) {
            self.$nextBtn.removeClass('disabled');
        } else {
            self.$nextBtn.addClass('disabled');
        }
    }
}

$(() => {
    $('.js-section').each(function(i, item) {
        new Section(item);
    });
});