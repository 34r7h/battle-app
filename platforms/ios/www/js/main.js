var switchPageTo;
var lastPage, currentPage, currentPageId;

function realSwitchPage(to, callback) {
	var from = $('.page.current');

	//hide all dialogs
	UI.dialog.hideAll();

	//save the last page
	lastPage = from;
	from.fadeOut(function(){
		from.removeClass("current");
	});
	
	$(to).show().find('.content_pane').height($(to).find('.page_double_border').height());
	//var scroll = $(to).find('.content_pane').jScrollPane();

	if(to.attr("id") == "page_game") {
		UI.swipe.show();
		UI.swipe.resize();
	} else {
		UI.swipe.hide();
	}

	$(to).hide().fadeIn(function(){
		currentPage = to;
		currentPageId = to.attr("id");
		$(to).addClass("current");
		if(callback) callback();
	});
}

function switchPage(game, to, callback){
	var from = $('.page.current');

	if(to[0] != from[0]) {
		if(game.isActive()) {
			//switchPageTo = to;
			UI.dialog.show('#alert_dialog', function(){
				game.stop(true);
				realSwitchPage(to, callback);
				UI.dialog.hide('#alert_dialog');
			});
		} else {
			realSwitchPage(to, callback);
		}
	}
}

function initButtons(game) {
	var audio = game.getAudio();

	//on header click goto website
	$('.header_logo img').click(function(){
		window.open('http://www.grammatidis.de/', '_system');
		//document.location = "http://www.grammatidis.de/";
	});

	// QUICK FIX: iOS Sound Problems -> Remove Sounds from App Version
	/*if(Platform.isApp()) {
		$('.icon_sound').remove();
		$('.sound_settings').remove();
	} else {*/
		//sound icon top left
		$('.icon_sound').click(function(){
			audio.toggleSound();

			if(audio.isDisabled()) $(this).addClass("disabled");
			else $(this).removeClass("disabled");
		});

		if(audio.isDisabled()) $('.icon_sound').addClass("disabled");
		else $('.icon_sound').removeClass("disabled");
	//}
	
	//sound icon top left
	$('.icon_playpause').click(function(){
		if(game.isPaused()) {
			game.start();
			$(this).removeClass("paused");
		} else {
			game.pause();
			$(this).addClass("paused");
		}
	});

	$('#navi_home').click(function(){
		switchPage(game, $('#page_main'));
	});

	$('#start_button, #navi_start').click(function(){
		switchPage(game, $('#page_game'));

		//start the game
		game.start(function(newHighscore, hasQuit){

			//check if a new highscore was reached
			if(newHighscore) {

				//set the values
				$('#highscore_dialog #score').text(game.getHighscore().getScore());
				$('#highscore_dialog #position').text(game.getHighscore().getScorePosition());

				UI.dialog.show('#highscore_dialog', function(){
					if($('#highscore_name').val() != "") {
						UI.dialog.hide('#highscore_dialog');

						//save the score
						game.getHighscore().save($('#highscore_name').val(), $('#score').val(), function(error){
							if(error) {
								$('#highscore_name').val("");
								if(error.code == 200) {
									UI.dialog.show('#no_new_highscore', function(){
										$('#navi_highscore').click();
									});
								} else if(error.code == 100) {
									UI.dialog.show('#old_version', function(){
										$('#navi_highscore').click();
									});
								} else {
									UI.dialog.show('#unkown_error', function(){
										$('#navi_highscore').click();
									});
								}
							} else {
								$('#highscore_name').val("");
								$('#navi_highscore').click();
							}
						});
					}
				}, function(){
					UI.dialog.hide('#highscore_dialog');
					$('#highscore_name').val("");
					$('#navi_highscore').click();
				});
			} else {
				if(hasQuit == true) {
					if(game.switchPage != true) {
						$('#navi_home').click();
					}
				} else {
					UI.dialog.show('#no_highscore');
					$('#navi_home').click();
				}
			}
		});
	});

	$('#highscore_button, #navi_highscore').click(function(){
		if(currentPage.attr("id") != "page_highscore" && currentPage.attr("id") != "page_highscore_list") {
			if(Platform.hasConnection()) {
				game.getHighscore().getSummary(1, function(data) {
					$('#highscore_version_1 .highscore_history').html("").append(UI.highscore.createHistoryLinks(data.years));
					$('#highscore_version_1 .highscore_right.best_ever').html("").append(UI.highscore.createBestEverLink());

					game.getHighscore().getSummary(2, function(data) {
						$('#highscore_version_2 .highscore_history').html("").append(UI.highscore.createHistoryLinks(data.years));
						$('#highscore_version_2 .highscore_right.best_ever').html("").append(UI.highscore.createBestEverLink());
		
						if(data.top.length > 0) {
							$('#highscore_version_2 .highscore_top_3').html("").append(UI.highscore.createList(data.top, true));
						} else {
							$('#highscore_version_2 .highscore_top_3').html("<h2>Noch keine Highscores für diese Quartal vorhanden!</h2><br><br>");
						}
						
						//game.getHighscore().getList(2, new Date().getFullYear(), Helper.highscore.getQuartes(), function(data){
							//switchPage($('#page_highscore'));

						$('#highscore_version_2 .highscore_history .link_history').first().click();
						//});
					});
				});
			} else {
				$('#connection_dialog').show();
			}
		}
	});
	
	$('#rules_button, #navi_rules').click(function(){
		switchPage(game, $('#page_rules'));
	});
	
	$('#navi_settings').click(function(){
		switchPage(game, $('#page_settings'));
	});

	$('#navi_more, .icon_info').click(function(){
		switchPage(game, $('#page_more'));
	});

	$('.icon_close').click(function() {
		if($(lastPage).attr("id") == "page_game") {
			switchPage(game, $('#page_main'));
		} else {
			switchPage(game, $(lastPage));
		}
	});
}

