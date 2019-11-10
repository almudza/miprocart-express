var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

/**
 * ---------------------------------------------------------------------
 * ------------------ Get Models Page ------------------------------
 */
const Page = require('../models/page');

/**
 * =====================================================================
 * ================== GET page HOME ===================================
 * =====================================================================
 */
router.get('/dashboard', isAdmin, function(req, res) {
    res.render('admin/home', {
        title: "test page"
    });
});


/**
 * =====================================================================
 * ================== GET page INDEX ===================================
 * =====================================================================
 */
router.get('/', isAdmin, function(req, res){
    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
        res.render('admin/all_pages', {
            title: "All Pages",
            pages: pages
        });
    });
});


/**
 * =====================================================================
 * ================== GET add page =====================================
 * =====================================================================
 */
router.get('/add-page', isAdmin, function(req, res){
    
    let title = "";
    let slug = "";
    let content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

/**
 * =====================================================================
 * ================== Post add page ====================================
 * =====================================================================
 */

router.post('/add-page', function(req, res){

    req.checkBody('title','Title Must have Value').notEmpty();
    req.checkBody('content','Content Must have Value').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

    if(slug == "") slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

    let content = req.body.content;
    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({slug: slug}, function (err, page) {
            if (page) {
                req.flash('warning','Page slug exists, choose another');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });

                page.save((err) => {
                    if (err)
                    return console.log(err);

                    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
                        if(err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });
                    
                    req.flash('success','Page added');
                    res.redirect('/admin/pages');

                } );
            }
        });
    }

    
});


/**
 * ===================== Sort Pages Function ======================
 */
function sortPages(ids, callback) {
    let count = 0;

    for (let i =0; i < ids.length; i++){
        let id = ids[i];
        count++;

        (function(count) {
            Page.findById(id, function(err, page) {
                page.sorting = count;
                page.save(function(err){
                    if(err)
                        return console.log(err);
                        ++count;
                        if(count >= ids.length) {
                            callback();
                        }
                });
            });
        })(count);
    }


}


/**
 * =====================================================================
 * ================== Post Add Page REORDER ============================
 * =====================================================================
 */
router.post('/reorder-pages', (req, res) => {
    let ids = req.body['id[]'];


    sortPages(ids, ()=> {
        Page.find({}).sort({sorting: 1}).exec((err, pages) => {
            if(err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    })

});

/** ===========================================================
 * ==================== Get EDIT Page =========================
 * ============================================================
 */
router.get('/edit-page/:id', isAdmin, (req, res) => {

    Page.findById(req.params.id, (err, page) => {
        if(err) 
            return console(err);

        res.render('admin/edit_page',{
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});


/**
 * =====================================================================
 * ================== Post Edit Page ====================================
 * =====================================================================
 */

router.post('/edit-page/:id', function(req, res){

    req.checkBody('title','Title Must have Value').notEmpty();
    req.checkBody('content','Content Must have Value').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

    if(slug == "") slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

    let content = req.body.content;
    let id  = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({slug: slug, _id:{'$ne':id}}, function (err, page) {
            if (page) {
                req.flash('warning','Page slug exists, choose another');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
               Page.findById(id, (err, page) => {
                   if(err)
                        return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save((err) => {
                        if (err)
                        return console.log(err);

                        Page.find({}).sort({sorting: 1}).exec((err, pages) => {
                            if(err) {
                                console.log(err);
                            } else {
                                req.app.locals.pages = pages;
                            }
                        });
                        
                        req.flash('success','Page added');
                        res.redirect('/admin/pages');
    
                    });

               });

              
            }
        });
    } 
});

/**
 * ========================================================================
 * ==================== Delete Page =======================================
 * ========================================================================
 */
router.get('/delete-page/:id', isAdmin, (req, res) => {

    Page.findByIdAndRemove(req.params.id, (err)=> {
        if(err)
            return console.log(err);
        
        Page.find({}).sort({sorting: 1}).exec((err, pages) => {
            if(err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success', 'Page successfully deleted.');
        res.redirect('/admin/pages');
    });
});


// exports
module.exports = router;