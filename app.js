require("dotenv").config();
const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
// const encrypt=require("mongoose-encryption");
// const md5=require("md5");
// const bcrypt=require("bcrypt");
// const saltRounds=10;
const app=express();

app.set("view engine","ejs");
app.use(express());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set("strictQuery",false);
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema=new mongoose.Schema({
    email:String,
    password:String
})


// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields:["password"]});

userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("user",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render("home");
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register",(req,res)=>{
    // bcrypt.hash(req.body.password,saltRounds,(err,hash)=>{
    //     const user=new User({
    //         email:req.body.username,
    //         password:hash
    //     })
    //     user.save((err)=>{
    //         if(err){
    //             console.log(err);
    //         }
    //         else{
    //             res.render("secrets");
    //         }
    //     })
    // });
    User.register({username:req.body.username},req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            });
        }
    })
})

app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
})

app.post("/login",(req,res)=>{
    // const username=req.body.username;
    // const password=md5(req.body.password);
    // const password=req.body.password;
    // User.findOne({email:username},(err,user)=>{
    //     if(err){
    //         res.send(err);
    //     }
    //     else{
    //         if(user){
    //             bcrypt.compare(password, user.password, function(err, result) {
    //                 if(result===true){
    //                     res.render("secrets");
    //                 }
    //             });
    //             // if(user.password===password){
    //             //     res.render("secrets");
    //             // }
    //         }
    //     }
    // })
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user, (err)=>{
        if (err) { console.log(err); }
        else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            })
        }
      });
});

app.get("/logout",(req,res)=>{
    req.logout(()=>{
        res.redirect("/");
    });
})



app.listen(3000,()=>{
    console.log("Port is running on port 3000");
})
