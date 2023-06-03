// auvitext-1.0.2
// --------------
// Author: Jens Grätzer
//
// Requires a second javascript file (e.g. "mediafile-text.js") with:
//   var mediafile = "mediafile.m4a";          // name of the audio or video file 
//   var subt      = [[],[],...];              // array of text + timestamps
//
// Version History:
//   1.0.2, - 2023-05-22 ... Progressbar improvement.
//   1.0.1, - 2023-05-24 ... Progressbar.
//   1.0.0, - 2023-05-01
//
// ------------------------------
// Example of the javascript file (e.g. "shakespeare-text.js"):
//
// var mediafile = "shakespeare.m4a";
// var subt = [
//	  ...
//    [02.103, 05.378, "To be or not to be,"],
//	  ...
// ];
//
// Every element in the subt array has: start-time (seconds), end-time (seconds), text (simple HTML).

"use strict";  //New in ECMAScript version 5, ignored by earlier ECMAScript versions

// Start everything at window.onload
window.onload = function () {
	console.log('window.onload - Event: Dokument ist geladen');

	// Connect to all the UI-Elements
	medieElem = document.getElementById("avtMedia");
	medieSource = document.getElementById('avtMediaSource');
	btnElemPrevious = document.getElementById("avtPreviousBtn");
	btnElemPlay = document.getElementById("avtPlayBtn");
	btnElemRepeat = document.getElementById("avtRepeatBtn");
	btnElemNext = document.getElementById("avtNextBtn");
	
	//textSubtitle = document.getElementById("avtSubtitle");
	//textProgress = document.getElementById("avtProgress");

	// Start colors (quick and dirty)
	btnElemPlay.style.backgroundColor= "#aaa";
	btnElemPrevious.style.backgroundColor= "#aaa";
	btnElemRepeat.style.backgroundColor= "#aaa";
	btnElemNext.style.backgroundColor= "#aaa";

	// Associate filename, given in var mediafile in the other javascript file
	//medieElem.pause();  // not needed
	medieElem.setAttribute('src', mediafile);
	medieElem.load();  // just preload the audio without playing. Still missing is ERROR feedback.

	// Add Event Listeners to button elements
	btnElemPrevious.addEventListener("click", previousSubtitle);
	btnElemPrevious.addEventListener("mousedown", downPreviousBtn);
	
	btnElemPlay.addEventListener("click", playMedia);
	btnElemPlay.addEventListener("mousedown", downPlayBtn);
	
	btnElemRepeat.addEventListener("click", repeatThisSubtitle);
	btnElemRepeat.addEventListener("mousedown", downRepeatBtn);
	
	btnElemNext.addEventListener("click", function () { nextSubtitle(false); });
	btnElemNext.addEventListener("mousedown", downNextBtn);
	
	// Start values
	document.getElementById("avtSubtitle").innerHTML = "";
	document.getElementById("avtProgress").innerHTML = "0";
	
	LastActualSubtIndex = -1;  // Starting with Index -1 means: The biginning Index 0 is still ahead
	if(subt.length > 0 &&  subt[0][0] < timerTickSek)
	{
		LastActualSubtIndex = 0;   // In case the first text is at 0s: This index is 0 instead of -1
	}

	// 'onplay' event controls the button color
	medieElem.onplay = function() {
		//alert("The Media has started to play");		// TEST
		if(RepeatSnapper) {
			btnElemRepeat.style.backgroundColor= "#ffff9b";   // yellow color
			btnElemPlay.style.backgroundColor= "#9bff9b";     // greenish color
		}
		else
			btnElemPlay.style.backgroundColor= "#9bff9b";     // greenish color
	}; 

	// 'pause' event controls the button color
	medieElem.onpause = function() {
		//alert("The video has been paused");
		btnElemPlay.style.backgroundColor= "#aaa";            // gray color
		btnElemRepeat.style.backgroundColor= "#aaa";
		btnElemNext.style.backgroundColor= "#aaa";
		btnElemPrevious.style.backgroundColor= "#aaa";
	}; 

	main();  // This is where it starts: checking the player position repeatedly, displaying the text for that position.
};

// Global variables for the UI elements
//var mediafile = "audiofile.m4a";  // Filename is to be delivered from second javascript file 
var medieElem;
var medieSource;
var btnElemPrevious;
var btnElemPlay;
var btnElemRepeat;
var btnElemNext;

/// More global variables
var LastActualSubtIndex;    	// Index of subt array of last shown text
var RepeatSnapper = false;		// TRUE during "repeat". Than the repeat button "shines" and the timer-handler waits for the end of play.
var RepeatStartTime = 0;				
var RepeatEndTime = 0;
var UtIndexShadow = -1;			// Index of subt array of the actual shown text
var timerTickSek = 0.10;		// Refresh-rate (in seconds) of the text. Should be no bigger than 0.3s. Smaller than 0.1s is not necessary.
var timerTickSekSecureDuration = timerTickSek * 1.1  // A slightly bigger time than timerTickSek

//// TEST: Output of all the text
//testOutputTitleArray(subt);

