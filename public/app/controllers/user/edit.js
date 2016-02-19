angular.module('myApp').controller('EditUserController', 
  ['$scope', '$routeParams', '$location', '$translate', '$timeout', 'UserErrorService', 'NavigationService', 'EntityUtilService', 'SecurityService', 'UserService', 
  function($scope, $routeParams, $location, $translate, $timeout, UserErrorService, NavigationService, EntityUtilService, SecurityService, UserService) {

	$scope.isEdition = false;
	$scope.isCreation = false;
	$scope.isDeletion = false;
	$scope.isView = false;
	$scope.canEdit = false;
	$scope.canDelete = false;	
	$scope.readOnly = false;
	$scope.dataReceived = false;
	$scope.ui = {
		createVisitedPlaces : true

	};
	$scope.obj = {
		name : null,
		lastname : null,
		age : null,
		isActive : false,
		hideVisitedPlaces : false,
		visitedPlaces : []
	};

	var saveIndex = 0;
	var manyToManyCount = 1;

	$scope.add = function () {
		$scope.uiWorking = true;
		$scope.obj._id = undefined;
		$scope.obj.visitedPlaces = getVisitedPlacesIds();
		UserService.add(dataToServer($scope.obj)).then(function (httpResponse) {
			if($scope.parent) {
				NavigationService.setReturnData({parent: $scope.parent, entity: httpResponse.data});
				$location.path(NavigationService.getReturnUrl());
			}
			else {
				gotoList();
			}
	    }, errorHandlerAdd, progressNotify);
	};
	
	$scope.update = function () {
		$scope.uiWorking = true;
		UserService.update(dataToServer($scope.obj)).then(function (httpResponse) {
			saveIndex = 0;
			UserService.setUserVisitedPlaces(httpResponse.data._id, getVisitedPlacesIds()).then(saveAllThenGotoList, errorHandlerUpdate);
		}, errorHandlerUpdate, progressNotify);
	};

	$scope.delete = function () {
		$scope.uiWorking = true;
		UserService.setUserVisitedPlaces($scope.obj._id, []).then(function () {
			UserService.delete($scope.obj._id).then(returnBack, errorHandlerDelete, progressNotify);
		}, errorHandlerDelete);
	};

	function progressNotify() { //update
	}

	function errorHandlerAdd(httpError) {
		$scope.uiWorking = false;
		$scope.dataReceived = true;
		$scope.errors = UserErrorService.translateErrors(httpError, "add");
	}

	function errorHandlerUpdate(httpError) {
		$scope.uiWorking = false;
		$scope.dataReceived = true;
		$scope.errors = UserErrorService.translateErrors(httpError, "update");
	}

	function errorHandlerDelete(httpError) {
		UserService.setUserVisitedPlaces($scope.obj._id, getVisitedPlacesIds());
		$scope.uiWorking = false;
		$scope.dataReceived = true;
		$scope.errors = UserErrorService.translateErrors(httpError, "delete");
	}

	function errorHandlerLoad(httpError) {
		$scope.uiWorking = false;
		$scope.dataReceived = true;
		$scope.errors = UserErrorService.translateErrors(httpError, "query");
	}

	function dataToServer(obj) {
	
		return obj;
	}		

	function loadVisitedPlaces(httpResponse) {
		$scope.obj.visitedPlaces = httpResponse.data;
	}

	function loadData(httpResponse) {
		$scope.obj = httpResponse.data;

		UserService.getUserVisitedPlaces($routeParams.id).then(loadVisitedPlaces, errorHandlerLoad);


		$scope.canEdit = $scope.isView && EntityUtilService.hasActionCapability($scope.obj, 'edit');
		$scope.canDelete = $scope.isView && EntityUtilService.hasActionCapability($scope.obj, 'delete');
		$scope.errors = null;
		$scope.dataReceived = true;
	}
	function returnBack() {
		if ($scope.parent) {
			NavigationService.setReturnData({ parent: $scope.parent });
			$location.path(NavigationService.getReturnUrl());
		}
		else {
			gotoList();
		}
	}

	$scope.cancel = returnBack;

	$scope.gotoEdit = function() {
		$location.path('/user/edit/' + $routeParams.id);		
	};

	$scope.gotoDelete = function() {
		$location.path('/user/delete/' + $routeParams.id);		
	};


	function saveAllThenGotoList() {
		saveIndex++;
		if (saveIndex === manyToManyCount) {
			returnBack();
		}
	}


	function gotoList() {
		$scope.uiWorking = false;
		$location.path('/user/');		
	}

	$scope.submit = function() {
		if ($scope.isCreation && !$scope.editForm.$invalid) {
			$scope.add();
		}
		else if ($scope.isEdition && !$scope.editForm.$invalid) {
			$scope.update();
		}
		else if ($scope.isDeletion) {
			$scope.delete();
		}
	};

	$scope.viewVisitedPlaces = function(obj) {
		if ($scope.editForm && $scope.editForm.$dirty) {
			if (!confirm("You have unsaved changes!, do you want to move any way? press cancel to stay in this page")) {
				return;
			}
		}

		NavigationService.push($location.path(), "ViewVisitedPlaces", {parent: $scope.obj} );
		$location.path('/place/view/' + obj._id);
	};

	$scope.selectVisitedPlaces = function() {
		NavigationService.push($location.path(), "SelectVisitedPlaces", {parent: $scope.obj, criteria: EntityUtilService.buildNotInQuery(getVisitedPlacesIds())} );
		$location.path('/place/select');
	};
	
	$scope.addVisitedPlaces = function() {
		NavigationService.push($location.path(), "AddVisitedPlaces", {parent: $scope.obj, parentClass: 'user'} );
		$location.path('/place/add');
	};
	
	$scope.deleteVisitedPlaces = function(place) {
		var index = $scope.obj.visitedPlaces.indexOf(place);
		if (index > -1) {
		    $scope.obj.visitedPlaces.splice(index, 1);

			if($scope.editForm) {
				$scope.editForm.$dirty = true;
			}
		}
	};
	
	function addSelectVisitedPlacesBack() {
		var navItem = popNavItem();
		if(navItem.returnData) {
			var user = navItem.returnData.parent;
			if(user) {
				var myPlace = navItem.returnData.entity;
				if(myPlace) {
					user.visitedPlaces.push(myPlace);

				}
				$timeout(function() {
				  setObj(user);
				  $scope.dataReceived = true;
				}, 100);
				return;
			}
		}
		UserService.getDocument($routeParams.id).then(loadData, errorHandlerLoad);
	}

	function getVisitedPlacesIds() {
		var ids = [];
		for (var i = 0; i < $scope.obj.visitedPlaces.length; i++) {
			ids.push($scope.obj.visitedPlaces[i]._id);
		}
		return ids;
	}


	function init() {
		$scope.isDeletion = isDeletionContext();
		$scope.isView     = isViewContext();
		$scope.readOnly   = $scope.isDeletion || $scope.isView;
		if ($routeParams.id) {
			$scope.isEdition = !$scope.readOnly;
			$scope.isCreation = false;
			setParent();
		}
		else {
			$scope.isEdition = false;
			$scope.isCreation = true;
			$scope.dataReceived = true;
			$scope.obj._id = 'new';
			setNavigationStatus();
		}

		SecurityService.getPermisionsFoResource('place').then(function(httpData) {
			$scope.ui.createVisitedPlaces = EntityUtilService.canExecute(httpData.data, 'create'); 
		});


		if (NavigationService.isReturnFrom('SelectVisitedPlaces') || NavigationService.isReturnFrom('AddVisitedPlaces')) {
			addSelectVisitedPlacesBack();
			return;
		}
		if (NavigationService.isReturnFrom('ViewVisitedPlaces')) {
			NavigationService.pop();
			setParent();
		}

		if ($routeParams.id) {
			UserService.getDocument($routeParams.id).then(loadData, errorHandlerLoad);		
		}

	}

	function isDeletionContext() {
		return stringContains($location.path(), '/delete/');
	}

	function isViewContext() {
		return stringContains($location.path(), '/view/');
	}

	
	function stringContains(text, substring) {
		return text.indexOf(substring) > -1;
	}
	function setParent() {
		var state = NavigationService.getState();
		$scope.parent = (state && state.parent) ? state.parent : null;
		return state;
	}


	function popNavItem() {
		var navItem = NavigationService.pop();
		setNavigationStatus();
		return navItem;
	}

	function setObj(obj) {
		$scope.obj = obj;
		if($scope.editForm) {
			$scope.editForm.$dirty = true;
		}

		if ($routeParams.id && !$scope.obj) {
			UserService.getDocument($routeParams.id).then(loadData, errorHandlerLoad);
		}

	}


	function setNavigationStatus() {

		var state = setParent();
		if ($scope.parent) {
			switch (state.parentClass) {
				case 'place':
					$scope.obj.hideVisitedPlaces = true;
					break;

				default:
					break;
			}
		}

	}

	init();
}]);
