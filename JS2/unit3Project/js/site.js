var app = angular.module('todoApp', ['firebase']);

app.controller('todoCtrl', function ($scope, $firebaseArray, $firebaseAuth) {

    // init firebase
    app.initFirebase();

    // initialize auth object
    $scope.authObj = $firebaseAuth();

    // used to store user object
    $scope.authUser = null; // authenticated user object	

    // bind a firebase array/collection to our model
    //$scope.todos = $firebaseArray(app.firebaseRef.child('ng-todos'));
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
    /*
    // default array for todo list
    $scope.todos = [
        { text: 'eat dinner', done: true },
        { text: 'learn angularjs', done: false },
        { text: 'sleep', done: false }
    ];
    */

    // custom filter to get completed todos
    $scope.getCompleteTodos = function () {
        return $scope.todos.filter(function (todo) {
            return todo.done;
        });
    };

    // custom filter to get incomplete todos
    $scope.getIncompleteTodos = function () {
        return $scope.todos.filter(function (todo) {
            return !todo.done;
        });
    };

    // clear completed todos
    $scope.clearCompleted = function () {
        // resets todos array value so only incomplete tasks are in there (uses the custom filter)
        $scope.todos = $scope.getIncompleteTodos();
    }

    // add a new todo
    $scope.addTodo = function () {
        // $scope.newTodo will be the value from the text box
        //$scope.todos.push({ text: $scope.newTodo, done: false });
        // add new todo to database
        //$scope.todos.$add({ text: $scope.newTodo, duedate: $scope.newDate, done: false });
        $scope.todos.$add({ text: $scope.newTodo, done: false });
        // update model to clear text box
        $scope.newTodo = '';
    }

    $scope.updateTodo = function (todo) {
        $scope.todos.$save(todo);
    };

    $scope.clearCompleted = function () {
        //$scope.todos = $scope.getIncompleteTodos();
        // loop through completed todos and remove from database
        $scope.getCompleteTodos().forEach(function (todo) {
            $scope.todos.$remove(todo);
        });
    };

});


app.controller('authCtrl', function ($scope, $firebaseAuth, $firebaseObject) {
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