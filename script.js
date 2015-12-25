/*
	Hi,
	If you're going through this code
	
	good luck
*/

// global variables
var entries = [];
var working = false;

// terrible vector2 thing??
function vec2(inX, inY)
{
	this.x = inX;
	this.y = inY;
	
	this.length = function()
	{
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	};
	
	this.normalized = function()
	{
		return new vec2(this.x / this.length(), this.y / this.length());
	};
	
	this.toString = function()
	{
		return "x: " + this.x + " y: " + this.y;
	}
}

var imgD = new vec2();
var actual = new vec2();

// entry related functions maybe?
// this is an entry object
function Entry(acceptedTags, tagLenient, blacklist, ulCorner, drCorner, colorize, reuse)
{
	this.acceptedTags = acceptedTags; 	// array
	this.tagLenient = tagLenient; 		// boolean
	this.blacklist = blacklist; 		// array
	this.ulCorner = ulCorner; 			// array (of 2)
	this.drCorner = drCorner; 			// array (of 2)
	this.colorize = colorize; 			// string
	this.reuse = reuse; 				// boolean
	
	this.toString = function()
	{
		var arr = [
					this.acceptedTags.join(" "),
					this.tagLenient ? "1" : "0",
					this.blacklist.join(" "),
					this.ulCorner.join(" "),
					this.drCorner.join(" "),
					this.colorize,
					this.reuse ? "same" : "nvmRIp"
		]
				
		if(arr[6] == "nvmRIp")
		{
			arr.pop();
		}
		
		if(arr[5] == "none" && arr[6] != "same")
		{
			arr.pop();
		}
		
		var returnStr = arr.join(",");
		return returnStr;
	}
}

// quick function for blank entries
	// this function mostly exists because of the add entry button
function blankEntry()
{
	return new Entry([""], false, [""], ["", ""], ["", ""], "none", false);
}

// this is for parsing filenames from entries into a custom entry object
function strToEntry(str)
{
	var subEntries = str.split(",");
	
	// errors trace back to here, so they must be handled here!!
	if(subEntries.length == 1)
	{
		subEntries[0] = "";
	}
	
	for(var i = 0; i < 5; i++)
	{
		if(subEntries[i] == undefined)
		{
			// WE HAVE AN ERROR WOOP WOOP
							// 	^ THAS THE SOUND OF THA PLOICE
			
			// we can ~correct~ these errors by replacing them with default/empty whatever
			
			switch(i)
			{
				case 1:
					// there's nothing specifying leniency
					subEntries[i] = "0";
					break;
					
				case 2:
					// no blacklist tags
					subEntries[i] = "";
					break;
					
				case 3:
					// improperly done upper-corner
					subEntries[i] = " ";
					break;
					
				case 4:
					// improperly done lower-corner
					subEntries[i] = " ";
					break;
			}
		}
	}
	
	var entryToReturn = new Entry(
					subEntries[0].split(" "),
					subEntries[1] == "1",
					subEntries[2].split(" "),
					subEntries[3].split(" "),
					subEntries[4].split(" "),
					(subEntries[5] != undefined) ? subEntries[5] : "",
					(subEntries[6] != undefined) ? (subEntries[6] == "same") : false
	);
	
	return entryToReturn;
}

// For parsing filename, check for optional memes by checking it so tha it's not undefined
function parseFilename(filename)
{
	// semicolons seperate entries
	// commas seperate sub-entries
	// spaces seperate sub-sub-entries
	var nameSansExt = filename.split(".")[0];
	
	var mainEntriesStr = nameSansExt.split(";");
	var mainEntries = new Array(); // yea i know im inconsistent
	
	if(mainEntriesStr.length == 0)
	{
		// print some error here idk
		return;
	}
	
	for(var i = 0; i < mainEntriesStr.length; i++)
	{
		var tempEntry = strToEntry(mainEntriesStr[i]);
		
		mainEntries.push(tempEntry);
	}
	
	return mainEntries;
}

