/*
* HTML5 Video Player styling 
* By Hamid Raza
* http://www.hamidraza.com/
*/

(function($) {
    "use strict";
    
    $.fn.hvideo = function(options) {
        var opts = $.extend( {}, $.fn.hvideo.defaults, options );

        function videoClass(video, hVideo, settings){

            var that = this;
            this.defaultVolume = 0.5;
            this.duration = false;
            video.volume = 1;
            this.bufferCompleted = false;


            /* Events */ 

            video.addEventListener('play', function () {
                $('.hvideo-control-play', hVideo).removeClass('hicon-play').addClass('hicon-pause');
            }, false);

            video.addEventListener('pause', function () {
                $('.hvideo-control-play', hVideo).addClass('hicon-play').removeClass('hicon-pause');
                if(settings['playing-class']) hVideo.removeClass(settings['playing-class']);
            }, false);

            video.addEventListener('volumechange', function () {
                $('.hvideo-control-volumebar', hVideo).val(video.volume);
                if(video.volume <= 0){
                    $('.hvideo-control-volume', hVideo).removeClass('hicon-volume').addClass('hicon-volume-mute');
                }else{
                    $('.hvideo-control-volume', hVideo).addClass('hicon-volume').removeClass('hicon-volume-mute');
                }
            }, false);

            video.addEventListener('playing', function () {
                hVideo.addClass('hvideo-playing');
                if(settings['playing-class']) hVideo.addClass(settings['playing-class']);
            }, false);

            video.addEventListener('timeupdate', function () {
                that.updateTime();
                that.updateProgressBar();
            }, false);


            this.volume = function(vol){
                if(vol === '0' || vol > 0){
                    console.log(vol);
                    vol = parseFloat(vol);
                    if(vol > 1) {
                        vol = 1;
                    }else if(vol < 0) {
                        vol = 0
                    }
                    video.volume = vol;
                    return vol;
                }
                return video.volume;
            }

            this.play = function(){
                video.play();
            }

            this.pause = function(){
                video.pause(); 
            }

            this.reset = function(){
                video.load();
            }

            this.changeVolume = function(vol){
            }

            this.getBuffered = function(){
                if(!video.duration) return 0;
                return (100 * video.buffered.end(0) / video.duration);
            }

            this.playedPercentage = function(){
                if(!video.duration) return 0;
                return (100 * video.currentTime / video.duration);
            }

            this.getDuration = function(){
                return video.duration;
            }

            this.getCurrentTime = function(){
                var time = video.currentTime;
                if(!time || time <= 0) return '0:00';
                var minutes = Math.floor(time / 60);
                //if(minutes<10) minutes = '0'+minutes;
                var seconds = Math.round(time - minutes * 60);
                if(seconds<10) seconds = '0'+seconds;
                return minutes+':'+seconds;
            }

            this.getTotalTime = function(){
                var time = video.duration;
                if(!time || time <= 0) return '0:00';
                var minutes = Math.floor(time / 60);
                //if(minutes<10) minutes = '0'+minutes;
                var seconds = Math.round(time - minutes * 60);
                if(seconds<10) seconds = '0'+seconds;
                return minutes+':'+seconds;
            }

            this.isPalying = function(){
                return !video.paused;
            }

            this.mute = function(){
                this.lastVolume = video.volume;
                video.volume = 0;
                return 0;
            }

            this.unMute = function(){
                return video.volume = (this.lastVolume || this.defaultVolume);
            }

            this.fullScreen = function(){
                var error = false;
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.mozRequestFullScreen) {
                    video.mozRequestFullScreen();
                } else if (video.webkitRequestFullscreen) {
                    video.webkitRequestFullscreen();
                }else{
                    error = true;
                }
                if(!error){
                    hVideo.addClass('hvideo-fullscreened');
                    if(settings['fullscreen-class']) hVideo.addClass(settings['fullscreen-class']);
                    return true;
                }
                return false;
            }

            this.exitFullScreen = function(){
                var error = false;
                if(document.cancelFullScreen) {
                    document.cancelFullScreen();
                } 
                else if(document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } 
                else if(document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }else{
                    error = true;
                }
                if(!error){
                    hVideo.removeClass('hvideo-fullscreened');
                    if(settings['fullscreen-class']) hVideo.removeClass(settings['fullscreen-class']);
                    return true;
                }
                return false;
            }

            this.updateBufferBar = function(){
                var buffered = this.getBuffered();
                if(buffered >= 99.99){
                    $('.hvideo-buffer', hVideo).css({
                        'width': '100%'
                    });
                    this.bufferCompleted = true;
                }else{
                    $('.hvideo-buffer', hVideo).css({
                        'width': buffered+'%'
                    });
                }
            }

            this.updateProgressBar = function(){
                var completed = this.playedPercentage();
                if(completed >= 99.99){
                    $('.hvideo-progress', hVideo).css({
                        'width': '100%'
                    });
                }else{
                    $('.hvideo-progress', hVideo).css({
                        'width': completed+'%'
                    });
                }
            }

            this.updateTime = function(){
                $('.hvideo-time', hVideo).html('<span>'+this.getCurrentTime()+'</span>/'+this.getTotalTime());
            }
            

        };

        return this.each(function() {

            var that = this;
            var $this = $(this);
            var $thisData = {};

            for(var i in $this.data()){

                var dataAr = i.split(/(?=[A-Z])/).map(function(v){ return v.toLowerCase() });

                if(dataAr.splice(0,1)[0] === 'hvideo'){
                    $thisData[dataAr.join('-')] = $this.data(i);
                }

            }
            var settings = $.extend( {}, opts, $thisData );

            $this.removeAttr('controls');
            $this.wrap('<div class="hvideo-wrap"></div>');
            var hVideo = $this.parent('.hvideo-wrap');

            if(settings['wrap-class']) hVideo.addClass(settings['wrap-class']);

            hVideo.css({
                'position': 'relative',
                'padding-bottom': 52,
                'background': settings['video-background']
            }).append($(settings.playerHTML));

            var video = new videoClass(that, hVideo, settings);

            var updateVideo = setInterval(function(){
                video.updateBufferBar();
            }, 500);

            $('.hvideo-control-volume', hVideo).on('click', function(){
                var _this = $(this);
                if(video.volume() > 0){
                    video.mute();
                }else{
                    video.unMute();
                }
            });

            $('.hvideo-control-play', hVideo).on('click', function(){
                var _this = $(this);
                if(video.isPalying()) {
                    video.pause();
                } else {
                    video.play();
                    _this.removeClass('hicon-play').addClass('hicon-pause');
                }
            });

            $('.hvideo-control-fullscreen', hVideo).on('click', function(){
                var _this = $(this);
                if(hVideo.hasClass('hvideo-fullscreened')){
                    video.exitFullScreen();
                }else{
                    video.fullScreen();
                }
            });

            $('.hvideo-control-volumebar', hVideo).on('change', function(){
                video.volume($(this).val());
            });

            if(settings['volumebar-class']) {
                $('.hvideo-control-volumebar', hVideo).addClass(settings['volumebar-class'])
            };



        });

    };
})(jQuery);

$.fn.hvideo.defaults = {
    "playerHTML" : "\
        <div class='hvideo-controls controls clearfix'>\
            <div class='hvideo-slider slider'>\
                <div class='hvideo-handle handle'></div>\
                <div class='hvideo-progress progress'></div>\
                <div class='hvideo-buffer buffer'></div>\
            </div>\
            <a class='hicon-play hovericon f-left hvideo-control-play'></a>\
            <a class='hicon-fullscreen hovericon f-right hvideo-control-fullscreen'></a>\
            <div class='f-right volume-box'>\
                <input type='range' class='hvideo-control-volumebar' value='1' min='0' max='1' step='0.1'>\
                <a class='hicon-volume hovericon hvideo-control-volume volume'></a>\
            </div>\
            <div class='f-right hvideo-time time'><span>4:15</span>/9:23</div>\
        </div>\
    ",
    'video-background': '#000',
    'wrap-class': false,
    'fullscreen-class': false,
    'playing-class': false,
    'volumebar-class': false
};

