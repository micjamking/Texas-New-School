/* 
 * Author: Mike King (@micjamking)
 */

_.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };


Express = {
	models: {},
	collections: {},
	views: {}
};


Express.config = {
	clientId: 	"8c27bb70a609423999e270bac8d09338",
	accessToken:"3384761.8c27bb7.53fed846c27c4d92ac4127625a7946b6",
	feedUrl: 	"https://api.instagram.com/v1/users/self/media/recent?access_token=",

	getAuthorizationUrl: function() {
		return _.template(this.authorizationUrl, {
			clientId: encodeURIComponent(this.clientId),
			accessToken: encodeURIComponent(this.accessToken),
			redirectUri: encodeURIComponent(this.redirectUrl)
		});
	},

	getAuthorizationUrl: function() {
		return "https://instagram.com/oauth/authorize/?client_id=" + this.clientId + "&redirect_uri=" + this.getRedirectUrl() + "&response_type=token"
	},

	getRedirectUrl: function() {
		return this.getRootUrl();
	},

	getRootUrl: function() {
		return window.location.origin;
	}
}


Express.storage = {
	getAccessToken: function() {
		return Express.config.accessToken;  // http://goo.gl/2ig2e
	},

	setAccessToken: function(token) {
		localStorage.setItem(Express.config.accessToken, token);
	},

	destroyAccessToken: function(token) {
		localStorage.clear();
	}
}


Express.models.Photo = Backbone.Model.extend({
	initialize: function() {
		//console.log('Photo initialized');
	}
});


Express.collections.Photos = Backbone.Collection.extend({
	model: Express.models.Photo,

	parse: function(response) {
		if (response.meta.code == 200) {
			return response.data;
		} else {
			new Express.views.ErrorView(response.meta);
		}
	}
});


Express.views.PhotoView = Backbone.View.extend({
	tagName: "li",
	className: "photo",

	initialize: function() {
		//console.log('PhotoView initialized');
	},

	render: function() {
		//console.log('PhotoView rendering');
		img 	= new Image();
		img.src = this.model.get('images').thumbnail.url;
		img.setAttribute("data-src-large", 	this.model.get('images').standard_resolution.url);
		img.setAttribute("data-src-medium", this.model.get('images').low_resolution.url);		
		img.setAttribute("data-src-anchor", this.model.get('link'));	
		img.setAttribute("data-src-artist", this.model.get('user').full_name);
		img.setAttribute("data-src-username", this.model.get('user').username);
		img.setAttribute("data-src-avatar", this.model.get('user').profile_picture);
		if (this.model.get('caption') !== null){ img.setAttribute("data-src-caption",this.model.get('caption').text); }
		
		span 			= document.createElement("span");
		span.innerHTML 	= this.model.get('likes').count;
		span.setAttribute('class', 'likes');
		
		i = document.createElement('i');
		i.setAttribute('class', 'foundicon-heart');
		
		this.$el.html(img).append(i).append(span).hide();
		
		return this;
	}
});


Express.views.PhotosView = Backbone.View.extend({
	tagName: "ul",
	id: "photo_container",
	template: "#photo_container",

	initialize: function() {
		//console.log('PhotosView initialized');
		var view = this;
		this.collection.fetch({
			dataType : 'jsonp',
			success: function(collection, response) { view.render(); },
			error: function(collection, response) {}
		});
		
		_.bindAll(this, 'render', 'afterRender'); 
		var _this = this; 
		this.render = _.wrap(this.render, function(render) { 
			render(); 
			_this.afterRender(); 
			return _this; 
		});
	},

	render: function() {
		//console.log('PhotosView rendering');
		$(this.el).append(_.template($(this.template).html(), {}));
		view = this;
		_.each(this.collection.models, function(photo) {
			var photoView = new Express.views.PhotoView({ model: photo });
			view.$el.append(photoView.render().el);
		});
		return this;
	},
		  
	afterRender: function() {
		//console.log('PhotosView completed');
		mediaQuery();
		setTimeout(function () {
			$('.loading').fadeOut(600, function(){
				$('.photo').fadeIn();
				if($(window).width() > 767){
					var wall = new Masonry( document.getElementById('photo_container'), {  
						isFitWidth: true,  
						gutterWidth: 4 
					});

					if(!($('body').hasClass('index'))){
						var avatar	= $('.photo:eq(0)').find('img').attr('data-src-avatar');
						$('.top-bar').find('.avatar').attr('src', avatar);
						$('.top-bar .avatar').fadeIn();
					}
				}

				/* Open instagram app on iPhone */
				$('.photo').on('touchstart', openInstagram);

				/* Open instagram on everything else mobile */
				$(document).on('click', '.photo', function(){
					if ( $(window).width() < 768 ){
						window.location.href = $(this).find('img').attr('data-src-anchor');
					}
				});

			});
		}, 1000);
	} 
});


Express.views.AuthorizeView = Backbone.View.extend({
	id: "authentication",
	template: "#authentication",

	initialize: function() {
		//console.log("Initialised AuthorizeView");
	},

	render: function() {
		this.$el.html(_.template($(this.template).html(), {
			authorizationUrl: Express.config.getAuthorizationUrl()
		}));
		return this;
	}
});


Express.views.ErrorView = Backbone.View.extend({
	initialize: function(meta) {
		switch(meta.error_type) {
			case 'OAuthAccessTokenException':
			error = "Express does not have permission to access your Instagram account. <a href='/'>Authenticate</a>"
			Express.storage.destroyAccessToken();
			break;
			default: error = "An unknown error occurred"
		}
		$('#main').html("<p>" + error + "</p>");
	}
});


function mediaQuery(){
	var browserWidth = $(window).width();

	$('.photo > img').each(function(){

		var $mobile  = $(this).attr('data-src-medium');
		var $tablet  = $(this).attr('data-src-large');
		var $desktop = $(this).attr('src');

		if ( browserWidth < 768 && browserWidth > 479 ){
			$(this).attr('src', $tablet);
			$('body').addClass('tablet');
		} else if ( browserWidth < 480 ) {
			$(this).attr('src', $mobile);
			$('body').addClass('mobile');
		} else {
			$(this).attr('src', $desktop);
			$('body').addClass('desktop');
		}
	});
}


function retina_init() {
	if(window.devicePixelRatio >= 1.25){
		var logo = $("img.logo");
		var src = $(logo).attr('src');
		src = src.replace(".png", "@2x.png");
		$(logo).attr('src', src);
	}
}


function openInstagram() {
	var normal = $(this).find('img').attr('data-src-anchor');
	var instagram = normal.replace("http://instagr.am/p/", "instagram://media?id=");
	instagram = instagram.substring(0, instagram.length - 1);

	$(this).on('touchend', function(e){
		if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))){
			console.log(instagram);
			window.location.href = instagram;
		} else {
			window.location.href = normal;
		}
		$(this).off('touchend');
	});

	$(this).on('touchmove', function(e){
		$(this).off('touchend');
	});     
}


jQuery(function($) {

	/* Hide Address bar on iOS */
	$(window).load(function () { setTimeout(function () { window.scrollTo(0, 1); }, 0); });
	
	/* Foundation & Modernizr  */
	var $doc = $(document), Modernizr = window.Modernizr;

	$(document).ready(function() {
		$.fn.foundationNavigation	? $doc.foundationNavigation() : null;
		$.fn.foundationTopBar       ? $doc.foundationTopBar() : null;
	});

	/* Change Logo for HD Displays */
	retina_init();
	
	/* Preloader */
	$('#container').append('<i class="loading"></i>');
	
	/* Foundation modal window */
	$(document).on("click", ".desktop .photo", function(){
		var src 		= $(this).find('img').attr('data-src-large');
		var link 		= $(this).find('img').attr('data-src-anchor');
		var avatar		= $(this).find('img').attr('data-src-avatar');
		var artist		= $(this).find('img').attr('data-src-artist');
		var username	= 'http://www.instagram.com/' + $(this).find('img').attr('data-src-username');
		
		$("#photoModal").reveal({
			animation: 'fade',
			open: function(){		
				$("#photoModal").find('.artwork').attr('src', src);
				$("#photoModal").find('.avatar').attr('src', avatar);
				$("#photoModal").find('.artist').text(artist).attr('href', username);
				$("#photoModal").find('.link').attr('href', link);
				$('#container').css('-webkit-filter', 'blur(3px)');
			},
			closed: function(){ 
				$("#photoModal").find('.artwork').attr('src', '');
				$("#photoModal").find('.avatar').attr('src', '');
				$("#photoModal").find('.artist').text('').attr('href', '');
				$("#photoModal").find('.link').attr('href', '');
				$('#container').css('-webkit-filter', 'none');
			}
		});
	});
	
	/* Navigation */
	$(document).on('click', '.dropdown li, .name a', function(){
		$('.dropdown li').removeClass('selected');
		$(this).addClass('selected');
	});

	/* Instagram User ID's */
	var $timsinknart	= 52638890,
		$thomaspage		= 21818000,
		$jeremymiller  	= 15994110,
		$ronstafari		= 20038052;

	/* Backbone: Routers (Navigation) */
	var Router = Backbone.Router.extend({
		routes: {
			"": 				"index",
			"timstafford":  	"timsinknart",
			"thomaspage": 		"thomaspage",
			"jeremymiller":   	"jeremymiller",
			"rongivens": 		"ronstafari",
			"texasnewschool": 	"texasnewschool"
		},

		initialize: function() {
			this.route(/^access_token=(.*?)$/, "access_token", this.access_token);
		},

		index: function(hash) {
			if (Express.storage.getAccessToken()) {
				$('.loading').fadeIn();
				$('body').addClass('index');
				var photos = new Express.collections.Photos();
				photos.url = 'https://api.instagram.com/v1/tags/texasnewschool/media/recent?access_token=' + Express.storage.getAccessToken() + '&count=-1';
				var view = new Express.views.PhotosView({ collection: photos });
				$("#main").html(view.el);
			} else {
				var view = new Express.views.AuthorizeView();
				$("#main").html(view.render().el);
			}
		},

		access_token: function(token) {
			Express.storage.setAccessToken(token);
			this.navigate('texasnewschool', { trigger: true });
		},

		texasnewschool: function() {
			$('body').addClass('index');
			$('.top-bar .avatar').fadeOut();
			$('.loading').fadeIn();
			var photos = new Express.collections.Photos();
			photos.url = 'https://api.instagram.com/v1/tags/texasnewschool/media/recent?access_token=' + Express.storage.getAccessToken() + '&count=-1';
			var view = new Express.views.PhotosView({ collection: photos });
			$("#main").html(view.el);
		},

		timsinknart: function() {
			$('body').removeClass('index');
			$('.top-bar .avatar').fadeOut();
			$('.loading').fadeIn();
			var photos = new Express.collections.Photos();
			photos.url = 'https://api.instagram.com/v1/users/' + $timsinknart + '/media/recent/?access_token=' + Express.storage.getAccessToken() + '&count=40';
			var view = new Express.views.PhotosView({ collection: photos });
			$("#main").html(view.el);
		},

		thomaspage: function() {
			$('body').removeClass('index');
			$('.top-bar .avatar').fadeOut();
			$('.loading').fadeIn();
			var photos = new Express.collections.Photos();
			photos.url = 'https://api.instagram.com/v1/users/' + $thomaspage + '/media/recent/?access_token=' + Express.storage.getAccessToken() + '&count=40';
			var view = new Express.views.PhotosView({ collection: photos });
			$("#main").html(view.el);
		},

		jeremymiller: function() {
			$('body').removeClass('index');
			$('.top-bar .avatar').fadeOut();
			$('.loading').fadeIn();
			var photos = new Express.collections.Photos();
			photos.url = 'https://api.instagram.com/v1/users/' + $jeremymiller + '/media/recent/?access_token=' + Express.storage.getAccessToken() + '&count=40';
			var view = new Express.views.PhotosView({ collection: photos });
			$("#main").html(view.el);
		},

		ronstafari: function() {
			$('body').removeClass('index');
			$('.top-bar .avatar').fadeOut();
			$('.loading').fadeIn();
			var photos = new Express.collections.Photos();
			photos.url = 'https://api.instagram.com/v1/users/' + $ronstafari + '/media/recent/?access_token=' + Express.storage.getAccessToken() + '&count=40';
			var view = new Express.views.PhotosView({ collection: photos });
			$("#main").html(view.el);
		}

	});

	router = new Router();

	if (!Backbone.history.start()) { $('body').html('404!'); }

});
