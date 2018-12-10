var app = angular.module('todoApp', ['firebase', 'ngMaterial', 'ngMessages']);

// define some global variables available to the entire app
app.run(function ($rootScope) {
    var d = new Date();
    $rootScope.appName = 'TaskMaster - 2018';
    $rootScope.copyright = d.getFullYear();
    $rootScope.isActive = function (viewPath) {
        return viewPath == $location.path();
    }
});


app.controller('todoCtrl', function ($scope, $firebaseArray, $firebaseAuth) {
    // init firebase
    app.initFirebase();

    // initialize auth object
    $scope.authObj = $firebaseAuth();

    // used to store user object
    $scope.authUser = null; // authenticated user object	

    // create array var
    $scope.todos = [];

    // on login or logout
    $scope.authObj.$onAuthStateChanged(function (firebaseUser) {
        if (firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            $scope.authUser = firebaseUser;
            $scope.todos = $firebaseArray(app.firebaseRef.child('users').child($scope.authUser.uid).child('ng-todos'));
            //$scope.user = $firebaseObject(app.firebaseRef.child('users').child($scope.authUser.uid));
        } else {
            console.log("Signed out");
            $scope.authUser = null;
            //$scope.user = null;
            $scope.todos = [];
        }
    });

    // custom filter to get completed todos
    $scope.getCompleteTodos = function () {
        return $scope.todos.filter(function (todo) {
            return todo.done;
        });
    };

    // custom filter to get incomplete todos
    $scope.getIncompleteTodos = function () {
        return $scope.todos.filter(function (todo) {
            return !todo.done && !todo.cb1 && !todo.cb2 && !todo.cb3 && !todo.cb4;
        });
    };

    // custom filter to get incomplete todos
    $scope.getIncompleteCb1Todos = function () {
        return $scope.todos.filter(function (todo) {
            return !todo.done && todo.cb1;
        });
    };

    // custom filter to get incomplete todos
    $scope.getIncompleteCb2Todos = function () {
        return $scope.todos.filter(function (todo) {
            return !todo.done && todo.cb2;
        });
    };

    // custom filter to get incomplete todos
    $scope.getIncompleteCb3Todos = function () {
        return $scope.todos.filter(function (todo) {
            return !todo.done && todo.cb3;
        });
    };

    // custom filter to get incomplete todos
    $scope.getIncompleteCb4Todos = function () {
        return $scope.todos.filter(function (todo) {
            return !todo.done && todo.cb4;
        });
    };

    // clear completed todos
    $scope.clearCompleted = function () {
        // resets todos array value so only incomplete tasks are in there (uses the custom filter)
        $scope.todos = $scope.getIncompleteTodos();
    }

    $scope.toggleBoxes = function () {
        if (!$scope.cb1) {
            return $scope.cb2 = false, $scope.cb3 = false, $scope.cb4 = false;
        }
        else if (!$scope.cb2) {
            return $scope.cb1 = false, $scope.cb3 = false, $scope.cb4 = false;
        }
        else if (!$scope.cb3) {
            return $scope.cb1 = false, $scope.cb2 = false, $scope.cb4 = false;
        }
        else if (!$scope.cb4) {
            return $scope.cb1 = false, $scope.cb2 = false, $scope.cb3 = false;
        }
    }

    // add a new todo
    $scope.addTodo = function () {
        // $scope.newTodo will be the value from the text box
        // add new todo to database
        $scope.todos.$add({ text: $scope.newTodo, cb1: $scope.cb1, cb2: $scope.cb2, cb3: $scope.cb3, cb4: $scope.cb4, done: false });

        // update model to clear todo fields
        $scope.newTodo = '';
        $scope.cb1 = false;
        $scope.cb2 = false;
        $scope.cb3 = false;
        $scope.cb4 = false;
    }

    $scope.editTodo = function (todo) {
        // edit the todo object
        // objects are passed by reference
        // string/number/boolean are passed by value
        //todo.text += " EDITED";
        todo.edit = !todo.edit;

        $scope.todos.$save(todo);
    }

    $scope.clearCompleted = function () {
        // loop through completed todos and remove from database
        $scope.getCompleteTodos().forEach(function (todo) {
            $scope.todos.$remove(todo);
        });
    };

});


