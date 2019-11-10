// check database using local or production
if(process.env.NODE_ENV === 'production'){
    module.exports = {mongoURI: 'mongodb://mudza:bismillah@ds249299.mlab.com:49299/cart-express'}
} else {
    module.exports = {mongoURI: 'mongodb://127.0.0.1/cmscart'}
}