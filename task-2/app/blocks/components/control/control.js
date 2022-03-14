import noUiSlider from 'nouislider';

class Control {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'Control';

        self.el = el;
        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.init();
        self.setListeners();
    }

    setListeners() {
        const self = this;

        switch (self.opts.type) {
            case 'axis':
                self.el.noUiSlider.on('set', function() {
                    self.$el.trigger('control:change');
                });
                break;
            case 'round':
                self.$el.on('drag', function() {
                    self.changeRoundControl();
                });

                self.$el.on('change', function() {
                    self.changeRoundControl();
                    self.$el.trigger('control:change');
                });

                break;
        }
    }

    init() {
        this.createControl();
    }

    createControl() {
        const self = this;

        switch (self.opts.type) {
            case 'axis':
                self.createAxisControl();
                break;
            case 'round':
                self.createRoundControl();
                self.changeRoundControl();
                break;
        }
    }

    createAxisControl() {
        const self = this;
        const control = self.el;

        const orientation = window.innerWidth > 440 ? 'horizontal' : 'vertical';

        noUiSlider.create(control, {
            start: [20],
            connect: true,
            range: {
                'min': self.opts.min || 0,
                'max': self.opts.max || 100
            },
            orientation: orientation
        });
    }

    createRoundControl() {
        const self = this;

        self.$el.roundSlider({
            radius: 80,
            circleShape: "pie",
            sliderType: "min-range",
            showTooltip: false,
            value: 90,
            startAngle: 315
        });

        self.$valDisplay = self.$el.siblings('.js-control-center-value');
        self.$mask = self.$el.siblings('.js-control-mask-svg').find('.js-control-mask');
        self.mask = self.$mask[0];
        self.maskLength = self.mask.getTotalLength();
        self.$mask.attr({
            'stroke-dashoffset': self.maskLength,
            'stroke-dasharray': self.maskLength
        });
        self.maskPercent = self.maskLength * 0.01;
        self.rangePercent = (self.opts.max - self.opts.min) * 0.01;
    }

    changeRoundControl() {
        const self = this;

        const val = +self.$el.roundSlider('getValue');

        self.$mask.attr('stroke-dashoffset', self.maskLength - val * (self.maskPercent * 0.75));

        self.$valDisplay.text(self.getText());
    }

    setValue(value) {
        const self = this;
        switch (self.opts.type) {
            case 'axis':
                self.el.noUiSlider.set(value);
                break;
            case 'round':
                self.$el.roundSlider('setValue', value);
                self.$el.trigger('change');
                break;
        }
    }

    getText() {
        const self = this;
        let value;

        switch (self.opts.type) {
            case 'axis':
                value = Math.round(self.el.noUiSlider.get());
                break;
            case 'round':
                value = +self.$el.roundSlider('getValue');
                value = Math.round(self.rangePercent * value);
                break;
        }

        if (self.$el.data('prefix') === 'temp') {
            value = value > 0 ? '+' + value : value;
        }

        return value;
    }

    getValue() {
        const self = this;
        switch (self.opts.type) {
            case 'axis':
                return Math.round(self.el.noUiSlider.get());
            case 'round':
                return +self.$el.roundSlider('getValue');
        }
    }
}

$(() => {
    $('.js-control').each(function(i, item) {
        new Control(item);
    });
});