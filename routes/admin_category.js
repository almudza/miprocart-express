const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

/**
 * ===============================================================
 * ===================== Get Category Model ======================
 * ===============================================================
 */
const Category = require('../models/category');

/**
 * ===============================================================
 * ===================== Get Index ===============================
 * ===============================================================
 */
 router.get('/', isAdmin, (req, res)=> {
     Category.find((err, categories)=> {
        if(err) return console.log(err);
        res.render('admin/admin_category', {
            categories
        });
     });
 });

 /**
 * ===============================================================
 * ===================== Get Add Category ========================
 * ===============================================================
 */
router.get('/add-category', isAdmin, (req, res)=> {

    let title = "";

    res.render('admin/add_category', {
        title : title
    });
});

 /**
 * ===============================================================
 * ===================== Post Add Category ========================
 * ===============================================================
 */
router.post('/add-category', (req, res)=> {

    req.checkBody('title', 'Title must have value').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    let errors = req.validationErrors();

    if(errors) {
        res.render('admin/add_category', {
            errors : errors,
            title : title
        });
    } else {
        Category.findOne({slug: slug},  (err, category) => {
           if(category){
               req.flash('danger','Category title exist');
               res.render('admin/add_category',{
                   title
               });
           } else {
               let category = new Category({
                   title,
                   slug
               });

               category.save((err)=> {
                    if(err)
                        return console.log(err);
                    
                    Category.find((err, categories) => {
                        if(err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });
                    req.flash('success','Category successfully added');
                    res.redirect('/admin/category');
               });
           }
        });
    }
});

 /**
 * ===============================================================
 * ===================== Get Edit Form Category ========================
 * ===============================================================
 */
router.get('/edit-category/:id', isAdmin, (req, res) => {

    Category.findById(req.params.id, (err, category)=> {
        if(err)
            return console.log('err');

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });
});


 /**
 * ===============================================================
 * ===================== Post edit Form Category ========================
 * ===============================================================
 */
router.post('/edit-category/:id', (req,res) => {
    req.checkBody('title', 'Title have must value').notEmpty();

    let title= req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let id = req.params.id;

    let errors = req.validationErrors();

    if(errors){
        res.render('admin/edit_category', {
            errors,
            title,
            id
        });
    } else {
        Category.findOne({slug: slug,_id:{'$ne':id}}, (err,category)=> {
            if(category) {
                req.flash('danger','Category title exists, choose another');
                res.render('admin/edit_category',{
                    title,
                    id
                });
            } else {
                Category.findById(id, (err, category)=> {
                    if(err)
                        return console.log(err);
                    category.title = title;
                    category.slug = slug;

                    category.save((err) => {
                        if(err)
                            return console.log(err);

                        Category.find((err, categories) => {
                            if(err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });
                        req.flash('success','Category Successfull');
                        res.redirect('/admin/category/edit-category/'+id);
                    });

                });
            }
        });
    }
});


/**
 * ========================================================================
 * ==================== Delete Category =======================================
 * ========================================================================
 */
router.get('/delete-category/:id', isAdmin, (req, res)=> {

    Category.findByIdAndRemove(req.params.id, (err)=> {
        if (err)
            return console.log(err);

            Category.find((err, categories) => {
                if(err) {
                    console.log(err);
                } else {
                    req.app.locals.categories = categories;
                }
            });
        
            req.flash('success','Category Deleted');
            res.redirect('/admin/category');
    });
});









 /**
  * ============= Export Routers ===================
  */
  module.exports = router;