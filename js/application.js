_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

// Define a namespace
Express = {
  models: {},
  collections: {},
  views: {}
};


Express.config = {
  clientId: "8c27bb70a609423999e270bac8d09338",
  feedUrl: "https://api.instagram.com/v1/users/self/media/recent?access_token=",

  getAuthorizationUrl: function() {
    return _.template(this.authorizationUrl, {
      clientId: encodeURIComponent(this.clientId),
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
    return localStorage.getItem('accessToken'); // null if doesn't exist
  },

  setAccessToken: function(token) {
    localStorage.setItem('accessToken', token);
  },

  destroyAccessToken: function(token) {
    localStorage.clear();
  }
}


Express.models.Photo = Backbone.Model.extend({
  initialize: function() {
    console.log('Photo initialized');
  },
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

  tagName: "div",
  className: "photo",

  initialize: function() {
    console.log('PhotoView initialized');
  },

  render: function() {
    console.log('PhotoView rendering');
    img = new Image();
    img.src = this.model.get('images').thumbnail.url;
    this.$el.html(img);
    return this;
  }
});


Express.views.PhotosView = Backbone.View.extend({

  id: "photo_container",
  template: "#photo_container",

  initialize: function() {
    console.log('PhotosView initialized');
    var view = this;
    this.collection.fetch({
      dataType : 'jsonp',
      success: function(collection, response) {
        view.render();
      },
      error: function(collection, response) {}
    });
  },

  render: function() {
    console.log('PhotosView rendering');
    $(this.el).append(_.template($(this.template).html(), {}));
    view = this;
    _.each(this.collection.models, function(photo) {
      var photoView = new Express.views.PhotoView({ model: photo });
      view.$el.append(photoView.render().el);
    });
    return this;
  }
});


Express.views.AuthorizeView = Backbone.View.extend({
  id: "authentication",
  template: "#authentication",

  initialize: function() {
    console.log("Initialised AuthorizeView");
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
        default:
          error = "An unknown error occurred"
    }
    $('#main').html("<p>" + error + "</p>");
  }
});


jQuery(function($) {
 
  var $timsinknart 	= 52638890,
	  $thomaspage	= 21818000,
	  $jeremymiller  = 15994110,
	  $ronstafari	= 20038052;

  var Router = Backbone.Router.extend({
    routes: {
      "": 				"index",
      "timsinknart":  	"timsinknart",
      "thomaspage": 	"thomaspage",
      "jeremymiller":   "jeremymiller",
	  "ronstafari": 	"ronstafari",
	  "texasnewschool": "texasnewschool"
    },

    initialize: function() {
      this.route(/^access_token=(.*?)$/, "access_token", this.access_token);
    },

    index: function(hash) {
      if (Express.storage.getAccessToken()) {
        this.navigate('texasnewschool', { trigger: true });
      } else {
        var view = new Express.views.AuthorizeView();
        $("#main").html(view.render().el);
      }
    },

    access_token: function(token) {
      Express.storage.setAccessToken(token);
      this.navigate('photos', { trigger: true });
    },

    texasnewschool: function() {
      var photos = new Express.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/tags/texasnewschool/media/recent?access_token=' + Express.storage.getAccessToken() + '&count=-1';
      var view = new Express.views.PhotosView({ collection: photos });
      $("#main").html(view.el);
    },

    timsinknart: function() {
      var photos = new Express.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/users/' + $timsinknart + '/media/recent/?access_token=' + Express.storage.getAccessToken() + '&count=-1';
      var view = new Express.views.PhotosView({ collection: photos });
      $("#main").html(view.el);
    },

    thomaspage: function() {
      var photos = new Express.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/users/' + $thomaspage + '/media/recent/?access_token=' + Express.storage.getAccessToken() + '&count=-1';
      var view = new Express.views.PhotosView({ collection: photos });
      $("#main").html(view.el);
    },

    jeremymiller: function() {
      var photos = new Express.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/users/' + $jeremymiller + '/media/recent/?access_token=' + Express.storage.getAccessToken() + '&count=-1';
      var view = new Express.views.PhotosView({ collection: photos });
      $("#main").html(view.el);
    },

    ronstafari: function() {
      var photos = new Express.collections.Photos();
      photos.url = 'https://api.instagram.com/v1/users/' + $ronstafari + '/media/recent/?access_token=' + Express.storage.getAccessToken() + '&count=-1';
      var view = new Express.views.PhotosView({ collection: photos });
      $("#main").html(view.el);
    }

  });

  router = new Router();

  if (!Backbone.history.start()) {
    $('body').html('404!');
  }
});
