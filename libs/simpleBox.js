var simpleBox = (function() {
	//IDs / Classes
	var IDs = {
		MAINAREA		   : "simplebox_mainarea",
		MAINAREA_PREV	   : "simplebox_mainarea_prev",
		MAINAREA_PREV_WRAP : "simplebox_mainarea_prev_wrapper",
		MAINAREA_NEXT	   : "simplebox_mainarea_next",
		MAINAREA_NEXT_WRAP : "simplebox_mainarea_next_wrapper",
		BACKGROUND		   : "simplebox_background",
		IMAGE			   : "simplebox_image",
		IMAGE_WRAP		   : "simplebox_image_wrapper",
		IMAGE_LOADING	   : "simplebox_image_loading",
		FOOTERSHADOW	   : "simplebox_footer_shadow",
		FOOTER			   : "simplebox_footer",
		FOOTER_DESCRIPTION : "simplebox_footer_description",
		SHADOW			   : "simplebox_shadow"

	};

	window.onkeydown = function(event) {
		var key = event.keyCode ? event.keyCode : event.which;

		if (key === 37) {		//left arrow
			_prevImageEvent(null, false);
		} else if (key === 39) { //right arrow
			_nextImageEvent(null, false);
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

				//set image path
				if (_galleries[gid] === undefined)
					_galleries[gid] = [];
				src = all_galleries[i].getAttribute('src') || all_galleries[i].children[0].src;
				_galleries[gid].push(src);
				
				//set description text
				if (_descrition[gid] === undefined)
					_descrition[gid] = [];
				description = all_galleries[i].getAttribute('description') || all_galleries[i].title || '';
				_descrition[gid].push(description);

				all_galleries[i].id = 'img_id_' + (_galleries[gid].length-1).toString();
			}
			
			// preload loading icon
			_loading_image = new Image();
			_loading_image.src = '../media/loading.png';
		}
	};

	var _showGallery = function(event) {
		_current_gid = event.path[1].getAttribute('gid');	//gallery id
		_current_aid = event.path[1].id.substring(7);		//array id
		_openGallery();
	};

	var _openGallery = function(overlayShownOnOpen) {
		if (overlayShownOnOpen === undefined)
			overlayShownOnOpen = true;
		
		_currently_open = true;

		var src = _galleries[_current_gid][_current_aid];
		_displayFrame(src, _current_gid, _current_aid, overlayShownOnOpen);

		if (overlayShownOnOpen)
			fade_out_timeout = setTimeout(_hideElements, 2500);

		//image stuff
		var image = document.getElementById(IDs.IMAGE);
		image.onload = function() {
			_changeImageMode(image);
			_setNavAreas(image);
			
			//enable visibility of image
			document.getElementById(IDs.IMAGE_LOADING).remove();
			image.style.opacity = "1.0";
			
			//set description
			console.log(_descrition);
			document.getElementById(IDs.FOOTER_DESCRIPTION).innerHTML = _descrition[_current_gid][_current_aid];
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

	var _displayFrame = function (path, gid, aid, overlayShownOnOpen) {

		var nav_prev = aid > 0;
		var nav_next = aid < _galleries[gid].length-1;

		_createBox(nav_prev, nav_next, overlayShownOnOpen);
		document.body.style.overflow = 'hidden';
		
		document.getElementById(IDs.IMAGE).src = path;
	};

	var _createBox = function (nav_prev, nav_next, overlayShownOnOpen) {
		document.addEventListener('mousemove', _mouseMoveEvent);
		document.addEventListener('click', _clickEvent);
		
		if (overlayShownOnOpen)
			overlay_display = 'display: block;';
		else
			overlay_display = 'display: none;';

		var simplebox_background	= createElement('div', IDs.BACKGROUND, IDs.BACKGROUND, '', document.body);
		var simplebox_footer_shadow = createElement('div', IDs.FOOTERSHADOW, IDs.FOOTERSHADOW, overlay_display, simplebox_background);
		var simplebox_footer		= createElement('div', IDs.FOOTER, IDs.FOOTER, overlay_display, simplebox_background);
		var simplebox_footer_desc   = createElement('div', IDs.FOOTER_DESCRIPTION, IDs.FOOTER_DESCRIPTION, '', simplebox_footer);
		var simplebox_image_wrapper = createElement('div', IDs.IMAGE_WRAP, IDs.IMAGE_WRAP, '', simplebox_background);
			simplebox_image_wrapper.appendChild(_loading_image);
			_loading_image.class = IDs.IMAGE_LOADING;
			_loading_image.id	 = IDs.IMAGE_LOADING;
			_loading_image.style = "margin-left: 46px; margin-top:46px; opacity: .5;"
		var simplebox_image		 = createElement('img', IDs.IMAGE, '', 'opacity: 0.0;', simplebox_image_wrapper);

		if (nav_prev) {
			var simplebox_prev_wrapper = createElement('div', IDs.MAINAREA_PREV_WRAP, IDs.MAINAREA_PREV_WRAP, overlay_display, simplebox_background);
			var simplebox_prev		   = createElement('div', IDs.MAINAREA_PREV, IDs.MAINAREA_PREV, '', simplebox_prev_wrapper);
			simplebox_prev.addEventListener('click', _prevImageEvent);
		}
		if (nav_next) {
			var simplebox_next_wrapper = createElement('div', IDs.MAINAREA_NEXT_WRAP, IDs.MAINAREA_NEXT_WRAP, overlay_display, simplebox_background);
			var simplebox_next         = createElement('div', IDs.MAINAREA_NEXT, IDs.MAINAREA_NEXT, '', simplebox_next_wrapper);
			simplebox_next.addEventListener('click', _nextImageEvent);
		}
	};

	var _changeImageMode = function(image) {
		var image_wrap = document.getElementById(IDs.IMAGE_WRAP);
		
		if (window.innerWidth / window.innerHeight <= image.width / image.height) {
			image_wrap.className = 'simplebox_image_landscape';
			image.className      = 'simplebox_image_landscape';

			image_wrap.style['width']	   = (window.innerWidth - 2 * _offset) + "px";
			image_wrap.style['margin-left'] = _offset + "px";
			image_wrap.style['margin-top']  = (window.innerHeight - image.height) / 2 + "px";
		} else {
			image_wrap.className = 'simplebox_image_portrait';
			image.className      = 'simplebox_image_portrait';

			image_wrap.style['height']	  = (window.innerHeight - 2 * _offset) + "px";
			image_wrap.style['margin-top']  = _offset + "px";
			image_wrap.style['margin-left'] = (window.innerWidth - image.width) / 2 + "px";
		}
	};

	var _setNavAreas = function(image) {
		var width  = image.width;
		var height = image.height;

		var c_width	= window.innerWidth;

		var this_image = document.getElementById(IDs.IMAGE_WRAP);

		var prev_area = document.getElementById(IDs.MAINAREA_PREV_WRAP);
		if (prev_area != undefined) {
			prev_area.style.left   = (c_width - width) / 2 + "px";
			prev_area.style.top	   = this_image.style['margin-top'];
			prev_area.style.width  = "200px";
			prev_area.style.height = height + "px";
		}

		var next_area = document.getElementById(IDs.MAINAREA_NEXT_WRAP);
		if (next_area != undefined) {
			next_area.style.right  = (c_width - width) / 2 + "px";
			next_area.style.top	   = this_image.style['margin-top'];
			next_area.style.width  = (width - 200) + "px";
			next_area.style.height = height + "px";
		}


	};

	var _displayElements = function() {
		_fadeIn(IDs.FOOTERSHADOW, 200);
		_fadeIn(IDs.FOOTER, 200);
		_fadeIn(IDs.MAINAREA_NEXT_WRAP, 200);
		_fadeIn(IDs.MAINAREA_PREV_WRAP, 200);
	};

	var _hideElements = function() {
		_fadeOut(IDs.FOOTERSHADOW, 400);
		_fadeOut(IDs.FOOTER, 400);
		_fadeOut(IDs.MAINAREA_NEXT_WRAP, 400);
		_fadeOut(IDs.MAINAREA_PREV_WRAP, 400);
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
		_displayElements();
		clearTimeout(fade_out_timeout);
		fade_out_timeout = setTimeout(_hideElements, 2500);
	};

	var _prevImageEvent = function(event, overlayShownOnOpen) {	
		if (!_currently_open)
			return;

		if (_current_aid <= 0)
			return;

		_closeGallery();
		_current_aid--;
		_openGallery(overlayShownOnOpen);
	};

	var _nextImageEvent = function(event, overlayShownOnOpen) {		
		if (!_currently_open)
			return;

		if (_current_aid >= _galleries[_current_gid].length-1)
			return;

		_closeGallery();
		_current_aid++;
		_openGallery(overlayShownOnOpen);
	};


	var _galleries = {};
	var _descrition = {};
	var _offset;

	var _current_gid;
	var _current_aid;
	var _currently_open;
	
	var _loading_image;


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




