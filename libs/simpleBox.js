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


	var simpleBox = {
		init : function() {
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

			console.log(_galleries);



		}


	};

    var _showGallery = function(event) {
		var gid = event.path[1].getAttribute('gid');	//gallery id
		var aid = event.path[1].id.substring(7);		//array id
		var src = _galleries[gid][aid];

		_displayFrame(src, gid, aid);


		document.addEventListener('mousemove', mouseMoveEvent);
		document.addEventListener('click', clickEvent);
		fade_out_timeout = setTimeout(hideElements, 2500);

		setMainArea();

		//image stuff
		var image = document.getElementById(IDs.IMAGE);
		image.onload = function() {
			changeImageMode(image);
			setNavAreas(image);
		};
	};

    var _closeGallery = function() {
        document.removeEventListener('mousemove', mouseMoveEvent);
        document.removeEventListener('click', clickEvent);

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
		var simplebox_background    = createElement('div', IDs.BACKGROUND, IDs.BACKGROUND, '', document.body);
		var simplebox_footer_shadow = createElement('div', IDs.FOOTERSHADOW, IDs.FOOTERSHADOW, '', simplebox_background);
		var simplebox_footer        = createElement('div', IDS.FOOTER, IDS.FOOTER, '', simplebox_background);
		var simplebox_image         = createElement('img', IDs.IMAGE, '', '', simplebox_background);

		if (nav_prev)
			var simplebox_prev      = createElement('div', IDs.MAINAREA_PREV, IDs.MAINAREA_PREV, '', simplebox_background);
		if (nav_next)
			var simplebox_next      = createElement('div', IDs.MAINAREA_NEXT, IDs.MAINAREA_NEXT, '', simplebox_background);
	};


	//Eventhandlers
    var _clickEvent = function(event) {
        if (event.target.id === IDs.BACKGROUND)
            closeGallery();
    };


	var _galleries = {};


	return simpleBox;
})();








var setMainArea = function() {
	var offset = 50;
	//TODO ohne mainarea, einfach windowsize - 2*offset
};

var changeImageMode = function(image) {
	var image_area = document.getElementById('simplebox_mainarea');

	if (image_area.clientWidth / image_area.clientHeight <= image.width / image.height) {
		image.className = 'simplebox_image_landscape';
		image.style['margin-top'] = (image_area.clientHeight - image.height) / 2 + "px";
	} else {
		image.className = 'simplebox_image_portrait';
		image.style['margin-left'] = (image_area.clientWidth - image.width) / 2 + "px";
	}
};

var setNavAreas = function(image) {
		var width  = image.width;
		var height = image.height;

		var image_area = document.getElementById('simplebox_mainarea');
		var c_width    = image_area.clientWidth;
		var c_height   = image_area.clientHeight;

		var prev_area = document.getElementById('simplebox_mainarea_prev');
		var next_area = document.getElementById('simplebox_mainarea_next');

		var main_top  = document.getElementById('simplebox_mainarea').style.top;

		console.log(height);
		console.log(c_height);

		prev_area.style.left   = (c_width - width) / 2 + "px";
		prev_area.style.top    = (c_height - height) / 2 + main_top + "px";
		prev_area.style.width  = "250px";
		prev_area.style.height = height + "px";
};

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

var mouseMoveEvent = function() {
	displayElements();
	clearTimeout(fade_out_timeout);
	fade_out_timeout = setTimeout(hideElements, 2500);
};

var displayElements = function() {
	fadeIn('simplebox_footer_shadow', 200);
	fadeIn('simplebox_footer', 200);
};

var hideElements = function() {
	fadeOut('simplebox_footer_shadow', 400);
	fadeOut('simplebox_footer', 400);
};

var fadeOut = function(element_id, time_in_ms) {
	var element = document.getElementById(element_id);

	var op = 1;

	var timestep = 25;
	var step_per_timestep = 1.0 / (time_in_ms / timestep);

    var timer = setInterval(function () {
        if (op <= step_per_timestep){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        op -= step_per_timestep;
    }, timestep);
};

var fadeIn = function(element_id, time_in_ms) {
	var element = document.getElementById(element_id);
	element.style.display = 'block';

	var op = 1;

	var timestep = 25;
	var step_per_timestep = 1.0 / (time_in_ms / timestep);

    var timer = setInterval(function () {
        if (op >= 1.0 - step_per_timestep){
            clearInterval(timer);
        }
        element.style.opacity = op;
        op += step_per_timestep;
    }, timestep);
};
