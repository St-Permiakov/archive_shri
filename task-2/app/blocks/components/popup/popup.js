class Popup {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'Popup';

        // опции
        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.$trigger = $('#' + self.opts.triggerId);
        self.$cancelBtn = self.$el.find('.js-popup-cancel');
        self.$applyBtn = self.$el.find('.js-popup-apply');

        self.$status = self.$el.find('.js-status');

        self.$presets = self.$el.find('.js-popup-preset');
        self.$control = self.$el.find('.js-control');
        self.$controlValue = self.$el.find('.js-control-value');

        self.init();
    }

    init() {
        this.setPosition();
        this.setListeners();
    }

    setListeners() {
        const self = this;

        self.$trigger.on('click', function() {
            self.open();
            self.setStatus($(this).find('.js-status').text());
        });

        self.$cancelBtn.on('click', function() {
            self.cancel();
        });

        self.$applyBtn.on('click', function() {
            self.apply();
        });

        self.pageClickHandler = function (e) {
            if ($(e.target).parents('.js-popup').length === 0 && !$(e.target).is('.js-popup')) {
                e.preventDefault();
                self.cancel();
            }
        };

        self.$presets.on('click', function(e) {
            e.preventDefault();
            self.$presets.removeClass('active');
            $(this).addClass('active');
            self.setPreset($(this).data('type'));
        });

        self.$control.on('control:change', function() {
            self.$controlValue.text($(this).data('Control').getText());
        });
    }

    setPosition() {
        const self = this;

        self.$el.css({
            'top': self.$trigger.offset().top,
            'left': self.$trigger.offset().left,
            'width': self.$trigger.outerWidth(),
            'height': self.$trigger.outerHeight()
        });
    }

    open() {
        const self = this;

        $('.js-page').addClass('blured');
        self.$el.addClass('active mode-' + self.$trigger.data('mode'));

        // записываем последнее значение при первом открытии попапа
        // в принципе, то же самое можно (и нужно) делать с бэка, но сейчас так проще, т.к. расчёты сложные
        if (!self.$el.data('last-value')) {
            self.$el.data('last-value', self.$control.data('Control').getValue());
        }

        setTimeout(() => {
            $(window).on('mousedown touchstart', self.pageClickHandler);
        }, 100);
    }

    close() {
        const self =  this;

        $('.js-page').removeClass('blured');
        this.$el.removeClass('active');
        this.$el.addClass('animated');
        $(window).off('mousedown touchstart', self.pageClickHandler);

        setTimeout(() => {
            this.$el.removeClass('animated');
        }, 300);
    }

    setPreset(value) {
        this.$control.data('Control').setValue(value);
    }

    setStatus(text) {
        this.$status.text(text);
    }

    reset() {
        const self = this;
        self.$control.data('Control').setValue(self.$el.data('last-value'));
    }

    cancel() {
        this.reset();
        this.close();
    }

    apply() {
        const self = this;

        self.$el.data('last-value', self.$control.data('Control').getValue());

        self.close();
    }
}

$(() => {
    $('.js-popup').each((i, item) => {
        new Popup(item);
    });
});