const express = require('express');
const router = express.Router();


/**
 * ============== Get Product Model ====================
 * 
 */
const Product = require('../models/product');

/**
 * ===============================================================
 * ============= Get Add Product to Cart =========================
 */

router.get('/add/:product', (req, res) => {

    let slug = req.params.product;

    Product.findOne({slug:slug}, (err, p) => {
        if (err)
            console.log(err);
        
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price : parseFloat(p.price).toFixed(2),
                image: '/product_image/'+ p._id + '/' + p.image
            });
        } else {
            let cart = req.session.cart;
            let newItem = true;

            for( let i= 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_image/'+ p._id + '/' + p.image
                });
            }
        }

        console.log(req.session.cart);
        req.flash('success', 'Product Aded');
        res.redirect('back');
    });
});

/**
 * ===============================================================
 * ============= Get Checkout Cart =============================
 * ===============================================================
 */
router.get('/checkout', (req, res) => {

    if(req.session.cart && req.session.cart.length == 0) {
        delete request.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Chekout',
            cart: req.session.cart
        });
    }
});


/**
 * ===============================================================
 * ============= Get Update Cart =============================
 * ===============================================================
 */

 router.get('/update/:product', (req, res) => {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add" :
                    cart[i].qty++;
                    break;
                case "remove" :
                    cart[i].qty--;
                    if(cart[i].qty < 1)
                        cart.splice(i,1);
                        if(cart.length == 0)
                            delete req.session.cart;
                    break;
                case "clear" :
                    cart.splice(i,1);
                    if(cart.length == 0)
                        delete req.session.cart;
                    break;
                default :
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated');
    res.redirect('/cart/checkout');
 });

/**
 * ===============================================================
 * ============= Get Clear Cart ==================================
 * ===============================================================
 */

 router.get('/clear', (req, res) => {
     
    delete req.session.cart;

    req.flash('success', 'Cart Cleared');
    res.redirect('/cart/checkout');

 })



// Export module
module.exports = router;