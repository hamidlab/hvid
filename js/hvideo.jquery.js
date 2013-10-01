/*
* HTML5 Video Player styling 
* By Hamid Raza
* http://www.hamidraza.com/
*/

(function($) {
    "use strict";
    
    $.fn.hvid = function(options) {
        var opts = $.extend( {}, $.fn.hvid.defaults, options );

        function videoClass(video, hvid, settings){

            var that = this;
            this.defaultVolume = 0.5;
            this.duration = false;
            video.volume = 1;
            this.bufferCompleted = false;


            /* Events */ 

            video.addEventListener('play', function () {
                $('.hvid-control-play', hvid).removeClass('hicon-play').addClass('hicon-pause');
            }, false);

            video.addEventListener('pause', function () {
                $('.hvid-control-play', hvid).addClass('hicon-play').removeClass('hicon-pause');
                if(settings['playing-class']) hvid.removeClass(settings['playing-class']);
            }, false);

            video.addEventListener('volumechange', function () {
                $('.hvid-control-volumebar', hvid).val(video.volume);
                if(video.volume <= 0){
                    $('.hvid-control-volume', hvid).removeClass('hicon-volume').addClass('hicon-volume-mute');
                }else{
                    $('.hvid-control-volume', hvid).addClass('hicon-volume').removeClass('hicon-volume-mute');
                }
            }, false);

            video.addEventListener('playing', function () {
                hvid.addClass('hvid-playing');
                if(settings['playing-class']) hvid.addClass(settings['playing-class']);
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
                    hvid.addClass('hvid-fullscreened');
                    if(settings['fullscreen-class']) hvid.addClass(settings['fullscreen-class']);
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
                    hvid.removeClass('hvid-fullscreened');
                    if(settings['fullscreen-class']) hvid.removeClass(settings['fullscreen-class']);
                    return true;
                }
                return false;
            }

            this.updateBufferBar = function(){
                var buffered = this.getBuffered();
                if(buffered >= 99.99){
                    $('.hvid-buffer', hvid).css({
                        'width': '100%'
                    });
                    this.bufferCompleted = true;
                }else{
                    $('.hvid-buffer', hvid).css({
                        'width': buffered+'%'
                    });
                }
            }

            this.updateProgressBar = function(){
                var completed = this.playedPercentage();
                if(completed >= 99.99){
                    $('.hvid-progress', hvid).css({
                        'width': '100%'
                    });
                }else{
                    $('.hvid-progress', hvid).css({
                        'width': completed+'%'
                    });
                }
            }

            this.updateTime = function(){
                $('.hvid-time', hvid).html('<span>'+this.getCurrentTime()+'</span>/'+this.getTotalTime());
            }
            

        };

        return this.each(function() {

            var that = this;
            var $this = $(this);
            var $thisData = {};

            for(var i in $this.data()){

                var dataAr = i.split(/(?=[A-Z])/).map(function(v){ return v.toLowerCase() });

                if(dataAr.splice(0,1)[0] === 'hvid'){
                    $thisData[dataAr.join('-')] = $this.data(i);
                }

            }
            var settings = $.extend( {}, opts, $thisData );

            $this.removeAttr('controls');
            $this.wrap('<div class="hvid-wrap"></div>');
            var hvid = $this.parent('.hvid-wrap');

            if(settings['wrap-class']) hvid.addClass(settings['wrap-class']);

            hvid.css({
                'position': 'relative',
                'padding-bottom': 52,
                'background': settings['video-background']
            }).append($(settings.playerHTML));

            var video = new videoClass(that, hvid, settings);

            var updateVideo = setInterval(function(){
                video.updateBufferBar();
            }, 500);

            $('.hvid-control-volume', hvid).on('click', function(){
                var _this = $(this);
                if(video.volume() > 0){
                    video.mute();
                }else{
                    video.unMute();
                }
            });

            $('.hvid-control-play', hvid).on('click', function(){
                var _this = $(this);
                if(video.isPalying()) {
                    video.pause();
                } else {
                    video.play();
                    _this.removeClass('hicon-play').addClass('hicon-pause');
                }
            });

            $('.hvid-control-fullscreen', hvid).on('click', function(){
                var _this = $(this);
                if(hvid.hasClass('hvid-fullscreened')){
                    video.exitFullScreen();
                }else{
                    video.fullScreen();
                }
            });

            $('.hvid-control-volumebar', hvid).on('change', function(){
                video.volume($(this).val());
            });

            if(settings['volumebar-class']) {
                $('.hvid-control-volumebar', hvid).addClass(settings['volumebar-class'])
            };



        });

    };
})(jQuery);

$.fn.hvid.defaults = {
    "playerHTML" : "\
        <div class='hvid-controls controls clearfix'>\
            <div class='hvid-slider slider'>\
                <div class='hvid-handle handle'></div>\
                <div class='hvid-progress progress'></div>\
                <div class='hvid-buffer buffer'></div>\
            </div>\
            <a class='hicon-play hovericon f-left hvid-control-play'></a>\
            <a class='hicon-fullscreen hovericon f-right hvid-control-fullscreen'></a>\
            <div class='f-right volume-box'>\
                <input type='range' class='hvid-control-volumebar' value='1' min='0' max='1' step='0.1'>\
                <a class='hicon-volume hovericon hvid-control-volume volume'></a>\
            </div>\
            <div class='f-right hvid-time time'><span>4:15</span>/9:23</div>\
        </div>\
    ",
    'video-background': '#000',
    'wrap-class': false,
    'fullscreen-class': false,
    'playing-class': false,
    'volumebar-class': false
};