function updateEntryDivHeaders()
{
	// go through each entry and change the header (accessible by elem.children) and ID to reflect its new position
	for(var i = 0; i < entries.length; i++)
	{
		var tempDiv = entries[i];
		
		tempDiv.id = "entry-" + (i + 1);
		tempDiv.children[0].innerHTML = "Entry " + (i + 1);
	}
}

// function that should be called when an entry gets deleted
// handles remove an entry-div
function removeDiv(div)
{
	// first get its index
		// from its ID, of course
	var index = parseInt(div.id.split("-")[1]) - 1;
	
	// then we delete that entry from the list
	entries.splice(index, 1);
	
	// then let's remove the div itself
	div.remove();
	
	// now let's update the other entries to reflect this change
	updateEntryDivHeaders();
}

// handles adding an entry-div
function addDiv(inputEntry)
{
	if(working)
	{
		var tempThing = divFromEntry(inputEntry, entries.length + 1)
		entries.push(tempThing)
		
		document.getElementById("entries").appendChild(tempThing);
	}
	else
	{
		alert("Drag in a template image first!");
	}
}

// generates an entry from a div
// below this function is its inverse function
function entryFromDiv(entryDiv)
{
	// get list of *important* nodes from main div
	var nodes = filterNodes(entryDiv);
	
	// get list of important nodes from each node
	var subNodes = [];
	for(var i = 0; i < nodes.length; i++)
	{
		subNodes[i] = filterNodes(nodes[i]);
	}
	
	var acceptedTags = subNodes[0][0].value; // the value from the textarea in the first <p>
	
	var blacklistedTags = subNodes[1][0].value; // value from the textarea in the second <p>
	
	var leniency = subNodes[2][0].checked; // the "checked" value from the checkbox in the third <p>
	
	var x = 0; // temporary variable for the corners
	var corners = [parseInt(subNodes[3][x++].value),
				   parseInt(subNodes[3][x++].value),
				   parseInt(subNodes[3][x++].value),
				   parseInt(subNodes[3][x++].value)]; // the values of each input textbox in the fourth <p>
	delete x;
	
	var color; // the value of whichever radio is checked within the <form> proceeding the fourth <p>
	for(var i = 0; i < subNodes[4].length; i++)
	{
		if(subNodes[4][i].checked)
		{
			color = subNodes[4][i].value;
			break;
		}
	}
	color = (!color) ? "none" : color;
	
	var reuse = subNodes[5][0].checked; // the "checked" vlaue from the checkbox in the 6th element (<p>)
	
	return new Entry(acceptedTags.split(" "), leniency, blacklistedTags.split(" "), [corners[0], corners[1]], [corners[2], corners[3]], color, reuse);
}

