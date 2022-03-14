class MainSection {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'MainSection';

        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.$slider = self.$el.find('.js-main-section-slider-inner');
        self.$slides = self.$slider.find('.js-main-section-slide');

        // init
        self.setListeners();
        self.toggleArrow();
    }

    setListeners() {
        const self = this;

        self.$slider.on('scroll', function() {
            self.toggleArrow();
        });
    }

    toggleArrow() {
        const self = this;

        if (window.innerWidth > 767) {
            self.$slides.each(function(i, item) {
                const $slide = $(item);
                if ($slide.outerHeight() + $slide.position().top > self.$slider.outerHeight() && $slide.position().top < self.$slider.outerHeight()) {
                    $slide.addClass('partially-hidden');
                } else {
                    $slide.removeClass('partially-hidden');
                }
            });
        }

    }
}

$(() => {
    $('.js-main-section').each(function(i, item) {
        new MainSection(item);
    });
});