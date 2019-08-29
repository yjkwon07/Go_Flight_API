const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

const passportConfig = require('./passport');
const { sequelize } = require('./models');
const autRouter = require('./routes/auth');
const indexRouter = require('./routes');

require('dotenv').config();
passportConfig(passport);
sequelize.sync(); 
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8002);

app.use(morgan('dev'));
app.use('/static',express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', autRouter);
app.use('/', indexRouter);

app.use((req, res, next)=> {
    const err= new Error("NotFound");
    err.status=404;
    next(err);
});

app.use((err,req, res)=>{
    req.locals.message = err.message;
    req.locals.error = req.app.get('env') === 'development'? err: {};
    res.status(err.status || 505);
    app.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기중');
});