# Simplebox
Simplebox, a very lightweight fancy box alternative. This is still very much WIP.

## Setup
First of all you have to include all necessary files. It should look like this.
```html
<script type="text/javascript" src="libs/simpleBox.js"></script>
<link rel="stylesheet" href="libs/simpleBox.css">
```

Now only one step is missing. You have to initialize the library.
```javascript
window.onload = function() {
	simpleBox.init({
		offset: 50, 
		background: {
			blur: {
				content_id: 'content',
				radius: 17
			}, 
			color: 'rgba(0,0,0,0.75)'
		}
	});
}
```
This init function sets up everything. You can leave the init parameter empty and it defaults to `50px` with a dark non-blurred background. 

- `offset:` (`default: 15`) the min distance between the edge of the window and the edge of the image
- `background`:
 - `color`: (`default: rgba(0,0,0,0.75)`) a rgba value which defines the background color; set the a part to 0 if you do not want a colored overlay
 - `blur`: set this data to enable blurring; `content_id` (`default: content`) defines the name of your main element in order to be blurred (do not use the main body!), the radius (`default: 15`) defines how blurry it should be

## Creating Galleries
A gallery is a slideshow of at least one element. There are neither limitations on the item amount nor on the item type. This means that you could combine images with iframes or embedded HTML.
```html
<a simpleBox="gallery" gid="gal_1" class="simplebox_imageLink" title="This title is also displayed inside of the description area" src="test_1_highres.jpg"> <img src="test_1.jpg"> </a>
<a simpleBox="gallery" gid="gal_1" class="simplebox_imageLink" description="This image has no title but a dedicated description tag.<br>You can use HTML tags in here"> <img src="test_2.jpg"> </a>
<a simpleBox="gallery" gid="gal_1" class="simplebox_imageLink" title="This title will be overwritten ..." description="... by this description."> <img src="test_3.jpg"> </a>

<a simpleBox="gallery" gid="gal_2" class="simplebox_imageLink"> <img src="test_1.jpg"> </a>
<a simpleBox="gallery" gid="gal_2" class="simplebox_imageLink"> <img src="test_2.jpg"> </a>
<a simpleBox="gallery" gid="gal_3" class="simplebox_imageLink"> <img src="test_3.jpg"> </a>

<a simpleBox="iframe" gid="a_cool_iframe" class="simplebox_imageLink" src="file:///Users/tim/Documents/__git/simplebox/tests/test.html"> <img class="prev" src="test_1.jpg"> </a>
<a simpleBox="iframe" gid="a_cool_iframe" class="simplebox_imageLink" src="https://timgoll.de"> <img class="prev" src="test_1.jpg"> </a>
<a simpleBox="html" gid="some_cool_gallery_name" class="simplebox_imageLink"> <img class="prev" src="test_1.jpg"> </a>
```
### Simplebox Type
The argument `simpleBox="<TYPE>"` has to be set in order for the library to detect the link. There will be other options at a later point. There are three different supported types right now:
- `image`: A picture is displayed
- `iframe`: A website is embedded into a popup box
- `html`: HTML code can be injected from your website and displayed in a box like an iframe

### Gallery ID
`gid` has to be set if you want to have more than one gallery. You can safely ignore it, if you don't plant on adding more galleries. It can be any unique string.

### Title and Description
You can add a default HTML `title` to the link and its content will be added into the description area. However you can add a dedicated `description` tag in order to add a special description to the image. It accepts HTML.<br>
If an image has no description the footer area is hidden. You can set the `description` tag to an empty string if you want to hide the footer area without renouncing the `title` tag.

### Source
You need a source tag for every element. There is one special case: images. You do not need a dedicated source tag if the child node is an image with a source tag. But you might consider to add a source tag to the parent link in order to have high resolutin images in the popup and low resolution images in the preview box

### width and height
Additionally there are width and height tags. They defined the max width and height of your box. This could be used in situations where you dont't want to use the max size, like iframes.

### Class Style
The class `simplebox_imageLink` is just a small helper for you which adds a pointer cursor while hovering over the preview icon. There is no need on using this.

## TODO
- add `simpleBox="html"`,
- close if clicked on description if lower element is background
- close view button
- open images or popups in general via javascript
