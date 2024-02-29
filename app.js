//Importing modules
"use strict"
const express = require("express");
const hbs = require("hbs");
const sql = require("mysql2");
const app = express();
const moment = require("moment");
app.use(express.urlencoded({
    extended: false,
}));
//Creating Connection
const connection = sql.createConnection({
    host: "mysql-2763b5ba-guptakrishna12004-9384.a.aivencloud.com",
    port: 10813, //port 3306 (default port) was occupied
    user: "avnadmin",
    password: "AVNS_RVLYkqAcC1To6wTFj-V",
    database: "defaultdb"
});
//Connecting to db
connection.connect((err) => {
    if (err){
        console.log("Error connecting to Database", err);
    }
    else{
        console.log("Connection Successful");
    }
});
//creating a function that gets the details from the db and sends it to the mentioned hbs file.
function getDetails(id,fileName,res){
    let sql = "select * from `articles` where `articleId` = ?";
    connection.query(sql,[id],(err,results) => {
        if (err){
            res.render("database-error.hbs");
        }
        else{
            let articleDate = new Date(results[0].articleDate);
            articleDate = moment(articleDate).format('YYYY-MM-DD');
            res.render(fileName,{
                articleNo:results[0].articleId,
                articleName:results[0].articleName,
                articleContent:results[0].articleContent,
                articleDate,
            });
        }
    })
}
app.set("veiw engine","hbs");
app.set("port",process.env.port || 3000);
//get methods
app.get("/",(req,res)=>{
    res.render("homepage.hbs");
});
// "/articles" this shows the id and 3 buttons for each article
app.get("/articles",(req,res)=>{
    let sql = "select `articleId` from `articles`";
    connection.query(sql,(err,results) => {
        if (err){
            res.render("database-error.hbs");
        }
        else{
            res.render("articles.hbs",{results});
        }
    })
});
// "/add-article" shows a form to add an article
app.get("/add-article",(req,res)=>{
    res.render("addArticle.hbs");
});
// "/articles/:articlNo" shows article data based on the route variable passed.
app.get("/articles/:articleNo",(req,res)=>{
    getDetails(req.params.articleNo,"displayArticles.hbs",res);
});
// "/edit-articles/:articleNo" shows a form with prefilled data pertaining to the article no route variable.
app.get("/edit-articles/:articleNo",(req,res)=>{
    getDetails(req.params.articleNo,"editArticles.hbs",res);
});
// "/delete-articles/:articleNo" shows a confirmation for the deletion of the article with the same article id
app.get("/delete-articles/:articleNo",(req,res)=>{
    getDetails(req.params.articleNo,"deleteArticle.hbs",res);
});
//post methods
// "/articles" inserts the data from the add-articles and shows the data on the added articles page (the date is the systems date)
app.post("/articles",(req,res)=>{
    function addArticle(name,content,date){
        let sql = "insert into `articles`(`articleName`,`articleContent`,`articleDate`) values(?,?,?)";
        connection.query(sql,[name,content,date],(err,results) => {
            if (err){
                res.render("database-error.hbs");
            }
            else{
                let id;
                let sql = "select max(`articleId`) as 'articleId' from `articles`";
                connection.query(sql,(err,result) => {getDetails(result[0].articleId,"addedArticle.hbs",res)})               
            }
        })
    }
    let date = new Date();
    date = moment(date).format('YYYY-MM-DD')
    addArticle(req.body.articleName,req.body.articleContent,date);    
});
// "/articles/edit"updates the data and shows edited articles page that shows the edited infro from the edit page.
app.post("/article/edit",(req,res)=>{
    function editDetails(id,name,content,date){
        let sql = "update `articles` set `articleName`=?,`articleContent`=?,`articleDate`=? where `articleId`=?";
        connection.query(sql,[name,content,date,id],(err,results) => {
            if (err){
                res.render("database-error.hbs");
            }
            else{
                getDetails(id,"editedArticles.hbs",res)
            }
        })
    }
    let date = new Date();
    date = moment(date).format("YYYY-MM-DD");
    editDetails(req.body.articleId,req.body.articleName,req.body.articleContent,date);
});
// "/articles/delete" shows a confirmation that the article has been deleted.
app.post("/article/delete",(req,res)=>{
    function deleteArticle(id){
        let sql = "delete from `articles` where `articleId` = ?";
        connection.query(sql,[id],(err,results) => {
            if (err){
                res.render("database-error.hbs");
            }
            else{
                res.render("deletedArticles.hbs",{articleId:req.body.articleId})
            }
        })
    }
    deleteArticle(req.body.articleId);
})
app.listen(app.get("port"),()=>{
    console.log(`Server is running on port: ${app.get("port")}`);
});
