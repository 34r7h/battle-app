var UI = {
	base: {
		init: function() {
			$('body').fadeIn(500);
				//StatusBar.hide();
				
			if(Platform.isDesktop()) {
				//do desktop stuff here
				$('body')
					.addClass("desktop")
					.addClass("platform_browser");
			} else {
				//do app stuff here
				if(Platform.isIOS()) {
					$('body').addClass("app platform_ios");
				} else if(Platform.isAndroid()) {
					$('body').addClass("app platform_android");
				} else {
					$('body').addClass("app platform_unkown");
				}
			}

			//resize the game
			UI.base.resize();
		},

		repositionMenu: function() {
			var margin = ($(window).height() - ($('#header').height() + 5) - $('#page_game').height() - $('#navigation_wrapper').height()) / 2;
			$('#header').animate({"margin-bottom": margin}, "fast");
		},

		resize: function() {
			//set the new classes
			if(Platform.getWidth() == 640) {
				var height = $(window).height();//-(Platform.isIOS() ? 20 : 0);
				$('#main_wrapper').css("height", height);
				$('body').height(height);

				$('#header').css("margin-bottom", 10);

				$('body').removeClass("screen_ldpi").addClass("screen_hdpi");
				$('#navigation_wrapper').css("left", "auto");
			} else {
				var height = $(window).height();//-(Platform.isIOS() ? 20 : 0);
				$('#main_wrapper').css("height", height);
				$('body').height(height);

				/*var pageHeight = $('.page.current').height();*/

				//$('#total_wrapper').css("height", $('body').height()  - (Platform.isIOS() ? 20 : 0));
				$('body').removeClass("screen_hdpi").addClass("screen_ldpi");
				$('#navigation_wrapper').css("left", ($('#main_wrapper').width() - 310)  / 2);
			}
			
			if(Platform.isIOS()) {
				$('#main_wrapper').height($('#main_wrapper').height()-20);
				$('body').height($('body').height()-20);
			}

			//resize all images
			UI.base.resizeImages();

			for(var i in UI) {
				if(i != "base" && i != "swipe" && UI[i].resize !== undefined) {
					UI[i].resize();
				}
			}
		},

		resizeImages: function() {	
			$('img').each(function(){
				if(!$(this).hasClass("no-resize")) {
					var src = $(this).attr("src");
					var ext = src.substring(src.lastIndexOf("."));
					src = src.substring(0, src.lastIndexOf("_"))
					
					if(Platform.getWidth() == 640) {
						src += "_hdpi" + ext;
					} else {
						src += "_ldpi" + ext;
					}

					//set the new src
					$(this).attr("src", src);
				}
			});
		}
	},

	swipe: {
		resize: function() {
			if(Platform.isTouchDevice()) {
				var off = $('#page_game').offset();
				var sh = $(window).height() - off.top - $('#navigation_wrapper').height();

				if(Platform.isIPad()) {
					sh -= 20;
				}
				
				$('#swipe_overlay')
					.width($(window).width())
					.css("top", off.top)
					.height(sh);
			}
		},
		hide: function() {
			$('#swipe_overlay').hide();
		},
		show: function() {
			if(Platform.isTouchDevice()) $('#swipe_overlay').show();
		}
	},

	overlay: {
		init: function() {
			UI.overlay.resize();
		},
		
		resize: function() {
			$('#loading_overlay img')
				.css("left", ($(window).width() - $('#loading_overlay img').width()) / 2)
				.css("top", ($(window).height() - $('#loading_overlay img').height()) / 2);
		},
		
		show: function(){
			$('#loading_overlay').show();
		},

		hide: function(){
			$('#loading_overlay').hide();
		}
	},

	highscore: {
		game: null,
		init: function(g) {
			UI.highscore.game = g;
		},
		getQuartes: function() {
			var month = new Date().getMonth() + 1;
			var quarters = 1;

			if(month >= 4) quarters = 2;
			if(month >= 7) quarters = 3;
			if(month >= 10) quarters = 4;

			return quarters;
		},

		createHistoryLinks: function(years) {
			var _self = this;
			//sort the years descending
			years.sort(function(a,b){
				if(a > b) return -1;
				else if(a < b) return 1;
				else return 0;
			});

			//create the wrapper
			var wrapper = $('<div>')
				.addClass("history_wrapper");

			//iterate through the array
			for(var i in years) {

				//create the list
				$("<span>")
					.addClass("link link_history history_year_" + years[i])
					//.append($("<span>").addClass("year").text(data.years[i]))
					.text(years[i])
					.click(function(){
						//get the version
						var version = ""+$(this).parent().parent().parent().attr("id");
						version = version.substring(version.lastIndexOf("_")+1);

						//get the year
						var year = $(this).text();
						$('#highscore_list')
								.html("")
								.attr("class","")
								.addClass("highscore_year_" + year + " game_version_" + version)
								.append(UI.highscore.createBackLink())
								.append(UI.highscore.createQuarterLinks());

						//load the highscores
						_self.game.getHighscore().getList(version, year, 1, function(data){
							$('#highscore_list').append(UI.highscore.createList(data).addClass("quarter quarter_1"));
							if(data.length == 0) {
								$('.link_quarter_1').remove();
								$('.link_quarter_spacer_1').remove();
							}

							_self.game.getHighscore().getList(version, year, 2, function(data){
								$('#highscore_list').append(UI.highscore.createList(data).addClass("quarter quarter_2"));
								if(data.length == 0) {
									$('.link_quarter_2').remove();
									$('.link_quarter_spacer_2').remove();
								}

								_self.game.getHighscore().getList(version, year, 3, function(data){
									$('#highscore_list').append(UI.highscore.createList(data).addClass("quarter quarter_3"));
									if(data.length == 0) {
										$('.link_quarter_3').remove();
										$('.link_quarter_spacer_3').remove();
									}
							
									_self.game.getHighscore().getList(version, year, 4, function(data){
										$('#highscore_list').append(UI.highscore.createList(data).addClass("quarter quarter_4"));
										if(data.length == 0) {
											$('.link_quarter_4').remove();
											$('.link_quarter_spacer_4').remove();
										}

										switchPage(_self.game, $('#page_highscore_list'), function(){
											//show the first
											$('.link_quarter').first().click();
										});
									});
								});
							});
						});
					})
					.appendTo(wrapper);
			}

			return wrapper;
		},

		createList: function(data, top) {
			var wrapper = $('<ul>')
				.addClass("highscore-list");

			top = top || false;
			if(top) wrapper.addClass("highscore-list-top3");

			var index = 0;
			for(var i in data) {
				if((top == true && index < 3) || top == false) {
					(function(data, index) {
						var node = $("<li>").addClass("position_" + (index+1));
						node.append($("<span>").addClass("icon"));
						if(top) {
							node.append($("<span>").addClass("name").text(data.name));
						} else {
							node.append($("<span>").addClass("name").text((index < 9 ? "0" : "") + (index+1) + ". " + data.name));
						}
						node.append($("<span>").addClass("score").text(data.score));
						node.appendTo(wrapper);
					})(data[i], index);
				}
				index++;
			}

			return wrapper;
		},

		createBackLink: function() {
			return $('<span>')
				.addClass("link link_back")
				.text("Zurück")
				.click(function(){
					switchPage(UI.highscore.game, $('#page_highscore'));
				});
		},

		createQuarterLinks: function(year) {
			var wrapper = $('<div>').addClass("quarter_link_wrapper");
			var quarters = 4;

			if(parseInt(year) == new Date().getFullYear()){
				quarters = UI.highscore.getQuartes()
			}

			for(var i = quarters; i > 0; i--) {
				(function(i){
					$('<span>')
						.addClass("link link_quarter link_quarter_" + i)
						.text("Quartal " + i)
						.click(function(){
							//UI.highscore.load(i);
							$('.link_quarter.active').removeClass("active");
							$('.quarter.active').removeClass("active");
							$('.quarter_' + i).addClass("active");
							$(this).addClass("active");
						})
						.appendTo(wrapper);

					$('<span>')
						.addClass("link_quarter_spacer link_quarter_spacer_" + i)
						.text("::")
						.appendTo(wrapper);
				})(i);
			}

			return wrapper;
		},

		createBestEverLink: function() {
			return $('<span>')
				.addClass("link link_best_ever")
				.text("")
				.click(function(){
					//get the version
					var version = ""+$(this).parent().parent().attr("id");
					version = version.substring(version.lastIndexOf("_")+1);

					UI.highscore.game.getHighscore().getBestEver(version, function(data){
						$('#highscore_list')
							.html("")
							.append(UI.highscore.createBackLink())
							.append(UI.highscore.createList(data));
							switchPage(UI.highscore.game, $('#page_highscore_list'));
					});
				});
		}
	},

	hints: {
		init: function() {
			var wrapper = $("<ul>")
				.addClass("hints");

			var aryHints = [{"type":"desktop","msg":"Für ein verbessertes Spielerlebnis wird empfohlen alle offenen Browserfenster und Tabs zu schließen."},
							{"type":"both","msg":'Probleme bei Spielen? Sag uns, was nicht passt: Per Mail oder unter <a href="#" onclick="window.open(\'http://www.grammatidis.de/kontakt/lob-und-tadel.html\',\'_system\')">Lob & Tadel.</a>'}];
			var currentHint = 0;
			var time = 10*1000;
			var cnt = 0;

			for(var i = 0; i < aryHints.length; i++) {
				if(   (Platform.isApp() && aryHints[i].type == "app") 
					|| (Platform.isDesktop() && aryHints[i].type == "desktop") 
					|| aryHints[i].type == "both") {
					var node = $('<li>').addClass("hint").attr("id","hint_" + i).appendTo(wrapper).append($("<p>").html(aryHints[i].msg));
					cnt++;
				}
			}
			$('.hint').first().show();

			function nextHint() {
				if(currentHint == cnt-1) {
					next = 0;
				} else {
					next = currentHint+1;
				}

				$(wrapper.find("li")[currentHint]).fadeOut();//.removeClass();
				$(wrapper.find("li")[next]).fadeIn();
				setTimeout(function(){
					currentHint = next;
					nextHint();
				}, time);

			}
			//if(cnt > 1) {
				setTimeout(function(){
					nextHint();
				}, time);
			//}
			$('#page_main .page_inner_wrapper').append(wrapper);
		}
	},

	progress: {
		init: function() {
			UI.progress.resize();
		},

		update: function(total, current) {		
			var step = ($('.loading_bar_wrapper').width()-20) / total;
			$('#loading_status').text("Loading..." + parseInt(current /  (total / 100)) + "%");
			$('.loading_bar').css("width", step*current);
		},

		resize: function() {
			var width = Platform.getWidth();

			$("#loading")
				.css("width", width)
				.css("left", ($(window).width() - $("#loading").width()) / 2)
				.css("top", ($(window).height() - $("#loading").height()) / 2);
		}
	},

	intro: {
		play: function(game, callback) {
			var padding = (game.getResolution() == Constants.RESOLUTION_HIGH ? 10 : 3);
			var introDone = false;
			var width = $(window).width();

			$('#intro_wrapper div').each(function(){
				$(this)
					//.css("top", ($(document).height() - $(this).height()) / 2)
					.css("left", (width - $(this).width()) / 2 - padding);
			});

			$('#intro_2')
				.show()
				.css("left", -1*$('#intro_2').width())
				.animate({
					"left": (((width - $('#intro_2').width()) / 2) - padding)
				}, 1400);

			var start = new Date().getTime();
			$('#intro_1').delay(800).fadeIn(1500);
			$('#intro_3').delay(800).fadeIn(1500, function(){
				setTimeout(function(){
					var end = new Date().getTime();
					introDone = true;
					if(callback) callback();
				}, 500);
			});

			//warning message
			setTimeout(function(){
				if(introDone == false) {
					$('#info_performance').show();
					setTimeout(function(){
						$('#info_performance').hide();
					}, 3000);
				}
			}, 3000);
		}
	},

	theme: {
		init: function() {
			//get the theme 
			var strTheme = localStorage.getItem("theme");
			if(strTheme === undefined || strTheme == null || strTheme == "") {
				strTheme = "classic";
			}

			//set the theme classes
			$('body').addClass("theme_" + strTheme);
		}
	},

	dialog: {
		init: function(){
			UI.dialog.resize();
		},

		resize: function() {
			$('.dialog').each(function(){
				$(this)
				.css("left", ($(window).width() - $(this).width()) / 2)
				.css("top", ($(window).height() - $(this).height()) / 2)
				.hide();
			});
		},

		resizeById: function(id){
			$(id)
				.css("left", ($(window).width() - $(id).width()) / 2)
				.css("top", ($(window).height() - $(id).height()) / 2)
				.hide();
		},

		show: function(id, positive, negative) {
			UI.dialog.resizeById(id);

			positive = positive || function() {
				UI.dialog.hide(id);
			};

			negative = negative || function() {
				UI.dialog.hide(id);
			};

			$(id).find(".positive_button").unbind("click").click(function(){
				positive();
			});

			$(id).find(".negative_button").unbind("click").click(function(){
				negative();
			});

			$(id).show();
		},

		hide: function(id) {
			$(id).hide();
		},

		hideAll: function(){
			$('.dialog').each(function(){
				UI.dialog.hide(this);
			});
		}
	}
}