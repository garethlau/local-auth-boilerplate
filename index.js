const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');

const keys = require('./config/keys');

// connect to mongo
mongoose.connect(keys.mongoURI, {
    auth: {
        user: keys.mongoUser,
        password: keys.mongoPassword
    }, 
    useNewUrlParser: true
});
mongoose.connection.on('connected', () => console.log("Connected to mongo"));
mongoose.connection.on('error', (err) => console.log("There was an error connecting to mongo", err));

const app = express();

const users = require('./routes/users');

app.use(cors());    // allow any domain to access
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/users', users);

// start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
});