// Click-Handler of button "Play/Pause"
function playMedia() 
{ 
	console.log("BUTTON CLICK playMedia");   // TEST
	if(medieElem.paused)
	{
		medieElem.play();
	}
	else
	{
		medieElem.pause();
	}
}



// Click-Handler of button "Repeat this text"
function repeatThisSubtitle() 
{ 
	if(medieElem.paused)
	{
		console.log("BUTTON CLICK repeatThisSubtitle - if paused");  // TEST
		RepeatStartTime = subt[LastActualSubtIndex][0];
		RepeatEndTime = subt[LastActualSubtIndex][1];
		medieElem.currentTime = RepeatStartTime;
		RepeatSnapper = true;   // Activates checking the RepeatEndTime at every TimerTick
		medieElem.play();   // Starts playing. Checks the position with RepeatEndTime at every TimerTick, ends playing.
	}
	else if(RepeatSnapper == true)
	{
		RepeatSnapper = false;
		medieElem.pause();
	}

	//if(andJumpToNextOne)
	//	nextSubtitle(true);
}

// Click-Handler of button "Previous Subtitle"
function previousSubtitle() 
{
	btnElemPrevious.style.backgroundColor= "#aaa";		// gray color
	if(LastActualSubtIndex > 0)
	{
		console.log("BUTTON CLICK previous title");
		LastActualSubtIndex -= 1;
		medieElem.currentTime = subt[LastActualSubtIndex][0];

		if(RepeatSnapper == true)
			medieElem.pause();
		RepeatSnapper = false;
	}
}

// Click-Handler of button "Next Subtitle"
function nextSubtitle(andJumpToNextOne) 
{ 
	btnElemNext.style.backgroundColor= "#aaa";
	if(LastActualSubtIndex + 1 < subt.length)
	{
		console.log("BUTTON CLICK next title");   // TEST

			//console.log("_     LastActualSubtIndex=" + LastActualSubtIndex);  // TEST
		LastActualSubtIndex += 1;
			//console.log("_Next LastActualSubtIndex=" + LastActualSubtIndex);  // TEST
			//console.log("_Need medieElem.currentTime =" + subt[LastActualSubtIndex][0]);  // TEST
		medieElem.currentTime = subt[LastActualSubtIndex][0] + 0.001;  // mind the extra-time 0.001 seconds
			//console.log("_ Got medieElem.currentTime =" + medieElem.currentTime);  // TEST

		if(RepeatSnapper == true)
			medieElem.pause();
		RepeatSnapper = false;		
	}
}

// Long jump: 2 minutes foreward
function longForwardJump() 
{ 
	medieElem.currentTime += 120;
	
	if (RepeatSnapper == false){
		btnElemRepeat.style.backgroundColor= "#aaa";		// gray color
	}
	
}

// Long jump: 2 minutes backward
function longBackwardJump() 
{ 
	medieElem.currentTime -= 120;
	
	if(RepeatSnapper == false) {
		btnElemRepeat.style.backgroundColor= "#aaa";		// gray color
	}
}

function main() {
	// --- THE START: start the TimerTics
	// see: https://www.w3schools.com/js/js_timing.asp
	console.log('main() - Die Aktion beginnt hiermit.');
	var myVar = setInterval(myTimer, timerTickSek * 1000);  // setInterval uses milliseconds
}

function myTimer() 
{
	var currTime = medieElem.currentTime;
	//console.log("Time=" + currTime);   // TEST
	//document.getElementById("subTime").innerHTML = currTime;   // TEST

	// The additional Action at every TimerTick: Handeling the "Repeat Text", if RepeatSnapper==TRUE 
	if(RepeatSnapper)
	{
		if(currTime >= RepeatEndTime - timerTickSekSecureDuration)
		{
			//alert("TEST Stop repeat at RepeatEndTime");
			medieElem.pause();   // Stop repeat at RepeatEndTime
			//medieElem.currentTime = RepeatStartTime;  // if you want (not recommended): go to RepeatStartTime 
			RepeatSnapper = false;

			return; // do not proceed
		}
	}

	// The main action at every TimerTic
	var answerIndex = findIndexInSubs(currTime, subt);
	var answerText = "";
	if(answerIndex >= 0)
	{
		answerText = subt[answerIndex][2];
		LastActualSubtIndex = answerIndex;
	}
	//console.log(" OUTPUT: SrtText=" + answerText);  // TEST Output Text
	//document.getElementById("subTime").innerHTML = Math.round(currTime * 10)/10;  // TEST Output Time

	// Text output, if the text is different from previous TimerTick
	// (Therefore the UtIndexShadow is used)
	if(answerIndex != UtIndexShadow)
	{	
		//document.getElementById("subIndex").innerHTML = answerIndex;  // TEST
		var answerIndexShow = 0;
		if (answerIndex <=0)
			answerIndexShow = 0;
		else
			answerIndexShow = answerIndex;
					
		document.getElementById("avtSubtitle").innerHTML = answerText;
		if(answerIndex >= 0) {
			var percentage = Math.round((answerIndex + 1)/subt.length * 100)
			document.getElementById("avtProgress").innerHTML = percentage;
			//document.getElementById("avtProgressbar").innerHTML = '<div id="avtBar" width="' + percentage + '%"></div>';

			var txt1 = '<div id="avtProgressbarGround"></div><div id="avtProgressbarProgress" style="width: ';
			var txt2 = '%"></div>';
			document.getElementById("avtProgressbar").innerHTML = txt1 + percentage + txt2;
		}
		
		UtIndexShadow = answerIndex;
	}
}
//console.log("Still functioning after 'function myTimer()'");

