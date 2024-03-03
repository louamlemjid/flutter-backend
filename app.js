const express =require("express");
const mongoose =require("mongoose");
const bodyparser=require("body-parser");
const session = require('express-session');

const app=express()

app.use(session({
    //you can change this 'flutter backebd logic' to a secret string you save it in the env variables 
    secret: "flutter backebd logic",
    resave: false,
    saveUninitialized: false,
    cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days open session you can costumize it as you want in milliseconds
    }
}));

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(express.static("public"));


mongoose.connect('your mongodb link');


const userschema=new mongoose.Schema({
    firstname:String,
    lastName:String,
    password:String,
    email:String
});
const User=mongoose.model('User',userschema);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async function () {
  console.log('Connected to the database');

    
    
    try {
        //signUp form
        app.post('/signUp',async (req,res)=>{
            try{
                const firstName=req.body.firstName;
                const lastName=req.body.lastName;
                const email=req.body.email;
                const password=req.body.password;
                //add a new user to the db if it does not exist
                const result=await User.updateOne({email:email},{
                    firstname:firstName,
                    lastName:lastName,
                    email:email,
                    password:password
                },{upsert:true})
                /*after adding the user you can redirect him to the signIn page
                res.redirect('/signIn')*/
            }catch(error){
                console.error('error',error)
                res.send("impossible de s'inscrire, merci de consulter le support ou bien essayez une autre fois")
            }
        })
        //signIn form
        app.post("/signIn",async(req,res)=>{
            try{
                const email=req.body.email;
                const password=req.body.password;
                const result=await User.findOne({email:email,password:password})
                //check if the user's inputs are valid
                if(result!=null){
                    //save the email for the session for later features
                    req.session.email=email;
                    //if the password is valid it redirects him to the home
                    res.redirect("/home")
                }else{
                    //if not ! it brings him back to the signIn route
                    res.redirect("/signIn")
                }
                /*after adding the user you can redirect him to the signIn page
                res.redirect('/signIn')*/
            }catch(error){
                console.error('error',error)
                res.send("impossible de se connecter, merci de consulter le support ou bien essayez une autre fois")
            }
        })
        //the signIn page 
        app.get('/signIn',(req,res)=>{
            try{
                res.render("signIn")
            }catch(error){
                console.error('error : ',error)
                res.send("impossible d'afficher la page, veuiller l'actualiser")
            }
        })
        //the signUp page
        app.get('/signUp',(req,res)=>{
            try{
                res.render("signUp")
            }catch(error){
                console.error('error : ',error)
                res.send("impossible d'afficher la page, veuiller l'actualiser")
            }
        })
    }catch(error){
        console.error("error : ",error)
        res.send("impossible de se connecter ,veuillez revenir à la page d'acceuil")
    }
});


app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });