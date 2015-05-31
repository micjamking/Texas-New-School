/*
 Author: Mike King (@micjamking)
*/
'use strict';

angular.module('txnsApp', ['txnsDirectives']);

angular.module('txnsApp').controller('txnsCtrl', function ($scope, $http, $timeout){

	$scope.data    = [];

	var flag        = false,
		count       = '&count=30',
		preloader   = document.querySelector('.preloader'),
		gallery     = document.getElementsByTagName('article'),
		accessToken = '588857635.a7acbee.35e620e9d8794d639e95600900ba7959',
		baseURL     = 'https://api.instagram.com/v1/',
		paramURL    = '/media/recent?access_token=' + accessToken + count + '&callback=JSON_CALLBACK',
		artists     = {
			timstaffordtattoos: 52638890,
			thomaspage: 21818000,
			jeremymiller: 15994110,
			davidflores_316: 22917518
		};

	var ajax = function(params, bool, artist){

		params = params || '';

		if (artist){

			$http.jsonp(baseURL + 'users/' + artist + paramURL + params).success(function(data){

				applyScope(bool, data);

			});

		} else {

			$http.jsonp(baseURL + 'tags/' + 'texasnewschool' + paramURL + params).success(function(data){

				applyScope(bool, data);

			});

		}
	};

	var applyScope = function(bool, object){

		if (bool){

			pageTransition(function(){ $scope.data = [filterStream(object)]; });

		} else {

			pageTransition(function(){ $scope.data.push(filterStream(object)); });

		}
	};

	var pageTransition = function(func){

		$timeout(function(){
			if (angular.element(gallery).hasClass('fadeOut')){

				angular.element(gallery).removeClass('fadeOut').addClass('fadeIn');

			}

			func();
			angular.element(preloader).attr('class', 'preloader fadeOut');
		}, 1500);

	};

	var filterStream = function(object){

		var i, current,
			pigment = {},
			artists = {
				'jeremymiller': true,
				'thomaspage': true,
				'timstaffordtattoos': true,
				'davidflores_316': true
			};

		pigment.data       = [];
		pigment.meta       = object.meta;
		pigment.pagination = object.pagination;

		if ($scope.photoRemainder){

			for (i = 0; i < $scope.photoRemainder.length; i++){

				pigment.data.push($scope.photoRemainder[i]);

			}

		}

		for (i = 0; i < object.data.length; i++){

			current = object.data[i].user.username;

			if ((artists[current])){

				pigment.data.push(object.data[i]);

			}
		}

		evenRows(pigment);

		return pigment;

	};

	var evenRows = function(object){

		var remainder = object.data.length % 3,
			index     = object.data.length - remainder;

		$scope.photoRemainder = [];

		if (remainder === 0) {

			return;

		} else {

			$scope.photoRemainder = object.data.splice(index, remainder);

		}

	};

	var hashBang = function(){
		var artist = window.location.hash.substr(1);

		if (artist) {

			ajax(null, null, artists[artist]);
			$scope.user = artist;

		} else {

			ajax();

		}

	};

	$scope.newSearch = function(artist){

		angular.element(gallery).attr('class', 'row fadeOut');
		angular.element(preloader).attr('class', 'preloader fadeIn');

		if (artist) {

			$scope.photoRemainder = [];
			$scope.artist         = artists[artist];

			ajax(null, true, artists[artist]);


		} else {

			ajax(null, true);

		}
	};

	$scope.loadMore = function(){

		var nextPage,
			object = $scope.data[$scope.data.length - 1];

		angular.element(preloader).attr('class', 'preloader fadeIn');

		if ('next_max_tag_id' in object.pagination){

			nextPage = '&max_tag_id=' + object.pagination.next_max_tag_id;

		} else {

			nextPage = '&max_id=' + object.pagination.next_max_id;

		}

		if (flag) {

			return;

		} else {

			flag          = true;
			$scope.artist = $scope.artist || null;
			ajax(nextPage, null, $scope.artist);
			setTimeout(function(){ flag = false; }, 3000);

		}
	};

	$scope.galleryHeight = function(raw){

		var	w         = window,
			d         = document,
			e         = d.documentElement,
			g         = d.getElementsByTagName('body')[0],
			y         = w.innerHeight || e.clientHeight || g.clientHeight,
			small     = window.matchMedia('only screen and (min-width: 768px)'),
			marginTop = document.querySelector('.main').offsetTop,
			header    = document.querySelector('.container .large-3').clientHeight,
			height    = (y - marginTop) - ( small.matches ? 0 : header) + 'px';

		raw.style.height = height;

		window.onresize = function(){
			$scope.galleryHeight(raw);
		};
	};

	$scope.openInstagram = function(e){

		var elem  = angular.element(e.srcElement),
			small = window.matchMedia('only screen and (min-width: 768px)');

		if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))){

			window.location.href = 'instagram://media?id=' + elem.attr('data-src-id');

		} else if (!small.matches) {

			window.location.href = elem.attr('data-src-link');

		}

	};

	hashBang();

});

angular.module('txnsDirectives', [])
.directive('whenScrolled', function() {
	return function(scope, elm, attr) {

		var raw = elm[0];

		scope.galleryHeight(raw);

		elm.bind('scroll', function() {
			if (raw.scrollTop + raw.offsetHeight >= (raw.scrollHeight * 0.9)) {
				scope.$apply(attr.whenScrolled);
			}
		});
	};
})
.directive('lazyLoad', function () {
	return function(scope, elm) {

		elm.bind('load', function(){

			var parent = elm[0].parentNode;
			angular.element(parent).addClass('show');
		});
	};
});
