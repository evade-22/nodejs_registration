const mysql = require("mysql2");
const encryption = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT
});

exports.addAccount = (req, res) => {
    // console.log(req.body)
    // res.send("FORM SUBMITTED")
    // let firstName = req.body.first_name;
    // let lastName = req.body.last_name;
    // let  = req.body.email;
    // let password = req.body.password;
    // let confirmPass = req.body.confirm_password;

    const {first_name, last_name, email, password, confirm_password} = req.body

    db.query("SELECT email FROM user WHERE email = ?", email,
    async function(err, result){
    if(err){
        return console.log("Error Message" + err);
    } else {
        if(result.length > 0){
            return res.render("register", {message: "Email is already existing"});
        } else if(password != confirm_password) {
            return res.render("register", {message: "Password does not match"});
        } else {
            let hashPassword = await encryption.hash(password, 8);
            db.query("INSERT INTO user set ? ", {first_name: first_name, last_name: last_name, email: email, password: hashPassword},
            function(err, result){
                if(err){
                    return console.log("Error Message" + err);
                } else {
                    console.log(result);
                    return res.render("register", {message: "Users have been registered successfully"}) 
                }
            });
        }
    }
    });
}

exports.loginAccount = async(req, res) => {
    try {
        const {email, password} = req.body
        if(!email || !password){
            return res.render("index", {message: "Email or password cannot be empty"})
        } else {
            db.query("SELECT * FROM user WHERE email = ?", email,
                async function(err, result){
                    if(!result){
                        return res.render("index", {message: "Email is incorrect"});
                    } else if(!(await encryption.compare(password, result[0].password))){
                        return res.render("index", {message: "Password is incorrect"});
                    } else {
                        const id = result[0].user_id;
                        const token = jwt.sign(id, process.env.JWT_SECRET);
                        const cookieOption = {expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES)*24*60*1000, httpOnly:true};
                        res.cookie("cookie_access_token", token, cookieOption);
                        console.log(token);
                        db.query("SELECT * FROM student INNER JOIN course ON student.course_id = course.course_id",
                            (err, result) => {
                                if(!result){
                                    return res.render('user', {message: "No results found"});
                                } else {
                                    res.render('user', {title: "Student Information", data: result});
                                }
                            }
                        )
                        // return res.render("index", {message: "Logged in successfully"})
                    }
                }
            )
        }
    }
    catch(err){console.log(err)}
}

//Form for updating specific data
exports.updateForm = (req, res) => {
    const email = req.params.email; 

    db.query(`SELECT * FROM student INNER JOIN course ON student.course_id = course.course_id WHERE email = "${email}"`, (err, result) => {
        res.render("updateForm", {title: "Update Student Information", data: result[0]});
    });
}

//updateUser is the tabular data for students
exports.updateUser = (req, res) => {
    const {first_name, last_name, email} = req.body

    db.query(`UPDATE student SET first_name = "${first_name}", last_name = "${last_name}" WHERE email = "${email}"`, (err) => {
        if(err) throw err
        else 
        db.query(`SELECT * FROM student INNER JOIN course ON student.course_id = course.course_id`, (err, result) => {
            res.render("user", {title: "Student Information", data: result});
        })
    })
    
}

exports.deleteUser = (req, res) => {
    const email = req.params.email;

    db.query(`DELETE FROM student WHERE email = "${email}"`, (err) => {
        if(err) { 
            throw err;
        } else {
            db.query(`SELECT * FROM student INNER JOIN course ON student.course_id = course.course_id`, (err, result) => {
                if(err){
                    return res.render("user", {message: "Error fetching data"});
                } else if (!result){
                    return res.render("user", {message: "No data available"});
                } else {
                    res.render("user", {title: "Student Information", data: result});
                }
            })
        } 
    })   
}

exports.logoutAccount = (req, res) => {
    res.clearCookie("cookie_access_token");
    res.render("index");

}
