$(document).ready(function () {
    function PhotoSwipe() {
        this.id;      //   图片序号
        this.total;      //   图片总数量
        this.loadCount;      //   图片加载数量
        this.imgObj = {      //   图片
            initScale: null,      //   图片比例
            initWidth: null,      //   图片初始宽度
            initHeight: null,      //   图片初始高度
        };
        this.containerObj;      //   容器
        this.status;      //   状态
        this.url;      //   ajax请求Url地址
    }

    //  初始化窗口
    PhotoSwipe.prototype.init = function (obj, e) {
        var html = `
            <div class="ps container"></div>
        `;
        $('body').append(html);

        obj.loadCount = 5;
        obj.total = $('.demo img').length;
        obj.load(obj, e);
    }

    //  加载
    PhotoSwipe.prototype.load = function (obj, e, id) {
        $('body').addClass('hide-overflow');
        $('.ps.loop').remove();
        obj.status = true;
        obj.id = id + 1 ? id : $(e).index();
        //  最小图片序号
        var minIndex = obj.id - parseInt(obj.loadCount / 2) < 0 ? 0 : obj.id - parseInt(obj.loadCount / 2);
        //  最大图片序号
        var maxIndex = obj.id + parseInt(obj.loadCount / 2) > obj.total - 1 ? obj.total - 1 : obj.id + parseInt(obj.loadCount / 2);
        var html = '';
        if (minIndex == 0 && maxIndex - minIndex < obj.loadCount - 1) {
            var leftMargin = (1 - obj.id - parseInt(obj.loadCount / 2)) * 100;
            html += `
                <div class="ps loop" style="margin-left: `+ leftMargin + `%" ondragstart="return false;">
                    <div class="ps mask"> </div>
                </div>
            `;
        }
        for (var i = minIndex; i <= maxIndex; i++) {
            //  位置偏移
            var leftMargin = +(i - obj.id) * 100;
            html += `
                <div class="ps loop" id="photo`+ i + `" style="margin-left: ` + leftMargin + `%" ondragstart="return false;">
                    <div class="ps mask"> </div>
                    <div class="ps content">
                        <div class="ps img-container">
                            <img src=`+ $('.demo img')[i].src + `>
                        </div>
                    </div>
                </div>
            `;
        }
        $('.ps.container').append(html);

        if (maxIndex == obj.loadCount - 1 && maxIndex - minIndex < obj.loadCount - 1) {
            var pictureId = obj.id + 1; 
            $.ajax({
                url: obj.url,
                data: { picture: pictureId },
                dataType: 'json',
                success: function (data) {
                    //  位置偏移
                    var leftMargin = (obj.loadCount - obj.id) * 100;
                    var html = '';
                    if(obj.id == maxIndex) {
                        html += `
                            <div class="ps loop" id="photo`+ i + `" style="margin-left: ` + leftMargin + `%" ondragstart="return false;">
                                <div class="ps mask"> </div>
                                <div class="ps content">
                                    <div class="ps img-container">
                                        <img src=`+ data.url + `>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    else {
                        html += `
                            <div class="ps loop" style="margin-left: `+ leftMargin + `%" ondragstart="return false;">
                                <div class="ps mask"> </div>
                            </div>
                        `;
                    }
                    $('.ps.container').append(html);
                },
                error: function (error) {
                    //  位置偏移
                    var leftMargin = (obj.loadCount - obj.id) * 100;
                    var html = `
                        <div class="ps loop" style="margin-left: `+ leftMargin + `%" ondragstart="return false;">
                            <div class="ps mask"> </div>
                        </div>
                    `;
                    $('.ps.container').append(html);
                }
            });
        }
        

        for (var i = minIndex; i <= maxIndex; i++) {
            var tempWidth = $('#photo' + i + ' img').width();
            var tempHieght = $('#photo' + i + ' img').height();
            while (tempWidth >= 0.6 * $(window).width() || tempHieght >= 0.6 * $(window).height()) {
                tempWidth *= 0.8;
                tempHieght *= 0.8;
            }
            $('#photo' + i + ' img').css('width', tempWidth + 'px');
            $('#photo' + i + ' img').css('height', tempHieght + 'px');
        }

        obj.imgObj = $('#photo' + obj.id + ' img');
        obj.containerObj = $('.ps.container');
        obj.imgObj.initWidth = obj.imgObj.width();
        obj.imgObj.initHeight = obj.imgObj.height();
        obj.imgObj.initScale = obj.imgObj.initWidth / obj.imgObj.initHeight;

        var mc = new Hammer(document.getElementById('photo' + obj.id));

        mc.on('panleft', function (ev) {
            if (obj.status) {
                obj.leftPan(obj, ev);
            }
        });

        mc.on('panright', function (ev) {
            if (obj.status) {
                obj.rightPan(obj, ev);
            }
        });

        mc.on('panend', function (ev) {
            if (obj.status) {
                obj.endPan(obj, ev);
            }
        });

        mc.on('doubletap', function () {
            obj.dblclick(obj);
            obj.status = true;
        });

        mc.get('pinch').set({ enable: true });
        mc.on('pinchstart', function (ev) {
            $('body').addClass('auto-overflow');
            $('.ps.container').addClass('auto-overflow');
            $('.ps.content').addClass('auto-overflow');
            $('.ps.loop').hide();
            $('#photo' + obj.id).show();
            obj.status = false;
        });
        mc.on('pinchin', function (ev) {
            obj.inPinch(obj, ev);
        });

        mc.on('pinchout', function (ev) {
            obj.outPinch(obj, ev);
        });

        var mcUp = new Hammer(document.getElementById('photo' + obj.id));
        mcUp.add(new Hammer.Swipe());
        mcUp.on('swipeup', function () {
            if (obj.status) {
                obj.close(obj);
            }
        });

        var mcDown = new Hammer(document.getElementById('photo' + obj.id));
        mcDown.add(new Hammer.Swipe());
        mcDown.on('swipedown', function () {
            if (obj.status) {
                obj.close(obj);
            }
        });

        $('.ps.mask').on('dblclick', function () {
            if (obj.status) {
                obj.close(obj);
            }
        });
    }

    //  向左移动窗口
    PhotoSwipe.prototype.leftPan = function (obj, ev) {
        obj.containerObj.css('left', ev.deltaX);
    }

    //  向右移动窗口
    PhotoSwipe.prototype.rightPan = function (obj, ev) {
        obj.containerObj.css('left', ev.deltaX);
    }

    //  停止移动窗口
    PhotoSwipe.prototype.endPan = function (obj, ev) {
        if (Math.abs(ev.deltaX) / $(window).width() < 0.5) {
            obj.containerObj.animate({
                left: 0
            });
        }
        else if (Math.abs(ev.deltaX) / $(window).width() >= 0.5) {
            if (obj.id == 0 && ev.deltaX > 0) {
                obj.containerObj.animate({
                    left: 0
                });
            }
            else if (obj.id == obj.total - 1 && ev.deltaX < 0) {
                obj.containerObj.animate({
                    left: 0
                });
            }
            else if (ev.deltaX < 0) {
                obj.containerObj.animate({
                    left: '-100%'
                }, function () {
                    photoswipe.load(obj, this, obj.id + 1);
                    obj.containerObj.css('left', 0);
                    return false;
                });
            }
            else {
                obj.containerObj.animate({
                    left: '100%'
                }, function () {
                    photoswipe.load(obj, this, obj.id - 1);
                    obj.containerObj.css('left', 0);
                    return false;
                });
            }
        }
    }

    //  双击图片
    PhotoSwipe.prototype.dblclick = function (obj) {
        $('.ps.container').removeClass('auto-overflow');
        $('.ps.content').removeClass('auto-overflow');
        $('.ps.loop').show();
        var width = obj.imgObj.width();
        var height = obj.imgObj.height();
        if (width != obj.imgObj.initWidth && height != obj.imgObj.initHeight) {
            obj.imgObj.css('width', obj.imgObj.initWidth + 'px');
            obj.imgObj.css('height', obj.imgObj.initHeight + 'px');
        }
        else {
            obj.imgObj.css('width', obj.imgObj.initWidth * 1.5 + 'px');
            obj.imgObj.css('height', obj.imgObj.initHeight * 1.5 + 'px');
        }
        obj.adjust(obj);
    }

    //  缩小图片
    PhotoSwipe.prototype.inPinch = function (obj, ev) {
        if (obj.imgObj.width() < obj.imgObj.initWidth * 0.8 || obj.imgObj.height() < obj.imgObj.initHeight * 0.8) {
            return false;
        }
        if (ev.scale >= obj.imgObj.initScale) {
            obj.imgObj.css('width', obj.imgObj.width() - Math.abs(ev.deltaX));
            obj.imgObj.css('height', obj.imgObj.width() / obj.imgObj.initScale);
        }
        else {
            obj.imgObj.css('height', obj.imgObj.height() - Math.abs(ev.deltaY));
            obj.imgObj.css('width', obj.imgObj.height() * obj.imgObj.initScale);
        }
        obj.adjust(obj);
    }

    //  放大图片
    PhotoSwipe.prototype.outPinch = function (obj, ev) {
        if (obj.imgObj.width() > $(window).width() * 2 || obj.imgObj.height() > $(window).height() * 2) {
            return false;
        }
        if (ev.scale >= obj.imgObj.initScale) {
            obj.imgObj.css('width', obj.imgObj.width() + Math.abs(ev.deltaX / 2));
            obj.imgObj.css('height', obj.imgObj.width() / obj.imgObj.initScale);
        }
        else {
            obj.imgObj.css('height', obj.imgObj.height() + Math.abs(ev.deltaY / 2));
            obj.imgObj.css('width', obj.imgObj.height() * obj.imgObj.initScale);
        }
        obj.adjust(obj);
    }

    //  关闭窗口
    PhotoSwipe.prototype.close = function () {
        $('.ps.container').remove();
        $('body').addClass('hide-overflow');
    }

    //  调整窗口
    PhotoSwipe.prototype.adjust = function (obj) {
        if (obj.imgObj.width() <= $(window).width()) {
            $('#photo' + obj.id + ' .mask').css('width', '100%');
        }
        if (obj.imgObj.height() <= $(window).height()) {
            $('#photo' + obj.id).css('margin-top', 0);
        }
        if (obj.imgObj.width() > $(window).width()) {
            $('#photo' + obj.id + ' .mask').css('width', obj.imgObj.width());
        }
        if (obj.imgObj.height() > $(window).height()) {
            $('#photo' + obj.id).css('margin-top', (obj.imgObj.height() - $(window).height()) / 2);
        }
    }

    var photoswipe = new PhotoSwipe();
    photoswipe.url = 'http://oetpfe8ma.bkt.clouddn.com';
    $('.demo img').on('click', function () {
        photoswipe.init(photoswipe, this);
    });

})