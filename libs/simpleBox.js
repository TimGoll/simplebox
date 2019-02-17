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
		IFRAME             : "simplebox_iframe",
		HTML               : "simplebox_html",
		CONTENT_WRAP       : "simplebox_content_wrapper",
		CONTET_LOADING     : "simplebox_content_loading",
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
			_changeContentMode();
			_setNavAreas();
		}
	};

	var simpleBox = {
		init : function({offset, background} = {}) {
			_settings.offset            = offset || 50;
			_settings.background        = {};
			_settings.background.color  = background.color || 'rgba(0,0,0,0.75)';
			_settings.background.blur   = {};

			if (background === undefined || background.blur === undefined) {
				_settings.background.blur.enabled = false;
			} else  {
				_settings.background.blur.enabled    = true;
				_settings.background.blur.content_id = background.blur.content_id || 'content';
				_settings.background.blur.radius     = background.blur.radius || 15;
			}

			//print out setup and errors
			console.log(`[${_lib_name}] Setting up library ...`);
			console.log(`[${_lib_name}] Set offset to ${_settings.offset}px.`);
			console.log(`[${_lib_name}] Set background color to ${_settings.background.color}.`);
			if (!_settings.background.blur.enabled) {
				console.log(`[${_lib_name}] Background blurring is disabled.`);
			} else {
				console.log(`[${_lib_name}] Background blurring is enabled.`);
				console.log(`[${_lib_name}] Background blur radius set to ${background.blur.radius}.`);
				if (document.getElementById(background.blur.content_id) === null)
					console.error(`[${_lib_name}] No background ID with the name ${background.blur.content_id} found.`);
				else
					console.log(`[${_lib_name}] background ID set to ${background.blur.content_id}.`);
			}

			// iterate over DOM elements to find suitable galleries
			_set_up_iteration_data('image');
			_set_up_iteration_data('iframe');
			_set_up_iteration_data('html');

			// print data about galleries
			console.log(`[${_lib_name}] Found ${Object.keys(_page_object_data).length} different galleries in DOM.`);

			// preload loading icon
			_loading_image = new Image();
			_loading_image.src = '../media/loading.png';

			// preload nav elements
			_nav_prev_image = new Image();
			_nav_prev_image.src       = '../media/arrow_prev.png';
			_nav_prev_image.className = IDs.MAINAREA_PREV_IMG;
			_nav_prev_image.id        = IDs.MAINAREA_PREV_IMG;

			_nav_next_image = new Image();
			_nav_next_image.src       = '../media/arrow_next.png';
			_nav_next_image.className = IDs.MAINAREA_NEXT_IMG;
			_nav_next_image.id        = IDs.MAINAREA_NEXT_IMG;
		},
		// adds image to gallery handler and returns gallery data
		addImage : function({src, gallery_id, description, width, height} = {}) {
			if (src == undefined) {
				console.error(`[${_lib_name}] You must at least define an image source to init a new gallery`);
				return;
			}

			gallery_id = gallery_id || 'default_gallery_img';

			return _add_conent_generic(
				src,
				gallery_id || 'default_gallery_image',
				'image',
				description,
				width,
				height
			);
		},
		// adds iframe to gallery handler and returns gallery data
		addWebpage : function({src, gallery_id, description, width, height} = {}) {
			if (src == undefined) {
				console.error(`[${_lib_name}] You must at least define an iframe source to init a new gallery`);
				return;
			}

			return _add_conent_generic(
				src,
				gallery_id || 'default_gallery_iframe',
				'iframe',
				description,
				width,
				height
			);
		},
		addInlineHtml : function({inline, gallery_id, description, width, height} = {}) {
			if (inline == undefined) {
				console.error(`[${_lib_name}] You must at least define inline source code to init a new gallery`);
				return;
			}

			return _add_conent_generic(
				inline,
				gallery_id || 'default_gallery_html',
				'html',
				description,
				width,
				height
			);
		},
		addDomElement : function({element, gallery_id, description, width, height} = {}) {
			if (element == undefined) {
				console.error(`[${_lib_name}] You must at least define a DOM element to init a new gallery`);
				return;
			}

			return_element = _add_conent_generic(
				'',
				gallery_id || 'default_gallery_html',
				'html',
				description,
				width,
				height
			);
			//add element
			_page_object_data[return_element.gallery_id][return_element.element_id].domElement = element;
			return return_element;
		},
		displayContent : function(gallery_data) {
			_current_gid = gallery_data.gallery_id;
			_current_aid = gallery_data.element_id;
			_openGallery();
		}

	};

	var _set_up_iteration_data = function(type) {
		galleries = document.querySelectorAll(`[simpleBox='${type}']`);
		for (let i = 0; i < galleries.length; i++) {
			//add event listener to open window
			galleries[i].addEventListener('click', _showGallery);

			//push data
			let gal_data = _add_conent_generic(
				galleries[i].getAttribute('src') || galleries[i].children[0].src,
				galleries[i].getAttribute('gid'),
				type,
				galleries[i].getAttribute('description') || galleries[i].title,
				parseInt(galleries[i].getAttribute('width')),
				parseInt(galleries[i].getAttribute('height'))
			);

			//store automatic ID for later usage in html element
			galleries[i].id = `element_id_${gal_data.element_id}`;
		}
	};

	var _add_conent_generic = function(src, gallery_id, type, description, width, height) {
		_init_iteration_data(gallery_id);
		_push_iteration_data(
			gallery_id,
			type,
			src,
			description,
			width,
			height
		);

		//return gallery data to open it again
		return {
			gallery_id: gallery_id,
			element_id: _page_object_data[gallery_id].length-1
		};
};

	//get unique identifier string and check if gallery already exists
	var _init_iteration_data = function(gid) {
		if (_page_object_data[gid] === undefined)
			_page_object_data[gid] = []; //add empty array
	};

	//gather data for new element and push into array
	var _push_iteration_data = function(gid, type, src, desc, width, height) {
		_page_object_data[gid].push({
			type: type,
			src: src,
			desc: desc || '',
			width: width || -1, //-1 for auto-width
			height: height || -1 //-1 for auto-height
		});
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

		//onload
		if (_page_object_data[_current_gid][_current_aid].type == 'image')
			var content = document.getElementById(IDs.IMAGE);
		else if (_page_object_data[_current_gid][_current_aid].type == 'iframe')
			var content = document.getElementById(IDs.IFRAME);
		else if (_page_object_data[_current_gid][_current_aid].type == 'html')
			var content = document.getElementById(IDs.HTML);


		if (_page_object_data[_current_gid][_current_aid].type == 'html') {
			_openGallery_onload(content);
		} else {
			content.onload = function() {
				_openGallery_onload(content);
			};
		}

		if (_settings.background.blur.enabled != false) {
			document.getElementById(_settings.background.blur.content_id).style.filter = 'blur(15px)';
			document.getElementById(_settings.background.blur.content_id).style.transform = 'scale(1.01)';
		}
	};

	var _openGallery_onload = function(content) {
		_changeContentMode();
		_setNavAreas();

		//enable visibility of image
		document.getElementById(IDs.CONTENT_LOADING).remove();
		content.style.opacity = "1.0";

		//set description if not empty string
		if (_page_object_data[_current_gid][_current_aid].desc != '')
			document.getElementById(IDs.FOOTER_DESCRIPTION).innerHTML = _page_object_data[_current_gid][_current_aid].desc;

		//enable nav elements
		_nav_prev_image.style = "opacity: 1.0;";
		_nav_next_image.style = "opacity: 1.0;";
	};

	var _closeGallery = function() {
		if (!_currently_open)
			return;

		_currently_open = false;

		document.removeEventListener('mousemove', _mouseMoveEvent);
		document.removeEventListener('click', _clickEvent);

		clearTimeout(_fade_out_timeout);

		document.getElementById(IDs.BACKGROUND).remove();
		document.body.style.overflow = '';

		if (_settings.background.blur.enabled != false) {
			document.getElementById(_settings.background.blur.content_id).style.filter = '';
			document.getElementById(_settings.background.blur.content_id).style.transform = 'scale(1.0)';
		}
	};

	var _displayFrame = function (path, overlayShownOnOpen) {
		let nav_prev    = _current_aid > 0;
		let nav_next    = _current_aid < _page_object_data[_current_gid].length-1;
		let footer_desc = _page_object_data[_current_gid][_current_aid].desc != '';

		_createBox(nav_prev, nav_next, footer_desc, overlayShownOnOpen);
		document.body.style.overflow = 'hidden';

		if (_page_object_data[_current_gid][_current_aid].type == 'image') {
			let image = _createElement('img', IDs.IMAGE, '', 'opacity: 0.0;', document.getElementById(IDs.CONTENT_WRAP));
			image.src = path;
		} else
		if (_page_object_data[_current_gid][_current_aid].type == 'iframe') {
			let iframe = _createElement('iframe', IDs.IFRAME, '', 'opacity: 0.0;', document.getElementById(IDs.CONTENT_WRAP));
			iframe.src = path;
		}  else
		if (_page_object_data[_current_gid][_current_aid].type == 'html') {
			let html = _createElement('div', IDs.HTML, '', 'opacity: 0.0;', document.getElementById(IDs.CONTENT_WRAP));

			// check if element is given
			if (_page_object_data[_current_gid][_current_aid].domElement != undefined) {
				html.appendChild(_page_object_data[_current_gid][_current_aid].domElement);
			} else {
				html.innerHTML = path;
			}
		}
	};

	var _createBox = function (nav_prev, nav_next, footer_desc, overlayShownOnOpen) {
		document.addEventListener('mousemove', _mouseMoveEvent);
		document.addEventListener('click', _clickEvent);

		if (overlayShownOnOpen)
			overlay_display = 'display: block;';
		else
			overlay_display = 'display: none;';

		var simplebox_background = _createElement('div', IDs.BACKGROUND, IDs.BACKGROUND, '', document.body);
		simplebox_background.style.background = _settings.background.color;

		var simplebox_content_wrapper = _createElement('div', IDs.CONTENT_WRAP, IDs.CONTENT_WRAP, '', simplebox_background);
			simplebox_content_wrapper.appendChild(_loading_image);
			_loading_image.class = IDs.CONTENT_LOADING;
			_loading_image.id	 = IDs.CONTENT_LOADING;
			_loading_image.style = "margin-left: 46px; margin-top:46px; opacity: .5;"

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

	var _changeContentMode = function() {
		var content_wrap = document.getElementById(IDs.CONTENT_WRAP);

		//set max width of box
		if (_page_object_data[_current_gid][_current_aid].width == -1) //default auto sizing
			var window_width = window.innerWidth;
		else if (_page_object_data[_current_gid][_current_aid].width + 2*_settings.offset > window.innerWidth) //do not exceed window
			var window_width = window.innerWidth;
		else //define custom size
			var window_width = _page_object_data[_current_gid][_current_aid].width + 2*_settings.offset;


		//set max height of box
		if (_page_object_data[_current_gid][_current_aid].height == -1) //default auto sizing
			var window_height = window.innerHeight;
		else if (_page_object_data[_current_gid][_current_aid].height + 2*_settings.offset > window.innerHeight) //do not exceed window
			var window_height = window.innerHeight;
		else //define custom size
			var window_height = _page_object_data[_current_gid][_current_aid].height + 2*_settings.offset;

		if (_page_object_data[_current_gid][_current_aid].type == 'image') {
			let image = document.getElementById(IDs.IMAGE);

			if (window_width / window_height <= image.width / image.height) {
				content_wrap.className = 'simplebox_image_landscape';
				image.className        = 'simplebox_image_landscape';

				content_wrap.style['width']       = (window_width - 2 * _settings.offset) + "px";
				content_wrap.style['height']      = ((window_width - 2 * _settings.offset) / image.width * image.height) + "px";
				content_wrap.style['margin-left'] = ((window.innerWidth - window_width) / 2 + _settings.offset) + "px";
				content_wrap.style['margin-top']  = (window_height - image.height) / 2 + "px";
			} else {
				content_wrap.className = 'simplebox_image_portrait';
				image.className        = 'simplebox_image_portrait';

				content_wrap.style['height']      = (window_height - 2 * _settings.offset) + "px";
				content_wrap.style['width']       = ((window_height - 2 * _settings.offset) / image.height * image.width) + "px";
				content_wrap.style['margin-top']  = ((window.innerHeight - window_height) / 2 + _settings.offset) + "px";
				content_wrap.style['margin-left'] = (window_width - image.width) / 2 + "px";
			}
		} else
		if (_page_object_data[_current_gid][_current_aid].type == 'iframe') {
			let iframe = document.getElementById(IDs.IFRAME);

			content_wrap.className = '';

			content_wrap.style['height']      = (window_height - 2 * _settings.offset) + "px";
			content_wrap.style['width']       = (window_width - 2 * _settings.offset) + "px";
			content_wrap.style['margin-top']  = ((window.innerHeight - window_height) / 2 + _settings.offset) + "px";
			content_wrap.style['margin-left'] = ((window.innerWidth - window_width) / 2 + _settings.offset) + "px"; + "px";

			iframe.style['height'] = (window_height - 2 * _settings.offset) + "px";
			iframe.style['width']  = (window_width - 2 * _settings.offset) + "px";
			iframe.style['border'] = "none";
		}  else
		if (_page_object_data[_current_gid][_current_aid].type == 'html') {
			content_wrap.className = '';

			content_wrap.style['height']      = (window_height - 2 * _settings.offset) + "px";
			content_wrap.style['width']       = (window_width - 2 * _settings.offset) + "px";
			content_wrap.style['margin-top']  = ((window.innerHeight - window_height) / 2 + _settings.offset) + "px";
			content_wrap.style['margin-left'] = ((window.innerWidth - window_width) / 2 + _settings.offset) + "px"; + "px";
		}


	};

	var _setNavAreas = function() {
		if (_page_object_data[_current_gid][_current_aid].type == 'image') {
			let image = document.getElementById(IDs.IMAGE);

			var width  = image.width;
			var height = image.height;

			var c_width	= window.innerWidth;
		} else
		if (_page_object_data[_current_gid][_current_aid].type == 'iframe' || _page_object_data[_current_gid][_current_aid].type == 'html') {
			let content_wrap = document.getElementById(IDs.CONTENT_WRAP);

			var height = parseInt(content_wrap.style.height);
			var width  = parseInt(content_wrap.style.width);

			var c_width	= window.innerWidth;
		}

		let content_wrap = document.getElementById(IDs.CONTENT_WRAP);

		var prev_area = document.getElementById(IDs.MAINAREA_PREV_WRAP);
		if (prev_area != undefined) {
			prev_area.style.left   = (c_width - width) / 2 + "px";
			prev_area.style.top    = content_wrap.style['margin-top'];
			prev_area.style.width  = "200px";
			prev_area.style.height = height + "px";
		}

		var next_area = document.getElementById(IDs.MAINAREA_NEXT_WRAP);
		if (next_area != undefined) {
			next_area.style.right  = (c_width - width) / 2 + "px";
			next_area.style.top    = content_wrap.style['margin-top'];
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

	var _lib_name = 'simpleBox';

	var _settings = {};

	var _current_gid;
	var _current_aid;
	var _currently_open;

	var _loading_image;
	var _nav_prev_image;
	var _nav_next_image;

	var _fade_out_timeout;

	return simpleBox;
})();