function initSettingsPage(game) {

	//setttings
	$('#music_wrapper span, #music_wrapper .icon_music').click(function(){
		$('#music_wrapper .selected').removeClass("selected");
		var strMusic = $(this).parent().addClass("selected").attr("id");
		strMusic = strMusic.substring(strMusic.lastIndexOf("_")+1);	
		var audio = game.getAudio();

		audio.disableSound(function(){
			setTimeout(function(){
				game.saveSettings("music", strMusic);
				audio.enableSound();
			}, 200);
		});
	});
	
	$('#background_wrapper span, #background_wrapper .background_icon').click(function(){
		$('#background_wrapper .selected').removeClass("selected");
		$(this).parent().addClass("selected");
		var strTheme = $(this).parent().attr("id");
		strTheme = strTheme.substring(strTheme.lastIndexOf("_") +1);

		//and set it
		$('body')
			.removeClass("theme_classic")
			.removeClass("theme_techno")
			.removeClass("theme_smile")
			.removeClass("theme_pattern")
			.addClass("theme_" + strTheme);

		game.saveSettings("theme", strTheme);
	});
	
	$('#hero_wrapper span, #hero_wrapper .player_icon').click(function(){
		$('#hero_wrapper .selected').removeClass("selected");
		var strPlayer = $(this).parent().addClass("selected").attr("id");
		strPlayer = strPlayer.substring(strPlayer.lastIndexOf("_")+1);

		game.saveSettings("player", strPlayer);
	});


	if(game.getSetting("music") === null) {
		game.saveSettings("music", "dance")
	}

	if(game.getSetting("theme") === null) {
		game.saveSettings("theme", "classic")
	}

	if(game.getSetting("player") === null) {
		game.saveSettings("player", "boy")
	}

	$('#music_' + game.getSetting("music")).addClass("selected");
	$('#theme_' + game.getSetting("theme")).addClass("selected");
	$('#player_' + game.getSetting("player")).addClass("selected");
}

