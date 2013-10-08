/*
 Author: Mike King (@micjamking)
*/
'use strict';

angular.module('instaApp', ['instaDirectives']);

angular.module('instaApp').controller('InstaCtrl', function ($scope, $http, $timeout){

	$scope.data    = [];

	var flag        = false,
		count       = '&count=40',
		preloader   = document.querySelector('.preloader2'),
		accessToken = '588857635.a7acbee.35e620e9d8794d639e95600900ba7959',
		baseURL     = 'https://api.instagram.com/v1/',
		paramURL    = '/media/recent?access_token=' + accessToken + count + '&callback=JSON_CALLBACK',
		artists     = {
			timsinknart: 52638890,
			thomaspage: 21818000,
			jeremymiller: 15994110
		};

	var ajax = function(params, bool, artist){

		params = params || '';

		if (artist){

			$http.jsonp(baseURL + 'users/' + artist + paramURL + params).success(function(data){
				$timeout(dataPush(bool, data), 1500);
			});

		} else {

			$http.jsonp(baseURL + 'tags/' + 'texasnewschool' + paramURL + params).success(function(data){
				$timeout(dataPush(bool, data), 1500);
			});

		}
	};

	var dataPush = function(bool, object){

		if (bool){

			$scope.data = [filterStream(object)];

		} else {

			$scope.data.push(filterStream(object));

		}
		angular.element(preloader).attr('class', 'preloader2 fadeOut');
	};

	var filterStream = function(object){

		var i, current,
			pigment = {},
			artists = {
				'jeremymiller': true,
				'thomaspage': true,
				'timsinknart': true
			};

		pigment.data       = [];
		pigment.meta       = object.meta;
		pigment.pagination = object.pagination;

		for (i = 0; i < object.data.length; i++){

			current = object.data[i].user.username;

			if ((artists[current])){
				pigment.data.push(object.data[i]);
			}
		}

		return pigment;
	};

	$scope.newSearch = function(artist){

		angular.element(preloader).attr('class', 'preloader2 fadeIn');

		if (artist) {

			ajax(null, true, artists[artist]);
			$scope.artist = artists[artist];

		} else {

			ajax(null, true);

		}
	};

	$scope.loadMore = function(){

		var nextPage,
			object = $scope.data[$scope.data.length - 1];

		angular.element(preloader).attr('class', 'preloader2 fadeIn');

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
			ajax(nextPage,null, $scope.artist);
			setTimeout(function(){ flag = false; }, 1500);

		}
	};

	ajax();

});

angular.module('instaDirectives', [])
.directive('whenScrolled', function() {
	return function(scope, elm, attr) {

		var	raw       = elm[0],
			w         = window,
			d         = document,
			e         = d.documentElement,
			g         = d.getElementsByTagName('body')[0],
			y         = w.innerHeight || e.clientHeight || g.clientHeight,
			small     = window.matchMedia('only screen and (min-width: 768px)'),
			marginTop = document.querySelector('.main').offsetTop,
			header    = document.querySelector('.wrapper .large-3').clientHeight,
			height    = (y - marginTop) - ( small.matches ? 0 : header) + 'px';

		console.log(header);

		raw.style.height = height;

		elm.bind('scroll', function() {
			if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
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