// function to generate the UI given an entry
function divFromEntry(inputEntry, entryIndex)
{
	// prevent duplicates
		// safe but it will never happen anyways
	if(document.getElementById("entry-" + entryIndex))
	{
		return;
	}
	
	// start create all the elements that go into an entry-div and fill out its values
	var mainDiv = document.createElement("div");
	mainDiv.className = "entry-ui";
	mainDiv.id = "entry-" + entryIndex;
	
	var header = document.createElement("h2");
	header.innerHTML = "Entry " + entryIndex;
	
	mainDiv.appendChild(header);
	
	var acceptedTagsP = document.createElement("p");
	acceptedTagsP.innerHTML = "Accepted Tags:<br>";
	
	var acceptedTagsTextarea = document.createElement("textarea");
	acceptedTagsTextarea.placeholder = "tags tags tags (e.g. face reaction rip)";
	acceptedTagsTextarea.value = inputEntry.acceptedTags.join(" ");
	
	acceptedTagsP.appendChild(acceptedTagsTextarea);
	mainDiv.appendChild(acceptedTagsP);
	
	var blacklistedTagsP = document.createElement("p");
	blacklistedTagsP.innerHTML = "Blacklisted Tags:<br>";
	
	var blackListedTagsTextarea = document.createElement("textarea");
	blackListedTagsTextarea.placeholder = "tags tags tags (e.g. face reaction rip)";
	blackListedTagsTextarea.value = inputEntry.blacklist.join(" ");
	
	blacklistedTagsP.appendChild(blackListedTagsTextarea);
	mainDiv.appendChild(blacklistedTagsP);
	
	var leniencyP = document.createElement("p");
	leniencyP.innerHTML = "Leniency ";
	
	var leniencyAbbr = document.createElement("abbr");
	leniencyAbbr.title = "If left unchecked, a simage will qualify for the entry if at least 1 tag matches. If checked, the simage only qualifies if all tags match.";
	leniencyAbbr.innerHTML = "(?)";
	
	leniencyP.appendChild(leniencyAbbr);
	
	leniencyP.innerHTML += ": ";
	
	var leniencyCheckbox = document.createElement("input");
	leniencyCheckbox.type = "checkbox";
	leniencyCheckbox.checked = inputEntry.tagLenient;
	
	leniencyP.appendChild(leniencyCheckbox);
	mainDiv.appendChild(leniencyP);
	
	var coordsP = document.createElement("p");
	
	var coordsH3 = document.createElement("span");
	coordsH3.className = "h3";
	coordsH3.innerHTML = "Entry's Coordinates";
	
	coordsP.appendChild(coordsH3);
	
	coordsP.appendChild(document.createElement("br")); // break
	
	coordsP.innerHTML += "Upper Left:<br>x: ";
	
	var coordsTextX1 = document.createElement("input");
	coordsTextX1.id = "entry-" + entryIndex + "-ulx";
	coordsTextX1.type = "text";
	coordsTextX1.rows = 1;
	coordsTextX1.placeholder = "x-value (e.g. 5)";
	coordsTextX1.setAttribute("value", inputEntry.ulCorner[0].toString()); // have to do this TWISTED OOP MEME ONLY FOR THIS
	
	coordsP.appendChild(coordsTextX1);
	
	coordsP.appendChild(document.createElement("br")); // break
	
	coordsP.innerHTML += "y: ";
	
	var coordsTextY1 = document.createElement("input");
	coordsTextY1.id = "entry-" + entryIndex + "-uly";
	coordsTextY1.type = "text";
	coordsTextY1.rows = 1;
	coordsTextY1.placeholder = "y-value (e.g. 5)";
	coordsTextY1.setAttribute("value", inputEntry.ulCorner[1].toString());
	
	coordsP.appendChild(coordsTextY1);
	
	coordsP.appendChild(document.createElement("br")); // break
	
	coordsP.innerHTML += "Lower Right:<br>x: ";
	
	var coordsTextX2 = document.createElement("input");
	coordsTextX2.id = "entry-" + entryIndex + "-drx";
	coordsTextX2.type = "text";
	coordsTextX2.rows = 1;
	coordsTextX2.placeholder = "x-value (e.g. 5)";
	coordsTextX2.setAttribute("value", inputEntry.drCorner[0].toString());
	
	coordsP.appendChild(coordsTextX2);
	
	coordsP.appendChild(document.createElement("br")); // break
	
	coordsP.innerHTML += "y: ";
	
	var coordsTextY2 = document.createElement("input");
	coordsTextY2.id = "entry-" + entryIndex + "-dry";
	coordsTextY2.type = "text";
	coordsTextY2.rows = 1;
	coordsTextY2.placeholder = "y-value (e.g. 5)";
	coordsTextY2.setAttribute("value", inputEntry.drCorner[1].toString());
	
	coordsP.appendChild(coordsTextY2);
	
	// Visualize and Set buttons!
	coordsButtonP = document.createElement("p");
	coordsButtonP.className = "buttonP";
	
	coordsVisSpan = document.createElement("span");
	coordsVisSpan.className = "button";
	coordsVisSpan.innerHTML = "Visualize";
	coordsVisSpan.onclick = function()
	{
		if(!document.getElementById("vis-" + entryIndex))
		{
			// get value from the text and make a rectangle on top of the canvas that reflects its position!
			
			var ulX = document.getElementById("entry-" + entryIndex + "-ulx");
			var ulY = document.getElementById("entry-" + entryIndex + "-uly");
			var drX = document.getElementById("entry-" + entryIndex + "-drx");
			var drY = document.getElementById("entry-" + entryIndex + "-dry");
			
			var ul = entryCoordToRealCoord(new vec2(ulX.value, ulY.value), document.getElementById("img").getBoundingClientRect(), imgD);
			var lr = entryCoordToRealCoord(new vec2(drX.value, drY.value), document.getElementById("img").getBoundingClientRect(), imgD);
			
			var visDiv = document.createElement("div");
			visDiv.id = "vis-" + entryIndex;
			visDiv.className = "vis";
			visDiv.style.left = ul.x + "px";
			visDiv.style.top = ul.y + "px";
			visDiv.style.width = (lr.x - ul.x) + "px";
			visDiv.style.height = (lr.y - ul.y) + "px";
			
			window.setTimeout(function()
			{
				visDiv.remove();
			}, 3000);
			
			document.getElementById("div-canvas").appendChild(visDiv);
		}
	};
	
	coordsButtonP.appendChild(coordsVisSpan);
	
	coordsSetSpan = document.createElement("span");
	coordsSetSpan.className = "button";
	coordsSetSpan.innerHTML = "Set (w/ mouse)";
	coordsSetSpan.onclick = function(e)
	{
		// here we gotta set the cursor to crosshair and then add an event listener for mouse down within the image
			// on the mouse down, we'll get outta this function 
			// we'll also hear for an escape so that we can escape i suppose
			
		var img = document.getElementById("img");
		var canv = document.getElementById("div-canvas");
		
		var ulX = document.getElementById("entry-" + entryIndex + "-ulx");
		var ulY = document.getElementById("entry-" + entryIndex + "-uly");
		var drX = document.getElementById("entry-" + entryIndex + "-drx");
		var drY = document.getElementById("entry-" + entryIndex + "-dry");
		
		canv.style.cursor = "crosshair";
		
		var corners = [];
		
		document.addEventListener("keydown", function(e)
		{
			if(e.keyCode == 27) // escape
			{
				canv.style.cursor = "auto";
				
				if(document.getElementById("set"))
				{
					document.getElementById("set").remove();
				}
				
				canv.onmousemove = function() {};
				canv.onmousedown = function() {};
				canv.onmouseup = function() {};
				canv.onmouseleave = function() {};
			}
		}, false);
		
		canv.onmousedown = function(e)
		{
			// here we need to start creating a rectangle
			// we should attatch a mousemove event to keep updating the dimensions of the rectangle
			// hi im kinda drunk lol
			// what should the rectangle's ID be?
				// cmon that's kind of a dumb question
			
			corners[0] = new vec2(e.clientX, e.clientY);
			
			var setDiv = document.createElement("div");
			setDiv.id = "set";
			setDiv.className = "set";
			setDiv.style.left = e.clientX + "px";
			setDiv.style.top = e.clientY + "px";
			
			canv.appendChild(setDiv);
			
			canv.onmousemove = function(e)
			{
				corners[1] = new vec2(e.clientX, e.clientY);
				
				setDiv.style.width = (corners[1].x - corners[0].x) + "px";
				setDiv.style.height = (corners[1].y - corners[0].y) + "px";
			}
			
			var cleanup = function(e)
			{
				corners[1] = new vec2(e.clientX, e.clientY);
					
				// we have the 2 corners, now let's translate to entry coordinates!
				var entryUl = realCoordToEntryCoord(corners[0], img.getBoundingClientRect(), imgD);
				ulX.value = entryUl.x;
				ulY.value = entryUl.y;
				
				var entryDr = realCoordToEntryCoord(corners[1], img.getBoundingClientRect(), imgD);
				drX.value = entryDr.x;
				drY.value = entryDr.y;
				
				// cleanup
				canv.style.cursor = "auto";
				
				setDiv.style.transition = "";
				setDiv.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
				setDiv.style.opacity = "0";
				
				window.setTimeout(function()
				{
					setDiv.remove();
				}, 1000);
				
				canv.onmousemove = function() {};
				canv.onmousedown = function() {};
				canv.onmouseup = function() {};
				canv.onmouseleave = function() {};
			}
			
			canv.onmouseup = cleanup;
			canv.onmouseleave = cleanup;
		};
	};
	
	coordsButtonP.appendChild(coordsSetSpan);
	
	coordsP.appendChild(coordsButtonP);
	mainDiv.appendChild(coordsP);
	
	var colorForm = document.createElement("form");
	
	var colorH3 = document.createElement("span");
	colorH3.className = "h3";
	colorH3.innerHTML = "Colorize (optional):";
	
	colorForm.appendChild(colorH3);
	colorForm.appendChild(document.createElement("br")); // break
	
	var colorRedLabel = document.createElement("label");
	colorRedLabel.htmlFor = "entry-" + entryIndex + "-red";
	colorRedLabel.title = "RGB 255 25 25";
	colorRedLabel.innerHTML = "Red";
	
	colorForm.appendChild(colorRedLabel);
	
	var colorRedRadio = document.createElement("input");
	colorRedRadio.id = "entry-" + entryIndex + "-red";
	colorRedRadio.setAttribute("value", "red");
	colorRedRadio.type = "radio";
	colorRedRadio.name = "color";
	
	if(inputEntry.colorize == "red")
	{
		colorRedRadio.checked = true;
	}
	
	colorForm.appendChild(colorRedRadio);
	colorForm.appendChild(document.createElement("br")); // break
	
	var colorGreenLabel = document.createElement("label");
	colorGreenLabel.htmlFor = "entry-" + entryIndex + "-green";
	colorGreenLabel.title = "RGB 25 255 25";
	colorGreenLabel.innerHTML = "Green";
	
	colorForm.appendChild(colorGreenLabel);
	
	var colorGreenRadio = document.createElement("input");
	colorGreenRadio.id = "entry-" + entryIndex + "-green";
	colorGreenRadio.setAttribute("value", "green");
	colorGreenRadio.type = "radio";
	colorGreenRadio.name = "color";
	
	if(inputEntry.colorize == "green")
	{
		colorGreenRadio.checked = true;
	}
	
	colorForm.appendChild(colorGreenRadio);
	colorForm.appendChild(document.createElement("br")); // break
	
	var colorBlueLabel = document.createElement("label");
	colorBlueLabel.htmlFor = "entry-" + entryIndex + "-blue";
	colorBlueLabel.title = "RGB 25 25 255";
	colorBlueLabel.innerHTML = "Blue";
	
	colorForm.appendChild(colorBlueLabel);
	
	var colorBlueRadio = document.createElement("input");
	colorBlueRadio.id = "entry-" + entryIndex + "-blue";
	colorBlueRadio.setAttribute("value", "blue");
	colorBlueRadio.type = "radio";
	colorBlueRadio.name = "color";
	
	if(inputEntry.colorize == "blue")
	{
		colorBlueRadio.checked = true;
	}
	
	colorForm.appendChild(colorBlueRadio);
	colorForm.appendChild(document.createElement("br")); // break
	
	var colorCyanLabel = document.createElement("label");
	colorCyanLabel.htmlFor = "entry-" + entryIndex + "-cyan";
	colorCyanLabel.title = "RGB 25 255 255";
	colorCyanLabel.innerHTML = "Cyan";
	
	colorForm.appendChild(colorCyanLabel);
	
	var colorCyanRadio = document.createElement("input");
	colorCyanRadio.id = "entry-" + entryIndex + "-cyan";
	colorCyanRadio.setAttribute("value", "cyan");
	colorCyanRadio.type = "radio";
	colorCyanRadio.name = "color";
	
	if(inputEntry.colorize == "cyan")
	{
		colorCyanRadio.checked = true;
	}
	
	colorForm.appendChild(colorCyanRadio);
	colorForm.appendChild(document.createElement("br")); // break
	
	var colorMagentaLabel = document.createElement("label");
	colorMagentaLabel.htmlFor = "entry-" + entryIndex + "-magenta";
	colorMagentaLabel.title = "RGB 25 255 255";
	colorMagentaLabel.innerHTML = "Magenta";
	
	colorForm.appendChild(colorMagentaLabel);
	
	var colorMagentaRadio = document.createElement("input");
	colorMagentaRadio.id = "entry-" + entryIndex + "-magenta";
	colorMagentaRadio.setAttribute("value", "magenta");
	colorMagentaRadio.type = "radio";
	colorMagentaRadio.name = "color";
	
	if(inputEntry.colorize == "magenta")
	{
		colorMagentaRadio.checked = true;
	}
	
	colorForm.appendChild(colorMagentaRadio);
	colorForm.appendChild(document.createElement("br")); // break
	
	var colorYellowLabel = document.createElement("label");
	colorYellowLabel.htmlFor = "entry-" + entryIndex + "-yellow";
	colorYellowLabel.title = "RGB 25 255 255";
	colorYellowLabel.innerHTML = "Yellow";
	
	colorForm.appendChild(colorYellowLabel);
	
	var colorYellowRadio = document.createElement("input");
	colorYellowRadio.id = "entry-" + entryIndex + "-yellow";
	colorYellowRadio.setAttribute("value", "yellow");
	colorYellowRadio.type = "radio";
	colorYellowRadio.name = "color";
	
	if(inputEntry.colorize == "yellow")
	{
		colorYellowRadio.checked = true;
	}
	
	colorForm.appendChild(colorYellowRadio);
	colorForm.appendChild(document.createElement("br")); // break
	
	var colorNoneLabel = document.createElement("label");
	colorNoneLabel.htmlFor = "entry-" + entryIndex + "-none";
	colorNoneLabel.title = "RGB 25 255 255";
	colorNoneLabel.innerHTML = "None";
	
	colorForm.appendChild(colorNoneLabel);
	
	var colorNoneRadio = document.createElement("input");
	colorNoneRadio.id = "entry-" + entryIndex + "-none";
	colorNoneRadio.setAttribute("value", "none");
	colorNoneRadio.type = "radio";
	colorNoneRadio.name = "color";
	
	if(inputEntry.colorize == "none" || inputEntry.colorize == "")
	{
		colorNoneRadio.checked = true;
	}
	
	colorForm.appendChild(colorNoneRadio);
	
	mainDiv.appendChild(colorForm);
	
	var reuseP = document.createElement("p");
	reuseP.innerHTML = "Reuse simage in following entry (optional): ";
	
	var reuseCheckbox = document.createElement("input");
	reuseCheckbox.type = "checkbox";
	reuseCheckbox.checked = inputEntry.reuse;
	
	reuseP.appendChild(reuseCheckbox);
	mainDiv.appendChild(reuseP);
	
	// remove entrydiv thing!
	var removeP = document.createElement("p");
	
	var removeSpan = document.createElement("span");
	removeSpan.className = "button";
	removeSpan.innerHTML = "Remove Entry";
	removeSpan.onclick = function()
	{
		removeDiv(mainDiv);
	};
	
	removeP.appendChild(removeSpan);
	mainDiv.appendChild(removeP);
	
	return mainDiv;
}

