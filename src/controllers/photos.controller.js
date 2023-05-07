const Controller = require("../core/controller");
const photosManager = require("../managers/photos.manager");

module.exports = class PhotosController extends Controller {
    getRoutes() {
        return {
            path: '/photos/:photo',
            method: 'GET',
            handler: this.photo
        };
    }

    photo(req, res) {
        if(!req.params.photo || !photosManager.photoExists(req.params.photo))
            return this.send404(res);
        return res.download(photosManager.getPhotoPath(req.params.photo));
    }
}