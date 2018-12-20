var simpleBox = (function() {
	//IDs / Classes
	var IDs = {
        MAINAREA      : "simplebox_mainarea",
		MAINAREA_PREV : "simplebox_mainarea_prev",
		MAINAREA_NEXT : "simplebox_mainarea_next",
        BACKGROUND    : "simplebox_background",
        IMAGE         : "simplebox_image",
        FOOTERSHADOW  : "simplebox_footer_shadow",
        FOOTER        : "simplebox_footer",
        SHADOW        : "simplebox_shadow"

	};

    window.onkeydown = function(event) {
        var key = event.keyCode ? event.keyCode : event.which;

        if (key === 37) {        //left arrow
            _prevImageEvent();
        } else if (key === 39) { //right arrow
            _nextImageEvent();
        } else if (key === 27) { //esc
            _closeGallery();
        }
    };


	var simpleBox = {
		init : function({offset} = {}) {
			_offset = offset || 50;

			var all_galleries = document.querySelectorAll("[simpleBox='gallery']");
			var all_galleries_amnt = all_galleries.length;

			for (var i = 0; i < all_galleries_amnt; i++) {
				all_galleries[i].addEventListener('click', _showGallery);

				var gid = all_galleries[i].getAttribute('gid');

				if (_galleries[gid] === undefined)
					_galleries[gid] = [];
				_galleries[gid].push(all_galleries[i].children[0].src);

				all_galleries[i].id = 'img_id_' + (_galleries[gid].length-1).toString();
			}
		}
	};

    var _showGallery = function(event) {
        _current_gid = event.path[1].getAttribute('gid');	//gallery id
        _current_aid = event.path[1].id.substring(7);		//array id
		_openGallery();
	};

    var _openGallery = function() {
        _currently_open = true;

        var src = _galleries[_current_gid][_current_aid];
        _displayFrame(src, _current_gid, _current_aid);

        fade_out_timeout = setTimeout(_hideElements, 2500);

        //TODO display loading gif

        //image stuff
        var image = document.getElementById(IDs.IMAGE);
        image.onload = function() {
            _changeImageMode(image);
            _setNavAreas(image);
        };
    };

    var _closeGallery = function() {
        _currently_open = false;

        document.removeEventListener('mousemove', _mouseMoveEvent);
        document.removeEventListener('click', _clickEvent);

        clearTimeout(fade_out_timeout);

        removeElement(IDs.BACKGROUND);
        document.body.style.overflow = '';
    };

	var _displayFrame = function (path, gid, aid) {

		var nav_prev = aid > 0;
		var nav_next = aid < _galleries[gid].length-1;

		_createBox(nav_prev, nav_next);
		document.body.style.overflow = 'hidden';

		document.getElementById(IDs.IMAGE).src = path;
	};

	var _createBox = function (nav_prev, nav_next) {
        document.addEventListener('mousemove', _mouseMoveEvent);
        document.addEventListener('click', _clickEvent);

		var simplebox_background    = createElement('div', IDs.BACKGROUND, IDs.BACKGROUND, '', document.body);
		var simplebox_footer_shadow = createElement('div', IDs.FOOTERSHADOW, IDs.FOOTERSHADOW, 'display: block;', simplebox_background);
		var simplebox_footer        = createElement('div', IDs.FOOTER, IDs.FOOTER, 'display: block;', simplebox_background);
		var simplebox_image         = createElement('img', IDs.IMAGE, '', '', simplebox_background);


		if (nav_prev) {
            var simplebox_prev = createElement('div', IDs.MAINAREA_PREV, IDs.MAINAREA_PREV, 'display: block;', simplebox_background);
            simplebox_prev.addEventListener('click', _prevImageEvent);
        }
		if (nav_next) {
            var simplebox_next = createElement('div', IDs.MAINAREA_NEXT, IDs.MAINAREA_NEXT, 'display: block;', simplebox_background);
            simplebox_next.addEventListener('click', _nextImageEvent)
        }
	};

    var _changeImageMode = function(image) {
        if (window.innerWidth / window.innerHeight <= image.width / image.height) {
            image.className = 'simplebox_image_landscape';

            image.style['width']       = (window.innerWidth - 2 * _offset) + "px";
            image.style['margin-left'] = _offset + "px";
            image.style['margin-top']  = (window.innerHeight - image.height) / 2 + "px";
        } else {
            image.className = 'simplebox_image_portrait';

            image.style['height']      = (window.innerHeight - 2 * _offset) + "px";
            image.style['margin-top']  = _offset + "px";
            image.style['margin-left'] = (window.innerWidth - image.width) / 2 + "px";
        }
    };

    var _setNavAreas = function(image) {
        var width  = image.width;
        var height = image.height;

        var c_width    = window.innerWidth;

        var this_image = document.getElementById(IDs.IMAGE);

        var prev_area = document.getElementById(IDs.MAINAREA_PREV);
        if (prev_area != undefined) {
            prev_area.style.left   = (c_width - width) / 2 + "px";
            prev_area.style.top    = this_image.style['margin-top'];
            prev_area.style.width  = "200px";
            prev_area.style.height = height + "px";
		}

        var next_area = document.getElementById(IDs.MAINAREA_NEXT);
        if (next_area != undefined) {
            next_area.style.right  = (c_width - width) / 2 + "px";
            next_area.style.top    = this_image.style['margin-top'];
            next_area.style.width  = (width - 200) + "px";
            next_area.style.height = height + "px";
		}


    };

    var _displayElements = function() {
        _fadeIn(IDs.FOOTERSHADOW, 200);
        _fadeIn(IDs.FOOTER, 200);
        _fadeIn(IDs.MAINAREA_NEXT, 200);
        _fadeIn(IDs.MAINAREA_PREV, 200);
    };

    var _hideElements = function() {
        _fadeOut(IDs.FOOTERSHADOW, 400);
        _fadeOut(IDs.FOOTER, 400);
        _fadeOut(IDs.MAINAREA_NEXT, 400);
        _fadeOut(IDs.MAINAREA_PREV, 400);
    };

    var _fadeOut = function(element_id, time_in_ms) {
        var element = document.getElementById(element_id);
        
        if (element == null || element.style.display == 'none')
        	return;

        var op = 1;
        var timestep = 25;
        var step_per_timestep = 1.0 / (time_in_ms / timestep);

        var timer = setInterval(function () {
            if (op <= step_per_timestep){
                clearInterval(timer);
                op = 0.0;
                element.style.display = 'none';
            }
            element.style.opacity = op;
            op -= step_per_timestep;
        }, timestep);
    };

    var _fadeIn = function(element_id, time_in_ms, start_value, end_value) {
        var element = document.getElementById(element_id);
        
        if (element == null || element.style.display == 'block')
        	return;
        
        element.style.display = 'block';

        //if (element.style.opacity === "1.0")
        //    return;
        

        console.log("fade in: " + element.style.opacity);

        var op = 0.0;

        var timestep = 25;
        var step_per_timestep = 1.0 / (time_in_ms / timestep);

        var timer = setInterval(function () {
            if (op >= 1.0 - step_per_timestep){
                clearInterval(timer);
                op = 1.0;
            }
            element.style.opacity = op;
            op += step_per_timestep;
        }, timestep);
    };




	//Eventhandlers
    var _clickEvent = function(event) {
        if (event.target.id === IDs.BACKGROUND)
            _closeGallery();
    };

    var _mouseMoveEvent = function() {
    	console.log("moved mouse");
        _displayElements();
        clearTimeout(fade_out_timeout);
        fade_out_timeout = setTimeout(_hideElements, 2500);
    };

    var _prevImageEvent = function() {
        if (!_currently_open)
            return;

        if (_current_aid <= 0)
            return;

        _closeGallery();
        _current_aid--;
        _openGallery();
    };

    var _nextImageEvent = function() {
        if (!_currently_open)
            return;

        if (_current_aid >= _galleries[_current_gid].length-1)
            return;

    	_closeGallery();
    	_current_aid++;
    	_openGallery();
	};


	var _galleries = {};
    var _offset;

    var _current_gid;
    var _current_aid;
    var _currently_open;


	return simpleBox;
})();












function createElement (_type, _id, _class, _style, _append) {
    var newElement = document.createElement(_type);
    newElement.setAttribute("id", _id);
    newElement.setAttribute("class", _class);
	newElement.setAttribute("style", _style);
    _append.appendChild(newElement);

    return newElement;
};

function removeElement (_id) {
	var element = document.getElementById(_id);
	element.outerHTML = "";
	delete element;
}


var fade_out_timeout;