// function takes all the entries and compiles them down into one string!
function exportTemplate()
{
	if(working)
	{
		var parentDiv = document.getElementById("entries");
		var nodes = filterNodes(parentDiv);
		
		if(nodes.length == 0)
		{
			// we got an image but no entries!!
			alert("You must have at least one entry before exporting!");
			return;
		}
		else
		{
			var exportList = [];
			
			// here we must error-check through al entries
			var errorTags = false;
			var errorNumbers = false;
			for(var i = 0; i < nodes.length; i++)
			{
				var tempNode = nodes[i];
				var tempNodes = filterNodes(nodes[i]);
				var tempEntry = entryFromDiv(tempNode);
				var tempErrorNumbers = false;
				
				exportList[i] = tempEntry.toString();
				
				// see if there are a lack of tags
				var acceptedTagsText = filterNodes(tempNodes[0])[0];
				if(!(/\S/.test(acceptedTagsText.value))) // test for if a string is composed entirely of whitespace...
				{
					errorTags = true;
					
					// no accepted tags
					showError(tempNodes[0], "There needs to be at least one accepted tag!<br>(Tip: you can put \"any\" to allow for any simage to be chosen.)");
				}
				
				var blacklistText = filterNodes(tempNodes[1])[0];
				if(!(/\S/.test(blacklistText.value))) // test for if a string is composed entirely of whitespace...
				{
					errorTags = true;
					
					// no accepted tags
					showError(tempNodes[1], "There needs to be at least one blacklisted tag!<br>(Tip: you can put \"none\" to have no simage be blacklisted.)");
				}
				
				var numberErrorBuffer = "Errors:<br>";
				// check any coordinates are just not valid..
				// upper left x
				if(isNaN(tempEntry.ulCorner[0]))
				{
					errorNumbers = true;
					tempErrorNumbers = true;
					
					numberErrorBuffer += "The upper-left X value must be a valid integer!<br>";
				}
				
				// upper left y
				if(isNaN(tempEntry.ulCorner[1]))
				{
					errorNumbers = true;
					tempErrorNumbers = true;
					
					numberErrorBuffer += "The upper-left Y value must be a valid integer!<br>";
				}
				
				// lower right x
				if(isNaN(tempEntry.drCorner[0]))
				{
					errorNumbers = true;
					tempErrorNumbers = true;
					
					numberErrorBuffer += "The lower-right X value must be a valid integer!<br>";
				}
				
				// lower right y
				if(isNaN(tempEntry.ulCorner[1]))
				{
					errorNumbers = true;
					tempErrorNumbers = true;
					
					numberErrorBuffer += "The lower-right Y value must be a valid integer!<br>";
				}
				
				if(tempErrorNumbers)
				{
					showError(tempNodes[3], numberErrorBuffer);
				}
				else // ok so if no numbers are invalid, check if any of ul is more than dr
				{
					// this will apply to tempNodes[3]
					if(tempEntry.ulCorner[0] > tempEntry.drCorner[0] || tempEntry.ulCorner[1] > tempEntry.drCorner[1])
					{
						errorNumbers = true;
						
						showError(tempNodes[3], "<i>All</i> values of the upper-left corner must be less than those of the lower-right corner!");
					}
				}
			}
			
			if(errorTags || errorNumbers)
			{
				// do something here idk
				showError(document.getElementById("div-toolbar"), "There were errors!<br>Please look for them and fix them!");
				return;
			}
			else
			{
				// concatenate strings by ";" and uh show it somewhere?
				var exportStr = exportList.join(";");
				window.prompt("Export successful! Hit Ctrl + C and Enter!", exportStr);
			}
		}
	}
	else
	{
		// we have not even an image!
		alert("Drag in a template image first!");
		return;
	}
}

