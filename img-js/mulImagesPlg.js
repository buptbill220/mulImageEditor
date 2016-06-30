/*
author: fangming.fm
date:   27/6/2016
   */
(function($) {
 $.fn.fmImagePlugin = function(options){
    var defaults = {
        // 初始化层次相对距离
        layerRelX:  24,
        layerRelY:  24,
        // 子图层透明度
        opacity:    0.8,
        // 标准部件中心坐标点，以及定位方式
        center_pos: {
            back:   {x: 320, y: 568, l: 0},
            eye:    {x: 320, y: 515, l: 1},
            nose:   {x: 320, y: 594, l: 3},
            mouth:  {x: 320, y: 650, l: 2},
            jaw:    {x: 320, y: 730, l: 27}
        },
        // 标准背景图宽高
        back_size: {w: 640, h: 1136}
    };
    var opts = $.extend(defaults, options);
    var _this = this, __this = $(this);
    var images = new Array();
    
    _this.top = 0, _this.left = 0, _this.layer = 1;
    _this.rzRate = {x: __this.width() / opts['back_size']['w'], y: __this.height() / opts['back_size']['h'] };
    
    $(this).children('img').each(function() {
        var data = $(this).attr('fmplgdata');
        var img = new Image(data, _this, $(this));
        img.setCss({top: _this.top + 'px', left: _this.left + 'px'});
        img.setLayer(_this.layer);
        img.init();
        images.push(img);
        _this.top += opts['layerRelX'];
        _this.left += opts['layerRelY'];
        ++_this.layer;
        })

    //设置默认参数
    this.setOption = function(opt) {
        opts = $.extend(opts, opt);
        _this.rzRate = {x: __this.width() / opts['back_size']['w'], y: __this.height() / opts['back_size']['h'] };
    }
    //每当选择一个子图层，会更新所有子图层
    this.updateLayer = function(child) {
        for (var i = 0; i < images.length; ++i) {
            if (child == images[i]) {
                child.setLayer(_this.layer - 1);
            } else if (images[i].getLayer() == _this.layer - 1) {
                var l = images[i].getLayer() - 1;
                l = (l < 1) ? 1 : l;
                images[i].setLayer(l);
            }
        }
    }
    // imgHtml = '<img fmplgdata=\'{"id": "1", "name": "F_brow". "type": "jaw"}\' src="{{ static_url("js/img-js/image/F_brow_000.png") }}" />'
    this.appendImage = function(imgHtml, rep) {
        __this.append(imgHtml);
        var last = __this.children('img:last');
        var data = last.attr('fmplgdata');
        var id = '';
        var replace = rep;
        if (arguments.length <= 1) {
            replace = false;
        }
        if (data != '' && data != null && data != undefined) {
            var dt = JSON.parse(data);
            id = dt['id'];
        }
        var idx = this.findImage(id);
        var size = null;
        if (-1 != idx) {
            if (replace) {
                size = images[idx].getPosFormat();
                console.log(size);
                this.deleteImage(id);
            } else {
                __this.remove('img:last');
                last.remove();
            }
        }
        if (-1 == idx || replace) {
            var img = new Image(data, _this, last);
            if (size != null) {
                img.setCss({top: size['top'] + 'px', left: size['left'] + 'px', width: size['width'] + 'px', height: size['height'] + 'px'});
            } else {
                img.setCss({top: _this.top + 'px', left: _this.left + 'px'});
                _this.top += opts['layerRelX'];
                _this.left += opts['layerRelY'];
            }
            img.setLayer(_this.layer);
            img.init();
            images.push(img);
            ++_this.layer;
        }
    }
    //按照元素data域的id删除子图层
    this.deleteImage = function(id) {
        var idx = this.findImage(id);
        if (-1 != idx) {
            images.splice(idx, 1);
            var imgeq = 'img:eq(' + idx + ')';
            var img = __this.children(imgeq);
            __this.remove(imgeq);
            img.remove();
        }
        return idx;
    }
    //按照元素data域id查找子图层
    this.findImage = function(id) {
        var idx = -1;
        for (var i = 0; i < images.length; ++i) {
            if (images[i].id == id) {
                idx = i;
                break;
            }
        }
        return idx;
    }
    // 获取父图层尺寸
    this.getSize = function() {
        return {width: __this.width(), height: __this.height()};
    }
    //获取图层位置信息
    this.getImagesPosFormat = function(id) {
        var format = {};
        var imgid = null;
        if (arguments.length == 0 || id == "") {
            imgid = null;
        } else {
            imgid = id;
        }
        // format['background'] = this.getSize();
        function formatImage(img, type) {
            var rect = [
                        // 左上，右上，左下，右下
                        {x: img['left'], y: img['top']},
                        {x: img['left'] + img['width'], y: img['top']},
                        {x: img['left'], y: img['top'] + img['height']},
                        {x: img['left'] + img['width'], y: img['top'] + img['height']}
                       ];
            var center = opts['center_pos'][type];
            for (var i = 0; i < rect.length; ++i) {
                rect[i]['x'] = (_this.rzRate['x'] * rect[i]['x'] - center['x']).toFixed(4);
                rect[i]['y'] = (_this.rzRate['y'] * rect[i]['y'] - center['y']).toFixed(4);
            }
            return {location: center['l'], rect: rect};
        }
        for (var i = 0; i < images.length; ++i) {
            if (imgid != null && imgid == images[i].id) {
                format[images[i].name] = formatImage(images[i].getPosFormat(), images[i].type);
                continue;
            }
            format[images[i].name] = formatImage(images[i].getPosFormat(), images[i].type);
        }
        //return JSON.stringify(format);
        return format;
    }
    return this;


    // 子图层对象实现
    function Image(data, parent, obj) {
        var _this = this;
        if (data != "" || data != null || data != undefined) {
            var dt = JSON.parse(data);
            _this.id = dt['id'];
            _this.name = dt['name'];
            _this.type = dt['type'];
        } else {
            _this.id = '';
            _this.name = '';
            _this.type = '';
        }
        _this.parent = parent;
        // 缩放边缘鼠标宽高偏差
        _this.cursorRect = { w: 16, h: 16 };
        _this.isDown = false;
        // 鼠标按键前的位置
        _this.prePos = { x: 0, y: 0 };
        _this.curPos = { x: 0, y: 0 };
        // 缩放方向
        // 0不缩放，1向东，2向南，4向西，8向北；组合方向相互叠加
        _this.direction = 0;
        // 是否拖动，true表示拖动，false表示缩放
        _this.isDrag = true;
        _this.obj = obj;
        _this.absTop = function() { return _this.obj.offset().top; }
        _this.absLeft = function () { return _this.obj.offset().left; }
        _this.relTop = function() { return _this.obj.position().top; }
        _this.relLeft = function() { return _this.obj.position().left; }
        _this.width = function() { return _this.obj.width(); }
        _this.height = function() { return _this.obj.height(); }
        _this.setCss = function(json) { _this.obj.css(json); }

        _this.getPosFormat = function() {
            return {top: _this.relTop(), left: _this.relLeft(), width: _this.width(), height: _this.height()};
        }

        _this.updateCursorRect = function() {
            var minw = parseInt(_this.width() / 4 + 4);
            minw = (minw > 16) ? 16 : minw;
            var minh = parseInt(_this.height() / 4 + 4);
            minh = (minh > 16) ? 16 : minh;
            if (_this.cursorRect['w'] > minw) {
                _this.cursorRect['w'] = minw;
            }
            if (_this.cursorRect['h'] > minh) {
                _this.cursorRect['h'] = minh;
            }
        }
        _this.init = function() {
            _this.obj.bind('mousemove', _this.mousemove);
            _this.obj.bind('mousedown', _this.mousedown);
            _this.obj.bind('mouseup', _this.mouseup);
            _this.obj.bind('mouseleave', _this.mouseleave);
        }
        _this.mousemove = function(e) {
            var ev = e || window.event;
            _this.curPos['x'] = ev.pageX;
            _this.curPos['y'] = ev.pageY;
            var top = _this.absTop(), left = _this.absLeft();
            var right = left + _this.width(), bottom = top + _this.height();
            if (_this.direction != 0) {
                _this.isDrag = false;
            } else {
                _this.isDrag = true;
            }

            if (_this.isDown) {
                var csstop = _this.relTop(), cssleft = _this.relLeft();
                var relx = _this.curPos['x'] - _this.prePos['x'], rely = _this.curPos['y'] - _this.prePos['y'];
                var ncsstop = csstop + rely;
                var ncssleft = cssleft + relx;
                if (_this.isDrag) {
                    _this.obj.css({top: ncsstop + 'px', left: ncssleft + 'px'});
                } else {
                    var nwidth = _this.width() + relx;
                    var nheight = _this.height() + rely;
                    nwidth = (nwidth <= 20) ? 20 : nwidth;
                    nheight = (nheight <= 20) ? 20 : nheight;
                    if (_this.direction & 1) {
                        //_this.obj.css('right', cssright + 'px');
                        _this.obj.css('left', cssleft + 'px');
                        _this.obj.width(nwidth);
                        _this.obj.height(_this.height());
                        if (_this.direction & 8) {
                            _this.obj.attr('class', 'ner');
                        } else if (_this.direction & 2) {
                            _this.obj.attr('class', 'ser');
                        } else {
                            _this.obj.attr('class', 'er');
                        }
                    }
                    if (_this.direction & 2) {
                        //_this.obj.css('bottom', cssbottom + 'px');
                        _this.obj.css('top', csstop + 'px');
                        _this.obj.height(nheight);
                        _this.obj.width(_this.width());
                        if (_this.direction & 4) {
                            _this.obj.attr('class', 'swr');
                        } else if (!(_this.direction & 1)) {
                            _this.obj.attr('class', 'sr');
                        }
                    }
                    if (_this.direction & 4) {
                        _this.obj.css('left', ncssleft + 'px');
                        nwidth = _this.width() - relx;
                        _this.obj.width(nwidth);
                        _this.obj.height(_this.height());
                        if (_this.direction & 8) {
                            _this.obj.attr('class', 'nwr');
                        } else if (!(_this.direction & 2)) {
                            _this.obj.attr('class', 'wr');
                        }
                    }
                    if(_this.direction & 8) {
                        _this.obj.css('top', ncsstop + 'px');
                        nheight = _this.height() - rely;
                        _this.obj.height(nheight);
                        _this.obj.width(_this.width());
                        if (!(_this.direction & 4) && !(_this.direction & 1)) {
                            _this.obj.attr('class', 'nr');
                        }
                    }
                }
            }
            // 对象不能直接赋值，否则指向同一块内存
            _this.prePos['x'] = _this.curPos['x'];
            _this.prePos['y'] = _this.curPos['y']; 
            ev.preventDefault();
        }
        _this.mousedown = function(e) {
            var ev = e || window.event;
            _this.isDown = true;
            _this.isDrag = true;
            _this.prePos['x'] = e.pageX;
            _this.prePos['y'] = e.pageY;
            _this.curPos['x'] = e.pageX;
            _this.curPos['y'] = e.pageY;
            _this.obj.attr('class', 'active');
            _this.updateCursorRect();
            var top = _this.absTop(), left = _this.absLeft();
            var right = left + _this.width(), bottom = top + _this.height();
            // 判断鼠标在哪个方向边界内
            if (_this.direction == 0 && _this.isDrag == true) {
                if (ev.pageY >= top && ev.pageY - top <= _this.cursorRect['h']) {
                    _this.direction |= 8;
                }
                if (ev.pageX >= left && ev.pageX - left <= _this.cursorRect['w']) {
                    _this.direction |= 4;
                }
                if (right >= ev.pageX && right - ev.pageX <= _this.cursorRect['w']) {
                    _this.direction |= 1;
                }
                if (bottom >=ev.pageY && bottom - ev.pageY <= _this.cursorRect['h']) {
                    _this.direction |= 2;
                }
            }
            _this.parent.updateLayer(_this);
            ev.preventDefault();
        }
        _this.mouseup = function(e) {
            _this.clear();
        }
        _this.mouseleave = function(e) {
            if (!_this.isDown) {
                _this.mousemove(e);
                //_this.clear();
            } else {
                _this.clear();
            }
        }
        _this.clear = function() {
            _this.isDown = false;
            _this.direction = 0;
            _this.isFrag = true;
            _this.prePos = { x: 0, y: 0 }; 
            _this.curPos = { x: 0, y: 0 };
            _this.obj.attr('class', '');
        }
        _this.setLayer = function(l) { _this.obj.css('z-index', l); }
        _this.getLayer = function() { return parseInt(_this.obj.css('z-index')); }
    }

 }
})(jQuery);
