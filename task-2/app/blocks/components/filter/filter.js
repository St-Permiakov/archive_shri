class Filter {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'Filter';

        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.$section = self.$el.parents('.js-section');
        self.$filterItems = self.$el.find('.js-filter-item');
        self.$filters = self.$el.find('.js-filter-item-button');
        self.$filteredItems = self.$section.find('.js-filtered-item');

        self.setListeners();
    }

    setListeners() {
        const self = this;

        self.$filters.on('click', function(e) {
            e.preventDefault();
            if (window.innerWidth > 767 || self.$el.hasClass('active')) {
                self.applyFilter($(this));

                if (window.innerWidth < 767) {
                    self.$filterItems.removeClass('active');
                    $(this).parents('.js-filter-item').addClass('active');
                    self.$el.removeClass('active');
                }

            } else {
                self.$el.addClass('active');
            }
        });

        self.$el.on('click', function(e) {
            if (window.innerWidth < 768 && !$(e.target).is('.js-filter-item') && $(e.target).parents('.js-filter-item').length === 0) {
                self.$el.removeClass('active');
            }
        });
    }

    applyFilter($filter) {
        const self = this;
        const filter = $filter.data('type');

        self.$filters.removeClass('active');
        $filter.addClass('active');

        self.$filteredItems.each(function() {
            const $filteredItem = $(this);

            if ($filteredItem.data('type').indexOf(filter) > -1) {
                $filteredItem.show();
            } else {
                $filteredItem.hide();
            }
        });

        self.$section.trigger('filter:change');
    }
}

$(() => {
    $('.js-filter').each(function(i, item) {
        new Filter(item);
    });
});