var express   =require("express"),
    bodyParser=require("body-parser"),
    mysql     =require("mysql"),
    bcrypt    =require("bcrypt"),
    session   =require("express-session"),
    app       =express(),
    sess;

app.use(require("express-session")({
	secret:"my name is khan",
	resave:false,
	saveUninitialized:false
}));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended: true}));

//return button restriction
app.use(function(req, res, next){
	if(!req.user){
		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	}
	next();
});

//use same variable as line 3 "mysql"
var connection= mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'rootischampion',
	database:'data'
});

// use same variable as line 28 "connection"
connection.connect(function(error){
	if(error){
		console.log("Error");
	}
	else{
		console.log("Connected");
	}
});

//sign In route
app.get("/",function(req,res){
  //session Connected
  sess=req.session;
  console.log(sess);
  if(sess.email){
    res.redirect("/success");

  }
  else{
    res.render("login.ejs");
  }
  //session code end

	// connection.query("SELECT * FROM world",function(error,rows,fields){
	// if(error){
	// 	console.log("Error in the query");
	// }
	// else{
	// 	console.log("Successful query");
	// 	console.log(rows);

	// }
 //    });

});

app.post("/",function(req,res){
	//session code part one
  sess=req.session;
  //end

  console.log(req.body);

  var in_email=req.body.id;
  var in_password=req.body.psw;
  var hash;

  //bcyrpt
  connection.query("SELECT * FROM user WHERE Email=?",[in_email],function(error,rows,fields){
	  if(error){
	   console.log("Error in the query(Login)");
	   console.log(error);
	  }
	    
	  else{
	   console.log("Successful query(Login)");
	   console.log(rows);
	   var len=rows.length;
           if(len==1){
             hash=rows[0].Password;
             bcrypt.compare(in_password,hash, function(err, result) {
               if(result) {
                  // Passwords match
                 console.log(in_password);
                 console.log(hash);
                 console.log("correct");
                 //session code part2
                 sess.email=req.body.id;
                 res.redirect("/success");
                 //end 
                } 

                else {
                 // Passwords don't match
                 console.log(in_password);
                 console.log(hash);
                 console.log("Incorrect password, try again..");
                 console.log(err);
                 res.redirect("/invalid");  
                } 
     
             });
     
            }

            else{
               console.log("You do not have an account, register first..");
               res.redirect("/noaccount")

            }
	   }
   });
    
    //end bcrypt
});



//signUp route
app.get("/signup",function(req,res){
  sess=req.session;
  console.log("new");
  console.log(sess);
  if(sess.email){
    res.redirect("/success");

  }
  else{
    //new code
    //sign up form countries
    connection.query("SELECT * FROM world",function(error,rows,fields){
	  if(error){
	   console.log("Error in the query(sign countries)");
	   console.log(error);
	  }
	    
	  else{
	   console.log("Successful query(sign countries)");
	   console.log(rows);
	   console.log(rows[0].Country);
	   res.render("signup.ejs",{data:rows});
	   
	   }
    });    
  }
});

app.post("/signup",function(req,res){
   var fname=req.body.fname;
   var lname=req.body.lname;
   var age=req.body.quantity;
   var sex=req.body.sex;
   var email=req.body.email;
   var psw=req.body.psw;
   var country=req.body.country;

   //new code for restricting multiple accounts
   connection.query("SELECT * FROM user WHERE Email=?",[email],function(error,rows,fields){
	  if(error){
	   console.log("Error in the query(signup post)");
	   console.log(error);
	  }
	    
	  else{
	   console.log("Successful query(signup post)");
	   var len=rows.length;
       //bcrypt code(hashing)
       if(len==0){
        bcrypt.hash(psw, 10, function(err, hash) {
          // Store hash in database
          if(err){
            console.log(err);
          }
          else{
            console.log("about to signup");
            var newUser={Fname:fname, Lname:lname, Age:age, Sex:sex, Country:country, Email:email,Password:hash};
            connection.query('INSERT INTO user SET ?', newUser, function(err, result) {
              if(err){
              	console.log("Error in insert query(signup post)");
                console.log(err);
              }
              else{
              	console.log("Successful in the insert(signup post)");
                console.log(newUser);
                res.redirect("/");
              }
             });
          }

        });

      }
      //end bcrypt

      else{
        console.log("Use another email..")
        res.redirect("/multi");
      }   
	}
   });

});



app.get("/logout",function(req,res){
   //session code
  req.session.destroy((err)=>{
    if(err){
      console.log(err);
    }
    res.redirect("/");
  });
  //end
});

app.get("/success",function(req,res){
  //session code
  var id;
  var len;
  sess=req.session;
  if(sess.email){
    console.log("You are logged in.");
    console.log(sess);
    id=sess.email;
    console.log(id);

    connection.query("SELECT * FROM user WHERE Email=?",[id],function(error,rows,fields){
	  if(error){
	   console.log("Error in the query");
	   console.log(error);
	  }
	    
	  else{
	   console.log("Successful query");
	   res.render("success.ejs",{data:rows});
	   
	   }
    });
  }

  else{
    console.log("Login First");
    res.redirect("/");
  }
  //end

  
});

app.get("/invalid",function(req,res){
  sess=req.session;
  if(sess.email){
    res.redirect("/success");

  }
  else{
    res.render("invalid.ejs"); 
  }
   
});

app.get("/noaccount",function(req,res){
   sess=req.session;
  if(sess.email){
    res.redirect("/success");

  }
  else{
    res.render("noaccount.ejs"); 
  } 
});

app.get("/multi",function(req,res){
   sess=req.session;
  if(sess.email){
    res.redirect("/success");

  }
  else{
    res.render("multi.ejs"); 
  }
});

app.listen(3008,function(){
	console.log("Server Connected");
});

