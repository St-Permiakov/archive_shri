class Pleer {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'Pleer';

        // опции
        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.$track = self.$el.find('.js-pleer-track');
        self.$trackLine = self.$el.find('.js-pleer-track-line');
        self.$trackControl = self.$el.find('.js-pleer-track-control');
        self.$trackTime = self.$el.find('.js-pleer-track-time');
    }
}

$(() => {
    $('.js-pleer').each((i, item) => {
        new Pleer(item);
    });
});