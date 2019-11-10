const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const db = require("./config/database");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
var engine = require("ejs-layout");
const fileUpload = require("express-fileupload");
const passport = require("passport");

// Map global promise
mongoose.Promise = global.Promise;
// connect to db
mongoose
  .connect(db.mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Init App
const app = express();

// View Engine setup
// app.set('views', path.join(__dirname,'views'));
// app.set('view engine', 'ejs');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", engine.__express);

// Set public folder
// app.set(express.static(path.join(__dirname,'public')));
// app.use(express.static('public'));
app.use("/static", express.static(path.join(__dirname, "public")));

// Set Global errors variable
app.locals.errors = null;

// Get Page Model
const Page = require("./models/page");

//Get all pages to pass to menu header.ejs
Page.find({})
  .sort({ sorting: 1 })
  .exec((err, pages) => {
    if (err) {
      console.log(err);
    } else {
      app.locals.pages = pages;
    }
  });

// Get Category Model
const Category = require("./models/category");

//Get all categories to pass to menu header.ejs
Category.find((err, categories) => {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

// Express fileUpload middleware
app.use(fileUpload());

// BodyParser Middelware
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Express Seesion Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
  })
);

// ExpressValidator
// app.use(expressValidator(middlewareOption));
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    },
    customValidators: {
      isImage: (value, filename) => {
        let extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case "":
            return ".jpg";
          default:
            return false;
        }
      }
    }
  })
);

// Express connect-flash
// app.configure(function() {
//     app.use(express.cookieParser('keyboard cat'));
//     app.use(express.session({ cookie: { maxAge: 60000 }}));
//     app.use(flash());
// });
// messages middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

/**
 * ========================== Passport Config ====================
 * ================================================================
 */
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// global session cart
app.get("*", (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

// Set Routes
const pages = require("./routes/pages.js");
const products = require("./routes/products.js");
const cart = require("./routes/cart.js");
const user = require("./routes/users.js");
const adminPages = require("./routes/admin_pages.js");
const adminCategory = require("./routes/admin_category.js");
const adminProduct = require("./routes/admin_product.js");

// Admin page
app.use("/admin/pages", adminPages);
app.use("/admin/category", adminCategory);
app.use("/admin/product", adminProduct);
app.use("/cart", cart);
app.use("/users", user);

// Front route
app.use("/products", products);
app.use("/", pages);

// Start the server
const hostname = "127.0.0.1";
const port = process.env.PORT || 8000;
app.listen(port, hostname, () => {
  console.log(`Serve started on http://${hostname}:${port}`);
});
