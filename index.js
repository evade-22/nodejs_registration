const express = require('express');
const app = express();
const port = 5003;
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
dotenv.config({path: './.env'});

app.set("view engine", "hbs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
//Define routes
app.use("/", require("./routes/register_routes"));
app.use("/auth", require("./routes/auth"));
app.use(cookieParser());

app.listen(port, () => {
    console.log(`Server Started`);
    // db.connect((err) => {
    //     if (err){
    //         console.log('ERROR' + err);
    //     } else {
    //         console.log("DB Connected");
    //     }
    // })
});




