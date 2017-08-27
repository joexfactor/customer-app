const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mongojs = require('mongojs');
const db = mongojs('customerapp', ['users']);
const ObjectId = mongojs.ObjectId;

const app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parse Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

// Global Vars
app.use((req, res, next) => {
    res.locals.errors = null;
    next();
})

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.get('/', (rep, res) => {
    // find everything
    db.users.find(function (err, docs) {
        res.render('index', {
            title: 'Customers',
            users: docs
        });
    })
});

app.post('/users/add', (req, res) => {

    req.check('first_name', 'First Name is Required').notEmpty();
    req.check('last_name', 'Last Name is Required').notEmpty();
    req.check('email', 'Email is Required').notEmpty();

    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) {
            let errors = result.array();
            db.users.find(function (err, docs) {
                //console.log(docs);
                res.render('index', {
                    title: 'Customers',
                    users: docs,
                    errors: errors
                });
            })
        } else {
            let newUser = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email
            }
            db.users.insert(newUser, (err, result) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/');
            });
        }
    });
})

app.delete('/users/delete/:id', function (req, res) {
    db.users.remove({ _id: ObjectId(req.params.id) }, (err, result) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
})

app.listen(3002, () => {
    console.log('Server started on Port 3002...');
})