// --------

// dropbox-related functions
function dragEnter(e)
{
	stopDefault(e);
		
	db.style.opacity = 0.5;
}

function dragExit(e)
{
	stopDefault(e);
	
	db.style.opacity = 0;
}

function dropE(e)
{
	stopDefault(e);
	
	dragExit(e); // in other words, make the green fade out again

	var dt = e.dataTransfer;
	
	//TODO: take the time to work with URLs one day
	
	// handle and REJECT urls
	var url = dt.getData("URL");
	if(url != "")
	{
		alert("URLs aren't supported!");
		
		return;
	}
	
	var file = dt.files[0];
	
	// parse file name
	var entries = parseFilename(file.name);
	
	var reader = new FileReader();
	
	reader.readAsDataURL(file);
	
	reader.addEventListener("loadend", function(e, file)
	{			
		img.src = reader.result;
		
		img.addEventListener("load", function()
		{
			imgD.x = img.width;
			imgD.y = img.height;
			
			img.style.height = "100%";
			img.style.width = "100%";
			
			working = true;
	
			// get rid of that "first" thing
			if(document.getElementById("first"))
			{
				document.getElementById("first").remove();
			}
			
			for(var i = 0; i < entries.length; i++)
			{
				if(entries[i].acceptedTags[0] != "")
				{
					addDiv(entries[i]);
				}
			}
		}, false);
		
		img.style.opacity = "1";
		
		db.removeEventListener("drop", dropE, false);
		db.remove();
	},false);
}

