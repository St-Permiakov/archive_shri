import Hls from 'hls.js';

class Cams {
    constructor(el, opts) {
        this.DATA_KEY = 'Cams';

        // опции
        this.$el = $(el);
        this.$el.data(this.DATA_KEY, this);
        this.opts = $.extend({}, this.$el.data(), opts);

        this.$cams = this.$el.find('.js-cam');
        this.camParams = {
            width: null,
            height: null,
            offX: null,
            offY: null
        };

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();

        this.init();
    }

    init() {
        this.$cams.each((i, item) => {
            const video = $(item).find('.js-cam-video')[0];
            const src = $(item).data('src');
            this.initVideo(video, src);
        });

        this.setListeners();
        this.setAnalisers();
    }

    setListeners() {
        this.$el.on('click', '.js-cam', e => {
            const $cam = $(e.currentTarget);
            if (!$cam.hasClass('is-active')) {
                this.openCam($cam);
            }
        });

        $(window).on('click', e => {
            if ($(e.target).closest('.js-cam').length === 0 || $(e.target).hasClass('js-cam-back')) {
                this.closeCam();
            }
        });

        this.$el.on('change', '.js-cam-tuner-brightness, .js-cam-tuner-contrast', e => {
            this.tuneCam($(e.currentTarget).parents('.js-cam'));
        });
    }

    initVideo(video, url) {
        if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                // video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
            video.addEventListener('loadedmetadata', function () {
                // video.play();
            });
        }
    }

    setAnalisers() {
        this.$cams.each((i, cam) => {
            const $cam = $(cam);
            const video = $cam.find('.js-cam-video')[0];
            let vol;

            const analyser = this.context.createAnalyser();
            analyser.smoothingTimeConstant = 0.3;
            analyser.fftSize = 512;

            const node = this.context.createScriptProcessor(2048, 1, 1);

            const source = this.context.createMediaElementSource(video);
            source.connect(analyser);
            analyser.connect(node);
            node.connect(this.context.destination);
            source.connect(this.context.destination);
            const arr = new Uint8Array(analyser.frequencyBinCount);

            node.onaudioprocess = () => {
                analyser.getByteFrequencyData(arr);
                vol = this.countAverageVol(arr);
            }

            this.soundListener = setInterval(() => {
                if (!video.paused && !video.muted) {
                    vol = vol > 10 ? Math.ceil(vol / 10) : 0;

                    $cam.find('.js-cam-sound-meter-segment').each((i, item) => {
                        if (i > vol) {
                            $(item).hide();
                        } else {
                            $(item).show();
                        }
                    })
                }
            }, 100);
        });
    }

    tuneCam($cam) {
        const brightness = parseInt($cam.find('.js-cam-tuner-brightness').val()) + 50;
        const contrast = parseInt($cam.find('.js-cam-tuner-contrast').val()) + 50;

        $cam.find('.js-cam-video').css('filter', 'brightness(' + brightness + '%) contrast(' + contrast + '%)');
    }

    openCam($cam) {
        const $camInner = $cam.find('.js-cam-inner');
        const $video = $cam.find('.js-cam-video');

        $('html, body').addClass('full-screen');

        this.camParams.width = $cam.width();
        this.camParams.height = $cam.height();
        this.camParams.offX = $cam.position().left;
        this.camParams.offY = $cam.position().top - $(window).scrollTop();

        $camInner.css({
            'width': this.camParams.width,
            'height': this.camParams.height,
            'transform': 'translate3d(' + this.camParams.offX + 'px,' + this.camParams.offY + 'px,0)'
        });

        $cam
            .css({
                'width': this.camParams.width,
                'height': this.camParams.height
            })
            .addClass('is-active');

        setTimeout(() => {
            $camInner.css({
                'width': '100%',
                'height': '100%',
                'transform': 'translate3d(0,0,0)'
            });
        }, 100);

        $video.attr('controls', 'controls')[0].play();
    }

    closeCam() {
        const $cam = this.$cams.filter('.is-active');
        if ($cam.length) {
            const $camInner = $cam.find('.js-cam-inner');
            $cam.find('.js-cam-video').removeAttr('controls')[0].pause();

            $camInner.css({
                'width': this.camParams.width,
                'height': this.camParams.height,
                'transform': 'translate3d(' + this.camParams.offX + 'px,' + this.camParams.offY + 'px,0)'
            });

            setTimeout(() => {
                $cam.removeClass('is-active');
                $cam.removeAttr('style');
                $camInner.removeAttr('style');
                $('html, body').removeClass('full-screen');
            }, 250);

            clearInterval(this.soundListener);
        }
    }

    countAverageVol(arr) {
        let values = 0;
        let average;
        let length = arr.length;

        for (var i = 0; i < length; i++) {
            values += arr[i];
        }

        average = Math.round(values / length);
        return average;
    }
}

$(() => {
    $('.js-cams').each((i, item) => {
        new Cams(item);
    });
});