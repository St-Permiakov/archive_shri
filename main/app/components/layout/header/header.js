class Header {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'Header';

        // опции
        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.$navBtn = self.$el.find('.js-header-btn');
        self.$navMenu = self.$el.find('.js-header-nav');

        /* init */
        self.setListeners();
    }

    setListeners() {
        const self = this;
        self.$navBtn.on('click', function (e) {
            e.preventDefault();
            if (self.$navMenu.hasClass('opened')) {
                self.closeMenu();
            } else {
                self.openMenu();
            }
        });
    }

    openMenu() {
        this.$navMenu.addClass('opened');
    }

    closeMenu() {
        this.$navMenu.removeClass('opened');
    }
}

$(() => {
    $('.js-header').each((i, item) => {
        new Header(item);
    });
});