function drop2(e)
{
	stopDefault(e);
			
	alert("Refresh to page or hit the clear button to restart your work.");
	
	dragExit(e);
}

// used mostly for dropbox, but can be for other things
function stopDefault(e)
{
	e.stopPropagation();
	e.preventDefault();
}
// --------

// image functions
function offsetAndNewDim(frameRect, imgDim)
{
	var normalizedRect = (new vec2(frameRect.width, frameRect.height)).normalized();
	var normalizedImg = (new vec2(imgDim.x, imgDim.y)).normalized();
	
	this.offset = new vec2();
	this.newDim = new vec2();
	
	if(normalizedImg.y > normalizedRect.y)
	{
		this.offset.y = 0;
		this.newDim.y = frameRect.height;
		
		var ratio = frameRect.height / imgDim.y;
		this.newDim.x = imgDim.x * ratio;
		
		this.offset.x = Math.round((frameRect.width - (this.newDim.x)) / 2);
	}
	else
	{
		this.offset.x = 0;
		this.newDim.x = frameRect.width;
		
		var ratio = frameRect.width / imgDim.x;
		this.newDim.y = imgDim.y * ratio;
		
		this.offset.y = Math.round((frameRect.height - (this.newDim.y)) / 2);
	}
}

// function that takes in entry coordinates and outputs real coordinates relative to the frame!
// this should be called when visualizing an entry
function entryCoordToRealCoord(entryCoords, frameRect, imgDim)
{
	var oAD = new offsetAndNewDim(frameRect, imgDim);
	var offset = oAD.offset;
	var newDim = oAD.newDim;
	
	// translate entry coordinates from pixel to percent across original image dimensions
	var oPer = new vec2(entryCoords.x / imgDim.x, entryCoords.y / imgDim.y);
	
	// with oPer, output the right coordinates relative to the frame
	return new vec2((newDim.x * oPer.x) + offset.x, (newDim.y * oPer.y) + offset.y);
}

