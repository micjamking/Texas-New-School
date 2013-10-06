/*
 Author: Mike King (@micjamking)
*/
'use strict';

angular.module('instaApp', ['instaDirectives']);

angular.module('instaApp').controller('InstaCtrl', function ($scope, $http){

	$scope.data    = [];

	var flag        = false,
		accessToken = '588857635.a7acbee.35e620e9d8794d639e95600900ba7959',
		baseURL     = 'https://api.instagram.com/v1/tags/',
		paramURL   = '/media/recent?access_token=' + accessToken + '&callback=JSON_CALLBACK';


	var properties = function(object){

		object = object[0].data[0];

		for (var key in object){
			console.log(key);
		}
	};


	var ajax = function(params, bool){

		params = params || '';

		$http.jsonp(baseURL + $scope.hashtag + paramURL + params).success(function(data){

			if (bool){

				$scope.data = [data];

			} else {

				$scope.data.push(data);

			}

			properties($scope.data);

		});
	};

	$scope.newSearch = function(){

		ajax(null, true);
	};

	$scope.loadMore = function(){

		var nextPage = '&max_tag_id=' + $scope.data[$scope.data.length - 1].pagination.next_max_tag_id;

		if (flag) {

			return;

		} else {

			flag = true;
			ajax(nextPage);
			setTimeout(function(){ flag = false; }, 1500);

		}
	};

	ajax();

});

angular.module('instaDirectives', []).directive('whenScrolled', function() {
	return function(scope, elm, attr) {

		var	raw       = elm[0],
			w         = window,
			d         = document,
			e         = d.documentElement,
			g         = d.getElementsByTagName('body')[0],
			y         = w.innerHeight || e.clientHeight || g.clientHeight,
			marginTop = document.querySelector('.wrapper').offsetTop,
			search    = document.querySelector('.search').offsetHeight,
			height    = (y - marginTop) - search + 'px';

		raw.style.height = height;

		elm.bind('scroll', function() {
			if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
				scope.$apply(attr.whenScrolled);
			}
		});
	};
});
