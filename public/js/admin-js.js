$(document).ready(function(){

    /**
     * ================================
     * ====== Form CKEDITOR ===========
     * ================================
     */
    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }

    /**
     * ===============================
     * ===== confirm Delete page =====
     * ===============================
     */
    $('a.confirmDeletion').on('click', function(){
        if(!confirm('Are you sure for Deleted?'))
            return false;
    });

});