app.controller('authCtrl', function ($scope, $firebaseAuth, $firebaseObject, $mdSidenav, $log) {
    // right side nav functions
    $scope.toggleRight = buildToggler('right');
    $scope.isOpenRight = function () {
        return $mdSidenav('right').isOpen();
    };

    function buildToggler(navID) {
        return function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });

            // clear out user input fields and reset form field condition 
            $scope.userLogin.$setPristine();
            $scope.userLogin.$setUntouched();
            $scope.userEmail = '';
            $scope.userPassword = '';
        };
    }

    $scope.close = function () {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav('right').close()
            .then(function () {
                $log.debug("close RIGHT is done");
            });
    };

    // initalize database
    app.initFirebase();

    // initialize auth object
    $scope.authObj = $firebaseAuth();

    // store user objects
    $scope.authUser = null; // authenticated user object
    $scope.user = null; // our user's details or record

    // on login or logout
    $scope.authObj.$onAuthStateChanged(function (firebaseUser) {
        if (firebaseUser) {
            console.log("Signed in as: auth state change", firebaseUser.uid);
            $scope.authUser = firebaseUser;
            $scope.user = $firebaseObject(app.firebaseRef.child('users').child($scope.authUser.uid));
            $scope.close();
        } else {
            console.log("Signed out");
            $scope.authUser = null;
            $scope.user = null;
        }
    });


    // button methods
    $scope.createUser = function () {
        // get values from the form

        // validate input

        // create user - pass username and password to this method
        $scope.authObj.$createUserWithEmailAndPassword($scope.userEmail, $scope.userPassword)
            .then(function (firebaseUser) {
                console.log("User " + firebaseUser.uid + " created successfully!");
                $scope.close();
            }).catch(function (error) {
                console.error("Error: ", error);
            });
    };

    $scope.login = function () {
        // get values from the form

        // validate input

        // login - pass username and password to this method
        $scope.authObj.$signInWithEmailAndPassword($scope.userEmail, $scope.userPassword).then(function (firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            $scope.close();
        }).catch(function (error) {
            console.error("Authentication failed:", error);
        });
    };

    $scope.updateUser = function () {
        // validate the form

        // create data (from a form) to store with user
        var data = { firstname: "Tyler", lastname: "Kowalchuk" };

        // store data with user
        // stores in /users/lkada9ae89slsekljklse/firstname = "Tyler"
        //app.firebaseRef.child('users').child($scope.authUser.uid).update(data);
    };

    $scope.logout = function () {
        // sign out
        //$scope.user.$destroy();	// cancels event listeners before signout
        $scope.authObj.$signOut();
    };

});


app.initFirebase = function () {
    // Initialize Firebase
    // only if it's not already initialized
    if (!app.firebaseRef) {
        var config = {
            apiKey: "AIzaSyDV8RpDq5XTf9LvDgkkBgyZbgyWSNlrxng",
            authDomain: "todoapp-999a1.firebaseapp.com",
            databaseURL: "https://todoapp-999a1.firebaseio.com",
            projectId: "todoapp-999a1",
            storageBucket: "",
            messagingSenderId: "828610305376"
        };
        firebase.initializeApp(config);

        // create database reference to root
        app.firebaseRef = firebase.database().ref('/');
    }
};

// customize the them
app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('orange');
});


// custom directive
app.directive('todo', function () {
    return {
        templateUrl: 'templates/todo.html'
        // ,controller: ... could specify a custom controller
        // $scope
        // etc...
        // restrict: 'EA'
    };
});

// custom directive
app.directive('sort', function () {
    return {
        templateUrl: 'templates/sortBoxes.html'
        // ,controller: ... could specify a custom controller
        // $scope
        // etc...
        // restrict: 'EA'
    };
});