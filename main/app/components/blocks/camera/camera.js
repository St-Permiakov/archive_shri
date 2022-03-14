class Camera {
    constructor(el, opts) {
        const self = this;
        self.DATA_KEY = 'Camera';

        // опции
        self.$el = $(el);
        self.$el.data(self.DATA_KEY, self);
        self.opts = $.extend({}, self.$el.data(), opts);

        self.$cameraWrapper = self.$el.find('.js-camera-wrapper');
        self.$cameraRails = self.$el.find('.js-camera-movable');
        self.$camera = self.$el.find('.js-camera-img');
        self.$zoomVal = self.$el.find('.js-camera-info-val[data-info=zoom]');
        self.$brightVal = self.$el.find('.js-camera-info-val[data-info=brightness]');

        self.canMove = true;
        self.canZoomOut = true;
        self.canZoomIn = true;

        self.pointers = {};
        self.camData = {
            x: 0,
            zoom: 1,
            brightness: 100
        };

        // разница расстояния между точками
        self.prevDiffX = 0;
        self.prevDiffY = 0;

        self.init();
    }

    init() {
        this.setListeners();
    }

    setListeners() {
        const self = this;
        const camera = self.$cameraWrapper[0];

        // TODO: исправить баг мерцания под курсором
        if (window.innerWidth < 1025) {
            camera.addEventListener('pointerdown', e => {
                camera.setPointerCapture(e.pointerId);
                self.camData.x = Math.round(self.$cameraRails.offset().left);

                camera.addEventListener('pointermove', e => {
                    if (!self.pointers.hasOwnProperty(e.pointerId))
                        self.pointers[e.pointerId] = e;

                    if (Object.keys(self.pointers).length === 1 && self.canMove) {
                        self.handleMove(e);
                    }

                    if (Object.keys(self.pointers).length === 2) {
                        self.canMove = false;
                        self.pointers[e.pointerId] = e;
                        self.handleMultiTouch();
                    }
                });
            });

            camera.addEventListener('pointerup', e => {
                delete self.pointers[e.pointerId];
                if (Object.keys(self.pointers).length < 2) {
                    setTimeout(() => {
                        self.canMove = true;
                        self.canZoomIn = true;
                        self.canZoomOut = true;
                    }, 500);
                }
            });
        }
    }

    handleMove(e) {
        const self = this;
        const pointerId = e.pointerId;
        const startPoint = {
            x: self.pointers[pointerId].offsetX,
            y: self.pointers[pointerId].offsetY
        };

        const imgRightEdge =
            self.$cameraRails.offset().left + self.$cameraRails.width();
        const imgLeftEdge = self.$cameraRails.offset().left;
        const wrapRightEdge =
            self.$cameraWrapper.offset().left + self.$cameraWrapper.width();
        const wrapLeftEdge = self.$cameraWrapper.offset().left;

        let diff = Math.round(
            e.offsetX -
            startPoint.x +
            self.camData.x -
            self.$cameraWrapper.offset().left
        );
        if (
            !(wrapLeftEdge <= imgLeftEdge && e.offsetX - startPoint.x > 0) &&
            !(wrapRightEdge >= imgRightEdge && e.offsetX - startPoint.x < 0)
        ) {
            self.$cameraRails.css('left', diff + 'px');
        }
    }

    handleMultiTouch(e) {
        const self = this;
        let curDiffX = Math.abs(
            self.pointers[Object.keys(self.pointers)[0]].clientX -
            self.pointers[Object.keys(self.pointers)[1]].clientX
        );
        let curDiffY = Math.abs(
            self.pointers[Object.keys(self.pointers)[0]].clientY -
            self.pointers[Object.keys(self.pointers)[1]].clientY
        );
        let curDiff = curDiffX + curDiffY;
        let zoom = self.camData.zoom;

        // если разница по одной из осей сокращается, то это поворот
        if (
            (curDiffX > self.prevDiffX && curDiffY < self.prevDiffY) ||
            (curDiffX < self.prevDiffX && curDiffY > self.prevDiffY)
        ) {
            self.canZoomIn = false;
            self.canZoomOut = false;


            if (curDiffX > self.prevDiffX && curDiffY < self.prevDiffY) {
                self.camData.brightness = self.camData.brightness < 100 ? self.camData.brightness + parseFloat((curDiffX / 100).toFixed(2)) : 100;
            } else {
                self.camData.brightness = self.camData.brightness > 50 ? self.camData.brightness - parseFloat((curDiffY / 100).toFixed(2)) : 50;
            }
            self.$camera.css('filter', 'brightness(' + self.camData.brightness / 100 + ')')
            self.$brightVal.text(Math.round(self.camData.brightness) + '%');

        } else {
            // zoom
            if (curDiff > self.prevDiff && self.canZoomIn) {
                zoom = self.camData.zoom + parseFloat((curDiff / 10000).toFixed(2));
                self.canZoomOut = false;
            } else if (
                curDiff < self.prevDiff &&
                self.camData.zoom > 1 &&
                self.canZoomOut
            ) {
                zoom = self.camData.zoom - parseFloat((curDiff / 10000).toFixed(2));
                self.canZoomIn = false;
            }

            zoom = zoom < 1 ? 1 : zoom;

            self.$camera.css('transform', 'scale(' + zoom + ')');
            self.$zoomVal.text(Math.round((zoom - 1) * 100) + '%');

            self.camData.zoom = zoom;
        }



        self.prevDiff = curDiff;
        self.prevDiffX = curDiffX;
        self.prevDiffY = curDiffY;
    }
}

$(() => {
    $('.js-camera').each((i, item) => {
        new Camera(item);
    });
});
