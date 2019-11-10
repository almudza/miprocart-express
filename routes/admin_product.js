const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

/**
 * ---------------------------------------------------------------------
 * ------------------ Get Models Product and Category -------------------------
 */
const Product = require('../models/product');
const Category = require('../models/category');


/**
 * =====================================================================
 * ================== GET Product Index =================================
 * =====================================================================
 */
router.get('/', isAdmin, (req, res) => {

    let count;

    Product.count((err, c) => {
        count = c;
    });

    Product.find((err, products)=> {
        res.render('admin/products', {
            products,
            count
        });
    });
});

/**
 * =====================================================================
 * ================== GET Add Product =================================
 * =====================================================================
 */

 router.get('/add-product', isAdmin, (req, res)=> {
     let title = "";
     let desc = "";
     let price = "";

     Category.find((err, categories)=> {
         res.render('admin/add_product', {
             title,
             desc,
             categories,
             price
         });
     }); 
 });


 /**
 * =====================================================================
 * ================== POST Add Product =================================
 * =====================================================================
 */
router.post('/add-product', (req, res) => {
    let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have value').notEmpty();
    req.checkBody('desc','Description must have value').notEmpty();
    req.checkBody('price','Price must be have Value').notEmpty();
    req.checkBody('image','You must upload an image').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;

    let errors = req.validationErrors();

    if (errors) {
        Category.find((err, categories)=> {
            res.render('admin/add_product', {
                errors,
                title,
                desc,
                categories,
                price
            });
        });
    } else {
        Product.findOne({slug: slug}, (err, product) => {
            if(product) {
                req.flash('danger','Product title exists, chose another');
                Category.find((err, categories) => {
                    res.render('admin/add_product', {
                        title,
                        desc,
                        categories,
                        price
                    });
                });
            } else {
                let price2 = parseFloat(price).toFixed(2);

                let product = new Product({
                    title,
                    slug,
                    desc,
                    price: price2,
                    category,
                    image: imageFile
                });

                product.save((err) => {
                    if(err)
                        return console.log(err);
                        
                    mkdirp('public/product_image/'+ product._id, (err) => {
                        return console.log(err);
                    });

                    mkdirp('public/product_image/'+ product._id + '/gallery', (err) => {
                        return console.log(err);
                    });

                    mkdirp('public/product_image/'+ product._id + '/gallery/thumbs', (err) => {
                        return console.log(err);
                    });

                    if(imageFile != "") {
                        let productImage = req.files.image;
                        let path = 'public/product_image/' + product._id + '/' + imageFile;

                        productImage.mv(path, (err)=> {
                            return console.log(err);
                        });
                    }

                    req.flash('success','Product Successfully added');
                    res.redirect('/admin/product');
                });
            }
        })
    }

});


 /**
 * =====================================================================
 * ================== GET Edit Product =================================
 * =====================================================================
 */
router.get('/edit-product/:id', isAdmin, (req, res) => {

    let errors;

    if (req.session.errors) 
        errors = req.session.errors;
    req.session.errors = null;

    Category.find((err, categories) => {

        Product.findById(req.params.id, (err, p) => {
            if (err) {
                console.log(err);
                res.redirect('/admin/product');
            } else {
                let galleryDir = 'public/product_image/'+ p._id + '/gallery';
                let galleryImages = null;

                fs.readdir(galleryDir, (err, files) => {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });
    });
});


 /**
 * =====================================================================
 * ================== POST Edit Product =================================
 * =====================================================================
 */


 router.post('/edit-product/:id', (req, res) => {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have value').notEmpty();
    req.checkBody('desc','Description must have value').notEmpty();
    req.checkBody('price','Price must be have Value').notEmpty();
    req.checkBody('image','You must upload an image').isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;
    let pimage = req.body.pimage;
    let id = req.params.id;

    let errors = req.validationErrors();

    if(errors) {
        req.session.errors = errors;
        res.redirect('/admin/product/edit_product/' + id);

    } else {
        Product.findOne({slug: slug, _id: {'$ne' :id}}, (err, p)=> {
            if(err)
                console.log(err);
            if(p) {
                req.flash('danger','Product title exists, choose another');
                res.redirect('/admin/product/edit_product/'+ id);
            } else {
                Product.findById(id, (err, p)=> {
                    if(err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if(imageFile != "") {
                        p.image = imageFile;
                    }
                    p.save(err => {
                        if(err)
                            console.log(err);
                        
                        if(imageFile != "") {
                            if(pimage != "") {
                                fs.remove('public/product_image/'+id + '/' + pimage, (err)=> {
                                    if(err)
                                        console.log(err);
                                });
                            }

                            let productImage = req.files.image;
                            let path = 'public/product_image/'+ id + '/' + imageFile;

                            productImage.mv(path, (err)=> {
                                return console.log(err);
                            });
                        }
                        req.flash('success', 'Product edited');
                        res.redirect('/admin/product/edit-product/'+ id);
                    });
                });
            }
        });
    }

 });

 /**
 * =====================================================================
 * ================== POST Product Gallery =================================
 * =====================================================================
 */
router.post('/product-gallery/:id', (req, res) => {

    let productImage = req.files.file;
    let id = req.params.id;
    let path = 'public/product_image/' + id +'/gallery/'+ req.files.file.name;
    let thumbsPath = 'public/product_image/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, (err) => {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width:100, height:100}).then(buf=> {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);
});


 /**
 * =====================================================================
 * ================== Get Deleted Gallery =================================
 * =====================================================================
 */
router.get('/delete-image/:image', isAdmin, (req, res) => {

    let originalImage = 'public/product_image/'+ req.query.id + '/gallery/'+ req.params.image;
    let thumbImage = 'public/product_image/'+ req.query.id + '/gallery/thumbs/'+ req.params.image;

    fs.remove(originalImage, (err) => {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, (err) => {
                if(err){
                    console.log(err);
                } else {
                    req.flash('success','Image deleted');
                    res.redirect('/admin/product/edit-product/'+ req.query.id);
                }
            });
        }
    });
});

 /**
 * =====================================================================
 * ================== Get Deleted Product ==============================
 * =====================================================================
 */
router.get('/delete-product/:id', isAdmin, (req, res) => {

    let id = req.params.id;
    let path = 'public/product_image/'+ id;

    fs.remove(path, (err) => {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, (err) => {
                req.flash('success','Product Deleted');
                res.redirect('/admin/product');
            });
        }
    });
});

module.exports = router;