// function that takes in real coords (relative to frame) and translates them into entry coords
// should be called when moving a marker to update the entry div on the right
function realCoordToEntryCoord(realCoord, frameRect, imgDim)
{
	var oAD = new offsetAndNewDim(frameRect, imgDim);
	var offset = oAD.offset;
	var newDim = oAD.newDim;
	
	var percent = new vec2(Math.max(0, Math.min(1, (realCoord.x - offset.x) / newDim.x)), Math.max(0, Math.min(1, (realCoord.y - offset.y) / newDim.y)));
	
	return new vec2(Math.round(imgDim.x * percent.x), Math.round(imgDim.y * percent.y));
}
// --------

// misc functions
// because web a shit, we'll have to get rid of useless shit it provides us, along with a few of our own things.
function filterNodes(nodes)
{
	var arr = [].slice.call(nodes.children); // thanks stackoverflow
	
	var loop = function(arr, regex)
	{
		for(var i = 0; i < arr.length; i++)
		{
			var node = arr[i];
			
			if(node.nodeType != 1 || node.tagName.search(regex) != -1)
			{
				arr.splice(i, 1);
				
				loop(arr, regex);
			}
		}
	}
	
	loop(arr, /H\d{1}|BR|SPAN|LABEL/g);
	
	return arr;
}

// just cuz i feel like wasting performance :^)
function friendlyId(input)
{
	return input.replace(/( |<|>)/g, "_").replace(/(\(|\)|\:|!)/g, "");
}

// will display a little message box or something next to the element that will display the error message..
function showError(element, message)
{
	if(!document.getElementById(friendlyId(message)))
	{
		var tempDiv = document.createElement("div");
		tempDiv.className = "error";
		tempDiv.innerHTML = message;
		tempDiv.id = friendlyId(message);
		
		element.appendChild(tempDiv);
		
		window.setTimeout(function()
		{
			tempDiv.remove();
		}, 10000);
	}
	else
	{
		console.log("DID IT!");
	}
}
// --------

function main()
{
	var img = document.getElementById("img");
	
	// dragndrop
	db = document.getElementById("dropbox");
	
	db.addEventListener("dragenter", dragEnter, false);
	
	db.addEventListener("dragexit", dragExit, false);
	
	db.addEventListener("dragover", stopDefault, false);
	
	db.addEventListener("drop", dropE, false);
}