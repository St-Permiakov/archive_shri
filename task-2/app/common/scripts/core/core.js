window.app = {};

// scrollbarWidth
window.app.scrollbarWidth = 0;

// measureScrollbar
function measureScrollbar() {
    const scrollDiv = document.createElement('div');
    document.body.appendChild(scrollDiv);
    $(scrollDiv).css({ position: 'absolute', top: '-9999px', width: '50px', height: '50px', overflow: 'scroll' });

    window.app.scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    document.body.removeChild(scrollDiv);
}
measureScrollbar();

function hideScrollX () {
    $('.js-hide-scroll-x').each(function(i, item) {
        $(item).css('margin-bottom', '-' + window.app.scrollbarWidth + 'px');
    });
}

function hideScrollY () {
    $('.js-hide-scroll-y').each(function(i, item) {
        $(item).css('margin-right', '-' + window.app.scrollbarWidth + 'px');
    });
}

$(window).on('resize', function() {
    measureScrollbar();
    hideScrollX();
    hideScrollY();
});

$(() => {
    if (window.app.scrollbarWidth > 0) {
        hideScrollX();
        hideScrollY();
    }
});