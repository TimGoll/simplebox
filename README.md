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
	simpleBox.init({offset: 50});
}
```
These three lines set up everything. You can leave the init parameter empty and it defaults to `50px`. The offset is the min distance between the edge of the window and the edge of the image.

## Creating Galleries
A gallery is a slideshow of at least one image. There is no limit.
```html
<a simpleBox="gallery" gid="gal_1" class="simplebox_imageLink" title="This title is also displayed inside of the description area" src="test_1_highres.jpg"> <img src="test_1.jpg"> </a>
<a simpleBox="gallery" gid="gal_1" class="simplebox_imageLink" description="This image has no title but a dedicated description tag.<br>You can use HTML tags in here"> <img src="test_2.jpg"> </a>
<a simpleBox="gallery" gid="gal_1" class="simplebox_imageLink" title="This title will be overwritten ..." description="... by this description."> <img src="test_3.jpg"> </a>

<a simpleBox="gallery" gid="gal_2" class="simplebox_imageLink"> <img src="test_1.jpg"> </a>
<a simpleBox="gallery" gid="gal_2" class="simplebox_imageLink"> <img src="test_2.jpg"> </a>

<a simpleBox="gallery" gid="gal_3" class="simplebox_imageLink"> <img src="test_3.jpg"> </a>
```
### Simplebox Type
The argument `simpleBox="gallery"` has to be set in order for the library to detect the link. There will be other options at a later point.

### Gallery ID
`gid` has to be set if you want to have more than one gallery. You can safely ignore it, if you don't plant on adding more galleries. It can be any unique string. 

### Title and Description
You can add a default HTML `title` to the link and its content will be added into the description area. However you can add a dedicated `description` tag in order to add a special description to the image. It accepts HTML.

### Second Source
It is possible to add a high resolution source tag to the link in order to have to different image paths. A `src` tag in the `a` tag is everything you have to do.

### Class Style
The class `simplebox_imageLink` is just a small helper for you which adds a pointer cursor while hovering over the preview icon. There is no need on using this.

## TODO
- add `simpleBox="textarea"`, `simpleBox="iframe"`, `simpleBox="popup"`
- prev and next arrow images
- close if clicked on description if lower element is background
- close view button