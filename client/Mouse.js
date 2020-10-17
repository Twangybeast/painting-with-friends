function MouseJS(element) {
	this.x = 0;
	this.y = 0;
	this.left = {
		clickTime: 0,
		releaseTime: 0,
		before: {
			x: 0,
			y: 0
		}
	};
	this.right = {
		clickTime: 0,
		releaseTime: 0,
		before: {
			x: 0,
			y: 0
		}
	};

    var beginningTime = (new Date()).getTime();
    this.getTime = function() { // Returns the number of milliseconds since the beginning.
    	return Math.round((new Date()).getTime() - beginningTime);
    };
    element.addEventListener("mousemove", (function(evt) {
    	this.x = (evt.x - element.offsetLeft) * window.devicePixelRatio; // assuming no borders
    	this.y = (evt.y - element.offsetTop) * window.devicePixelRatio; // assuming no borders
    }).bind(this), false);
    element.addEventListener("mousedown", (function(evt) {
    	var button;
    	if(evt.button === 0 && this.left.clickTime <= this.left.releaseTime) { // left button
    		button = "left";
    	} else if(evt.button === 2 && this.right.clickTime <= this.right.releaseTime) { // right button
    		button = "right";
    	}
    	this[button].clickTime = this.getTime();
    	this[button].before.x = this.x;
    	this[button].before.y = this.y;
    }).bind(this), false);
    element.addEventListener("mouseup", (function(evt) {
    	if(evt.button === 0 && this.left.releaseTime <= this.left.clickTime) { // left button
    		this.left.releaseTime = this.getTime();
    	} else if(evt.button === 2 && this.right.releaseTime <= this.right.clickTime) { // right button
    		this.right.releaseTime = this.getTime();
    	}
    }).bind(this), false);
    element.addEventListener("contextmenu", function(evt) {
    	evt.preventDefault(); // prevents opening of the context menu on right click
    }, false);
}