/// Returns the text-array-index in subt array for the given position. If not found: Returns -2. 
/// (Very simple search: Running over every array element. TODO: Use a smarter search algorithm!)
function findIndexInSubs(position, subtArr) 
{
	var answerIndex = -2;  // Returning -2 signals, that search not successfull.
	for(var i = 0; i<subtArr.length; i++)
	{
		if(position >= subtArr[i][0] && position < subtArr[i][1])
		{
			//console.log(" SrtText=" + subtArr[i][2]);   // TEST
			answerIndex = i;
			break;
		}
	}
	return(answerIndex);
}

/// TEST: Output of the complete subtArr
//function testOutputTitleArray(subtArr) 
//{
//	for(var i = 0; i<subtArr.length; i++)
//	{
//		console.log("[" + i + "] " + subtArr[i][0] + "~"+ subtArr[i][1] + " "+ subtArr[i][2]);
//	}
//}

// Nice buttons: Recolor the buttons on MouseDown events
function downPreviousBtn(subtArr) 
{
	btnElemPrevious.style.backgroundColor= "#9bff9b";
}

function downNextBtn(subtArr) 
{
	btnElemNext.style.backgroundColor= "#9bff9b";
}

function downPlayBtn(subtArr) 
{
	btnElemPlay.style.backgroundColor= "#9bff9b";
	RepeatSnapper = false;
	// undo the color is done in the play-event of the mediaplayer
}

function downRepeatBtn(subtArr) 
{
	if(medieElem.paused)
		btnElemRepeat.style.backgroundColor= "#9bff9b";
		// undo the color is done in the play-event of the mediaplayer
}

// Nice buttons: Recolor the buttons on Keyboard events, matching the mouse events behavior
//... see: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
document.addEventListener('keydown', (event) => {
	const keyName = event.key;

	document.activeElement.blur();	// COOL TRICK: Remove fokus from the actual focussed element, so it will not be trigered.

	//if (keyName === 'Control') {
	//	// do nothing when only Control key is pressed.
	//	return;
	//}

	if (event.ctrlKey) {
		// Even though event.key is not 'Control' (e.g., 'a' is pressed),
		// event.ctrlKey may be true if Ctrl key is pressed at the same time.
		////alert('Combination of ctrlKey + ${keyName}');   // WTF is ${...}?
		//alert('Combination of ctrlKey #' + keyName + '#');
	} else {
		//alert('Key pressed ${keyName}');   // WTF is ${...}?
		//alert('Key pressed #' + keyName + '#');
		
		if(keyName == 'ArrowLeft') {
			btnElemPrevious.style.backgroundColor= "#9bff9b";
		}

		if(keyName == 'ArrowRight') {
			btnElemNext.style.backgroundColor= "#9bff9b";
		}

		// Play-Repat at ArrowDown key
		if(keyName == 'ArrowDown') {
			btnElemPlay.style.backgroundColor= "#9bff9b";
			RepeatSnapper = false;
			// undo the color is done in the play-event of the mediaplayer
		}
		
		// Repat the actual title at ArrowUp key
		if(keyName === 'ArrowUp')
			if(medieElem.paused)
				btnElemRepeat.style.backgroundColor= "#9bff9b";
				// undo the color is done in the play-event of the mediaplayer
	}
}, false);

// Keyboard-Events "KeyUp" trigger the actions similar to the mouse events
document.addEventListener('keyup', (event) => {
	const keyName = event.key;
	
	// As the user releases the Ctrl key, the key is no longer active,
	// so event.ctrlKey is false.
	//if (keyName === 'Control') {
	//	//alert('Control key was released');
	//}				

	if(keyName == 'ArrowDown')   // if(keyName == ' ') ... für Space-Taste
		playMedia();
		
	// Bei Kursor-Hoch (bei Pause) den aktuellen Titel abspielen
	if(keyName === 'ArrowUp')
		repeatThisSubtitle();

	// Bei Kursor-Links: Titel-Zurücksprung
	if(keyName === 'ArrowLeft') {
		previousSubtitle();
	}

	// Bei Kursor-Links: Titel-Vorwärtssprung
	if(keyName === 'ArrowRight') {
		nextSubtitle(false);
	}

	// Bei PageDown Taste: Großer Vorwärtssprung im Media-Abspiel
	if(keyName === 'PageDown')
		longForwardJump();

	// Bei PageUp Taste: Großer Rückwärtssprung im Media-Abspiel
	if(keyName === 'PageUp')
		longBackwardJump();
}, false);
