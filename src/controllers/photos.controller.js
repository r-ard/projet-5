const Controller = require("../core/controller");
const photosManager = require("../managers/photos.manager");
const authMiddleware = require("../middlewares/auth.middleware");

module.exports = class PhotosController extends Controller {
    getRoutes() {
        return {
            path: '/photos/:photo',
            method: 'GET',
            handler: this.photo,
            middlewares: [authMiddleware.checkToken]
        };
    }

    /**
     * Récupérer une photo à partir de son nom
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    photo(req, res) {
        if(!req.params.photo || !photosManager.photoExists(req.params.photo))
            return this.send404(res);
        return res.download(photosManager.getPhotoPath(req.params.photo));
    }
}