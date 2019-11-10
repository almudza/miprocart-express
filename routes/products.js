let express = require('express');
let router = express.Router();
let fs = require('fs-extra');

let Product = require('../models/product');
let Category = require('../models/category');



/**
 * ============================= GET All Products ======================================
 * =============================================================================
 */

 router.get('/', (req, res) => {

    Product.find((err, products) => {
        if(err)
            console.log(err);

        res.render('all_products',{
            title: 'ALL PRODUCTS',
            products: products
        });
    });
 });

/**
 * ============================= GET Products By Category =========================
 * =============================================================================
 */

router.get('/:category', (req, res) => {

    let categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, (err, category) => {
        Product.find({category: categorySlug}, (err, products) => {
            if (err)
                console.log(err);
                
            res.render('category_products', {
                title: category.title,
                products: products
            });
        });
    });
});
 

/**
 * ============================= GET Product Details =========================
 * =============================================================================
 */

 router.get('/:category/:product', (req, res) => {

    let galleryImages = null;
    let loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({slug: req.params.product}, (err, product) => {
        if (err) {
            console.log(err);
        } else {
            let galleryDir = 'public/product_image/' + product.id + '/gallery';

            fs.readdir(galleryDir, (err, files) => {
                if (err){
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title : product.title,
                        p : product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }
    });
 });


// exports
module.exports = router;