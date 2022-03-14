class Bubble {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'Bubble';

        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.setListeners();
    }

    setListeners() {
        const self = this;

        self.$el.on('click', function() {
            if (!self.$el.hasClass('js-popup-trigger')) {
                self.changeMode();
            }
        });
    }

    changeMode() {
        const self = this;

        self.$el.removeClass('mode-' + self.opts.mode);
        self.opts.mode = self.opts.mode < self.opts.modes ? self.opts.mode + 1 : 1;
        self.$el.addClass('mode-' + self.opts.mode);
        self.$el.data('mode', self.opts.mode);
    }
}

$(() => {
    $('.js-bubble').each(function(i, item) {
        new Bubble(item);
    });
});