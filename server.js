let express = require('express')
const mongodb = require("mongodb");
let bodyParser = require('body-parser')

let app = express()

app.use(express.static("public"))
app.use(express.static("views"))
app.use(express.static("css"))

app.use(bodyParser.urlencoded({
    extended: false
}))


app.engine("html", require('ejs').renderFile);
app.set('view engine', "html");

const MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/";

let db;

MongoClient.connect(url, {
        useNewUrlParser: true
    },
    function (err, client) {
        if (err) {
            console.log("Err  ", err);
        } else {
            console.log("Connected successfully to server");
            db = client.db("fit2095db");
        }
    });

//home page
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
});


//add new task
app.get("/newtask", function (req, res) {
    res.sendFile(__dirname + "/views/newTask.html")
});

app.post('/addtask', function (req, res) {
    let taskDetails = {
        TaskId : Math.round(Math.random()*1000),
        TaskName: req.body.TaskName,
        TaskAssign: req.body.TaskAssign,
        TaskDue: req.body.TaskDue,
        TaskStatus: req.body.TaskStatus,
        TaskDesc: req.body.TaskDesc }
    
    console.log(req.body);
    db.collection('tasklist').insertOne(taskDetails);
    res.redirect('/listTask'); 
   
})

//list task
app.get('/listtask', function (req, res) {
    db.collection('tasklist').find({}).toArray(function (err, data) {
        res.render('listTask.html', {
            tasks: data
        });
    });
});

//update tasks
app.get('/updateTask', function (req, res) {
    res.sendFile(__dirname + '/views/updateTask.html');
});

app.post('/updateTask', function (req, res) {
    let taskDetails = req.body;
    let filter = {TaskId: parseInt(req.body.utaskid)};
    let theUpdate = {
        $set: {
            TaskStatus: taskDetails.taskStatus,
        }
    };
    db.collection('tasklist').updateOne(filter, theUpdate);
    res.redirect('/listTask'); 
})

//delete task 
app.get('/deleteTask', function (req, res) {
    res.sendFile(__dirname + '/views/deleteTask.html');
});

app.post('/deletetask', function (req, res) {
    let filter = {
        TaskId: parseInt(req.body.TaskId)
    };
    db.collection('tasklist').deleteOne(filter);
    res.redirect("/listTask");

});

//delete all task
app.get('/deleteAll', function (req, res) {
    res.sendFile(__dirname + '/views/deleteAll.html');
});

app.post('/deleteAllTask', function (req, res) {
    if (req.body.selection == "true"){
        db.collection('tasklist').deleteMany({TaskStatus: "Complete"});
        res.redirect("/listTask");
    }
    else{
        res.redirect("/");
    }
});




app.listen(8080);