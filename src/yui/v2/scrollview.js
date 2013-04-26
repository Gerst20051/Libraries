YUI().use("scrollview", function (Y) {
	if(window.orientation == 0) // Temp solution to set the right height on load.
		{ var iheight = 740; }
	else if(window.orientation == 90 || window.orientation == -90)
		{ var iheight = 480; }

	var scrollview = new Y.ScrollView({
		id: "scrollview",
		srcNode: '#scrollable',
		height: iheight,		
		flick: {
			minDistance:10,
			minVelocity:0.3,
			axis: "y"}
	});

	scrollview.render();
	scrollView._uiDimensionsChange(); // Think I'm supposed to use this somehow.
});

// NEXT EXAMPLE

YUI().use("scrollview", function (Y) {
	function getHeight() {
		switch (window.orientation) {
			case 0:
				return 740;
			case 90:
			case -90:
				return 480;
			default:
				return ???;
		}
	}

	var scrollview = new Y.ScrollView({
		id: "scrollview",
		srcNode: '#scrollable',
		height: getHeight(),		
		flick: {
			minDistance:10,
			minVelocity:0.3,
			axis: "y"}
	});

	scrollview.render();

	Y.on("orientationchange", function (e) {
		scrollView.setAttrs({
			height: getHeight()
		});
	});
});