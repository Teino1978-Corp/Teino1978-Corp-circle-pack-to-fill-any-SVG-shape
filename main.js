var _canvasProps = {width: 300, height: 300};
var _options = {spacing: 1, numCircles: 1000, minSize: 1, maxSize: 10, higherAccuracy: false};
var _placedCirclesArr = [];

var _isFilled = function (imgData, imageWidth, x, y) {
    x = Math.round(x);
    y = Math.round(y);
    var a = imgData.data[((imageWidth * y) + x) * 4 + 3];
    return a > 0;
};

var _isCircleInside = function (imgData, imageWidth, x, y, r) {
    //if (!_isFilled(imgData, imageWidth, x, y)) return false;
    //--use 4 points around circle as good enough approximation
    if (!_isFilled(imgData, imageWidth, x, y - r)) return false;
    if (!_isFilled(imgData, imageWidth, x, y + r)) return false;
    if (!_isFilled(imgData, imageWidth, x + r, y)) return false;
    if (!_isFilled(imgData, imageWidth, x - r, y)) return false;
    if (_options.higherAccuracy) {
        //--use another 4 points between the others as better approximation
        var o = Math.cos(Math.PI / 4);
        if (!_isFilled(imgData, imageWidth, x + o, y + o)) return false;
        if (!_isFilled(imgData, imageWidth, x - o, y + o)) return false;
        if (!_isFilled(imgData, imageWidth, x - o, y - o)) return false;
        if (!_isFilled(imgData, imageWidth, x + o, y - o)) return false;
    }
    return true;
};

var _touchesPlacedCircle = function (x, y, r) {
    return _placedCirclesArr.some(function (circle) {
        return _dist(x, y, circle.x, circle.y) < circle.size + r + _options.spacing;//return true immediately if any match
    });
};

var _dist = function (x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a * a + b * b);
};

var _placeCircles = function (imgData) {
    var i = _circles.length;
    _placedCirclesArr = [];
    while (i > 0) {
        i--;
        var circle = _circles[i];
        var safety = 1000;
        while (!circle.x && safety-- > 0) {
            var x = Math.random() * _canvasProps.width;
            var y = Math.random() * _canvasProps.height;
            if (_isCircleInside(imgData, _canvasProps.width, x, y, circle.size)) {
                if (!_touchesPlacedCircle(x, y, circle.size)) {
                    circle.x = x;
                    circle.y = y;
                    _placedCirclesArr.push(circle);
                }
            }
        }
    }
};

var _makeCircles = function () {
    var circles = [];
    for (var i = 0; i < _options.numCircles; i++) {
        var circle = {
            color: _colors[Math.round(Math.random() * _colors.length)],
            size: _options.minSize + Math.random() * Math.random() * (_options.maxSize - _options.minSize) //do random twice to prefer more smaller ones
        };
        circles.push(circle);
    }
    circles.sort(function (a, b) {
        return a.size - b.size;
    });
    return circles;
};

var _drawCircles = function (ctx) {
    ctx.save();
    $.each(_circles, function (i, circle) {
        ctx.fillStyle = circle.color;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill()
    });

    ctx.restore();
};

var _drawSvg = function (ctx, path, callback) {
    var img = new Image(ctx);
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        callback();
    };
    img.src = path;
};

var _colors = ['#993300', '#a5c916', '#00AA66', '#FF9900'];
var _circles = _makeCircles();

$(document).ready(function () {
    var $canvas = $('<canvas>').attr(_canvasProps).appendTo('body');
    var $canvas2 = $('<canvas>').attr(_canvasProps).appendTo('body');
    var ctx = $canvas[0].getContext('2d');
    _drawSvg(ctx, 'data/note.svg', function() {
        var imgData = ctx.getImageData(0, 0, _canvasProps.width, _canvasProps.height);
        _placeCircles(imgData);
        _drawCircles($canvas2[0].getContext('2d'));
    });

});