//init the game
function initGame(game, callback) {
	var audio = null;
	var canvas = null;
	
	//destroy game if it was already initialized
	if(game !== undefined) {
		canvas = game.getCanvas();
		audio = game.getAudio();
		game.destroy();
	} else {
		game = new Game($("#game_wrapper")[0]);
	}
	var blnReload = audio == null ? false : true;

	//init the game
	//game = new Game($("#game_wrapper")[0]);
	game.setCanvas(canvas);
	game.setAudio(audio);
	game.init();
	game.onStateChange(function(state){
		if(state == Constants.RUNNING || state == Constants.PAUSED) {
			$('.icon_playpause').css("visibility","visible");
		} else {
			$('.icon_playpause').css("visibility","hidden");
		}
	});

	//QUICK FIX: iOS Sound Problem -> deactivate sounds in App
	/*if(Platform.isApp()) {
		game.getAudio().disableSound();
	}*/

	//add the onload handler
	game.onLoadProgress(function(a,b) {
		UI.progress.update(a,b);
	});

	game.onQuit(function(){
		switchPage(game, $('#page_main'));
	});

	game.loadResources(blnReload, function(){
		callback(game);
	});

	UI.highscore.init(game);
}

//on startup
onStart(function() {
	var game;
	if(!Platform.isCanvasSupported() || (Platform.isSafari() && Platform.detectOS() == "Windows") || (Platform.isInternetExplorer() && Platform.getVersion() < 10)) {
		document.location = "/notsupported.html";
	} else if(!Platform.isApp() && Platform.isTouchDevice()) {
		document.location = "/getapp.html";
	} else {
		try {

			//init the basic user interface
			UI.base.init();

			//init the game theme
			UI.theme.init();

			//init the loading bar
			UI.progress.init();

			//init the loading bar
			UI.hints.init();

			//init the dialogs
			UI.dialog.init();

			//handle window resize
			$(window).resize(function(){
				if(!$('#main_wrapper').is(":visible")) {
					UI.progress.resize();
				} else {
					if(currentPageId == "page_main") {
						//show the loader
						UI.overlay.show();

						//fixes issues with scrollbars
						setTimeout(function(){
							//resize the window
							UI.base.resize();
							UI.base.repositionMenu();

							//reinitalize the game
							initGame(game, function(g){
								game = g;
								
								setTimeout(function(){
									//hide the loading dialog
									UI.overlay.hide();
								}, 500);
							});
						}, 100);
					} else {
						//show the resize confirmation dialog
						UI.dialog.show("#resize_confirm", function(){
							//show the loader
							UI.overlay.show();

							//stop the game
							game.stop();

							//hide this dialog
							UI.dialog.hide("#resize_confirm");

							//switch the page
							switchPage(game, $('#page_main'), function(){

								//resize the window
								UI.base.resize();
								UI.base.repositionMenu();

								//reinitalize the game
								initGame(game, function(g){
									game = g;

									setTimeout(function(){
										//hide the loading dialog
										UI.overlay.hide();
									}, 500);
								});
							});
						}, function(){
							//hide the dialog
							UI.dialog.hide("#resize_confirm");
						});
					}
				}
			});

			//init the game & load all resources
			initGame(game, function(g){
				game = g;
				//hide the progress bar
				$('#loading').fadeOut();

				//init the click handler for the settings page
				initSettingsPage(game);

				//initalize the navigation & all buttons
				initButtons(game);

				//play the intro
				UI.intro.play(game, function(){
					//switch to main page
					switchPage(game, $('#page_main'));
					
					//hide the the intro & fade in the main content 
					$('#main_wrapper').fadeIn(function(){

						//resize again
						UI.base.repositionMenu();

						$('#intro_wrapper').hide();

						//check if we have a network connection
						if(Platform.hasConnection() == false) {
							UI.dialog.show('#connection_dialog');
						}
					});

					//play the background music
					if(game.getSetting("music") == "original") {
						game.getAudio().play(game.getSetting("music"), false, 0.2);
					} else {
						game.getAudio().play(game.getSetting("music"), true, 0.2);
					}
				});
			});
		}catch(ex) {
			console.log(ex);
			//catch all exceptions
			var trace = printStackTrace({e: ex});
			$('#exception .stack').html(ex.toString() + "<br>"+ trace);
			$('#exception').show();
		}
	}
});