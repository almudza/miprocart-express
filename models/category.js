const mongoose = require('mongoose');

/**
 * ======================================================
 * =============== Category Model ======================
 * ======================================================
 */
const CategorySchema = mongoose.Schema({

    title : {
        type: String,
        required: true
    },

    slug:{
        type: String,
    }
});

const Category = module.exports = mongoose.model('Category', CategorySchema);