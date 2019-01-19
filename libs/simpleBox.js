var simpleBox = (function() {
	//IDs / Classes
	var IDs = {
		MAINAREA           : "simplebox_mainarea",
		MAINAREA_PREV      : "simplebox_mainarea_prev",
		MAINAREA_PREV_WRAP : "simplebox_mainarea_prev_wrapper",
		MAINAREA_PREV_IMG  : "simplebox_arrow_prev",
		MAINAREA_NEXT      : "simplebox_mainarea_next",
		MAINAREA_NEXT_WRAP : "simplebox_mainarea_next_wrapper",
		MAINAREA_NEXT_IMG  : "simplebox_arrow_next",
		BACKGROUND         : "simplebox_background",
		IMAGE              : "simplebox_image",
		IMAGE_WRAP         : "simplebox_image_wrapper",
		IMAGE_LOADING      : "simplebox_image_loading",
		FOOTERSHADOW       : "simplebox_footer_shadow",
		FOOTER             : "simplebox_footer",
		FOOTER_DESCRIPTION : "simplebox_footer_description",
		SHADOW             : "simplebox_shadow"

	};

	window.onkeydown = function(event) {
		var key = event.keyCode ? event.keyCode : event.which;

		if (key === 37) {        //left arrow
			_prevImageEvent(null, false);
		} else if (key === 39) { //right arrow
			_nextImageEvent(null, false);
		} else if (key === 27) { //esc
			_closeGallery();
		}
	};

	window.onresize = function(event) {
		if (_currently_open == true) {
			_changeImageMode(document.getElementById(IDs.IMAGE));
			_setNavAreas(document.getElementById(IDs.IMAGE));
		}
	};


	var simpleBox = {
		init : function({offset} = {}) {
			_offset = offset || 50;

			// iterate over DOM elements to find suitable galleries
			_set_up_iteration('gallery');
			_set_up_iteration('iframe');
			_set_up_iteration('html');

			console.log(_page_object_data);

			// preload loading icon
			_loading_image = new Image();
			_loading_image.src = '../media/loading.png';

			//preload nav elements
			_nav_prev_image = new Image();
			_nav_prev_image.src       = '../media/arrow_prev.png';
			_nav_prev_image.className = IDs.MAINAREA_PREV_IMG;
			_nav_prev_image.id        = IDs.MAINAREA_PREV_IMG;

			_nav_next_image = new Image();
			_nav_next_image.src       = '../media/arrow_next.png';
			_nav_next_image.className = IDs.MAINAREA_NEXT_IMG;
			_nav_next_image.id        = IDs.MAINAREA_NEXT_IMG;
		}
	};

	var _set_up_iteration = function(type) {
		galleries = document.querySelectorAll(`[simpleBox='${type}']`);
		for (let i = 0; i < galleries.length; i++) {
			//add event listener to open window
			galleries[i].addEventListener('click', _showGallery);

			//get unique identifier string and check if gallery already exists
			let gid = galleries[i].getAttribute('gid');
			if (_page_object_data[gid] === undefined)
				_page_object_data[gid] = []; //add empty array

			//gather data for new element and push into array
			_page_object_data[gid].push({
				type: type,
				src: galleries[i].getAttribute('src') || galleries[i].children[0].src,
				desc: galleries[i].getAttribute('description') || galleries[i].title || ''
			});

			//store automatic ID for later usage
			galleries[i].id = `element_id_${_page_object_data[gid].length-1}`;
		}
	};

	var _showGallery = function(event) {
		_current_gid = event.path[1].getAttribute('gid');					//gallery id
		_current_aid = event.path[1].id.substring('element_id_'.length);	//element id
		_openGallery();
	};

	var _openGallery = function(overlayShownOnOpen) {
		//gallery is now open
		_currently_open = true;

		if (overlayShownOnOpen === undefined)
			overlayShownOnOpen = true;
			
		if (overlayShownOnOpen)
			_fade_out_timeout = setTimeout(_hideElements, 2500);
		
			_displayFrame(
			_page_object_data[_current_gid][_current_aid].src,
			overlayShownOnOpen
		);

		//image stuff
		var image = document.getElementById(IDs.IMAGE);
		image.onload = function() {
			_changeImageMode(image);
			_setNavAreas(image);

			//enable visibility of image
			document.getElementById(IDs.IMAGE_LOADING).remove();
			image.style.opacity = "1.0";

			//set description if not empty string
			if (_page_object_data[_current_gid][_current_aid].desc != '')
				document.getElementById(IDs.FOOTER_DESCRIPTION).innerHTML = _page_object_data[_current_gid][_current_aid].desc;

			//enable nav elements
			_nav_prev_image.style = "opacity: 1.0;";
			_nav_next_image.style = "opacity: 1.0;";
		};
	};

	var _closeGallery = function() {
		_currently_open = false;

		document.removeEventListener('mousemove', _mouseMoveEvent);
		document.removeEventListener('click', _clickEvent);

		clearTimeout(_fade_out_timeout);

		document.getElementById(IDs.BACKGROUND).remove();
		document.body.style.overflow = '';
	};

	var _displayFrame = function (path, overlayShownOnOpen) {
		let nav_prev    = _current_aid > 0;
		let nav_next    = _current_aid < _page_object_data[_current_gid].length-1;
		let footer_desc = _page_object_data[_current_gid][_current_aid].desc != '';

		_createBox(nav_prev, nav_next, footer_desc, overlayShownOnOpen);
		document.body.style.overflow = 'hidden';

		document.getElementById(IDs.IMAGE).src = path;
	};

	var _createBox = function (nav_prev, nav_next, footer_desc, overlayShownOnOpen) {
		document.addEventListener('mousemove', _mouseMoveEvent);
		document.addEventListener('click', _clickEvent);

		if (overlayShownOnOpen)
			overlay_display = 'display: block;';
		else
			overlay_display = 'display: none;';

		var simplebox_background	= _createElement('div', IDs.BACKGROUND, IDs.BACKGROUND, '', document.body);

		var simplebox_image_wrapper = _createElement('div', IDs.IMAGE_WRAP, IDs.IMAGE_WRAP, '', simplebox_background);
			simplebox_image_wrapper.appendChild(_loading_image);
			_loading_image.class = IDs.IMAGE_LOADING;
			_loading_image.id	 = IDs.IMAGE_LOADING;
			_loading_image.style = "margin-left: 46px; margin-top:46px; opacity: .5;"
		var simplebox_image		 = _createElement('img', IDs.IMAGE, '', 'opacity: 0.0;', simplebox_image_wrapper);

		if (nav_prev) {
			var simplebox_prev_wrapper = _createElement('div', IDs.MAINAREA_PREV_WRAP, IDs.MAINAREA_PREV_WRAP, overlay_display, simplebox_background);
			var simplebox_prev		   = _createElement('div', IDs.MAINAREA_PREV, IDs.MAINAREA_PREV, '', simplebox_prev_wrapper);
			simplebox_prev.addEventListener('click', _prevImageEvent);
			_nav_prev_image.style = "opacity: 0.0;";
			simplebox_prev.appendChild(_nav_prev_image);
		}
		if (nav_next) {
			var simplebox_next_wrapper = _createElement('div', IDs.MAINAREA_NEXT_WRAP, IDs.MAINAREA_NEXT_WRAP, overlay_display, simplebox_background);
			var simplebox_next         = _createElement('div', IDs.MAINAREA_NEXT, IDs.MAINAREA_NEXT, '', simplebox_next_wrapper);
			simplebox_next.addEventListener('click', _nextImageEvent);
			_nav_next_image.style = "opacity: 0.0;";
			simplebox_next.appendChild(_nav_next_image);
		}
		if (footer_desc) {
			var simplebox_footer_shadow = _createElement('div', IDs.FOOTERSHADOW, IDs.FOOTERSHADOW, overlay_display, simplebox_background);
			var simplebox_footer		= _createElement('div', IDs.FOOTER, IDs.FOOTER, overlay_display, simplebox_background);
			var simplebox_footer_desc   = _createElement('div', IDs.FOOTER_DESCRIPTION, IDs.FOOTER_DESCRIPTION, '', simplebox_footer);
		}
	};

	var _changeImageMode = function(image) {
		var image_wrap = document.getElementById(IDs.IMAGE_WRAP);

		if (window.innerWidth / window.innerHeight <= image.width / image.height) {
			image_wrap.className = 'simplebox_image_landscape';
			image.className      = 'simplebox_image_landscape';

			image_wrap.style['width']       = (window.innerWidth - 2 * _offset) + "px";
			image_wrap.style['height']      = ((window.innerWidth - 2 * _offset) / image.width * image.height) + "px";
			image_wrap.style['margin-left'] = _offset + "px";
			image_wrap.style['margin-top']  = (window.innerHeight - image.height) / 2 + "px";
		} else {
			image_wrap.className = 'simplebox_image_portrait';
			image.className      = 'simplebox_image_portrait';

			image_wrap.style['height']      = (window.innerHeight - 2 * _offset) + "px";
			image_wrap.style['width']       = ((window.innerHeight - 2 * _offset) / image.height * image.width) + "px";
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
			prev_area.style.top    = this_image.style['margin-top'];
			prev_area.style.width  = "200px";
			prev_area.style.height = height + "px";
		}

		var next_area = document.getElementById(IDs.MAINAREA_NEXT_WRAP);
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
		clearTimeout(_fade_out_timeout);
		_fade_out_timeout = setTimeout(_hideElements, 2500);
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

		if (_current_aid >= _page_object_data[_current_gid].length-1)
			return;

		_closeGallery();
		_current_aid++;
		_openGallery(overlayShownOnOpen);
	};


	//helper
	var _createElement = function(_type, _id, _class, _style, _append) {
		var newElement = document.createElement(_type);
		newElement.setAttribute("id", _id);
		newElement.setAttribute("class", _class);
		newElement.setAttribute("style", _style);
		_append.appendChild(newElement);

		return newElement;
	};


	var _galleries = {};
	var _descrition = {};

	var _page_object_data = {};
	/*
		{
			'id_string: [
				{
					type: 'image' | 'iframe' | 'html',
					src: 'srcpath',
					desc: 'descriptiontext'
				},
				{
					...
				}
			],
			[
				...
			]
			
		}
	*/

	var _offset;

	var _current_gid;
	var _current_aid;
	var _currently_open;

	var _loading_image;
	var _nav_prev_image;
	var _nav_next_image;

	var _fade_out_timeout;

	return simpleBox;
})();
