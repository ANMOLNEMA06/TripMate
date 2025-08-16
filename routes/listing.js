

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage});


// INDEX + CREATE
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image][url]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );
    

// NEW ROUTE - important: keep before /:id
router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW + UPDATE + DELETE
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        upload.single('listing[image][url]'),
        isOwner,
        validateListing,
        wrapAsync(listingController.renderUpdateForm)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.renderDeleteForm)
    );

// EDIT ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
