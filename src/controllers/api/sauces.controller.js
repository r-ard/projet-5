const { default: mongoose } = require("mongoose");
const Controller = require("../../core/controller");
const Sauce = require("../../models/sauce.model");
const authMiddleware = require("../../middlewares/auth.middleware");
const fileMiddleware = require("../../middlewares/file.middleware");
const photosManager = require("../../managers/photos.manager");
const path = require('path');

module.exports = class SaucesController extends Controller {
    constructor(server) {
        super(server);

        this.photosUrl = `${this.appInstance.appConfig.url}/photos/`;
    }

    getRoutes() {
        return [
            {
                path: '/api/sauces',
                method: 'GET',
                handler: this.getSauces,
                middlewares: [authMiddleware.checkToken]
            },
            {
                path: '/api/sauces/:id',
                method: 'GET',
                handler: this.getSauceById,
                middlewares: [authMiddleware.checkToken]
            },
            {
                path: '/api/sauces',
                method: 'POST',
                handler: this.createSauce,
                middlewares: [
                    authMiddleware.checkToken,
                    fileMiddleware.createHandleFileMiddleware('image')
                ]
            },
            {
                path: '/api/sauces/:updateId',
                method: 'PUT',
                handler: this.updateSauce,
                middlewares: [
                    authMiddleware.checkToken,
                    fileMiddleware.createHandleFileMiddleware('image')
                ]
            },
            {
                path: '/api/sauces/:deleteid',
                method: 'DELETE',
                handler: this.deleteSauce,
                middlewares: [authMiddleware.checkToken]
            },
            {
                path: '/api/sauces/:updateId/like',
                method: 'POST',
                handler: this.updateSauceLike,
                middlewares: [authMiddleware.checkToken]
            }
        ];
    }

    /**
     * Méthode utilisé pour normalisé l'url de l'image d'une sauce
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    processSauceImageUrl(sauce) {
        sauce.imageUrl = `${this.photosUrl}${sauce.imageUrl}`;
    }

    /**
     * Récupèrer toutes les sauces dans la base de donnée
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    async getSauces(req, res) {
        try {
            const sauces = await Sauce.find().exec();
            sauces.forEach(sauce => this.processSauceImageUrl(sauce))
            res.json(sauces);
        }
        catch(err) {
            this.sendError(res, err.message);
        }
    }

    /**
     * Récupère une sauce par son id
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    async getSauceById(req, res) {
        try {
            const sauce = await Sauce.findById(req.params.id).exec();

            if(!sauce)
                return this.send404(res, "Sauce not found");

            this.processSauceImageUrl(sauce);
            res.json(sauce);
        }
        catch(err) {
            this.sendError(res, err.message);
        }
    }

    /**
     * Supprime une sauce
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    async deleteSauce(req, res) {
        try {
            const sauce = await Sauce.deleteOne({ _id: req.params.deleteid }).exec();

            if(!sauce || !sauce.deletedCount)
                return this.send404("Sauce not found");

            res.json({ message: "success" });
        }
        catch(err) {
            this.sendError(res, err.message);
        }
    }

    /**
     * Créer une sauce
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    async createSauce(req, res) {
        const body = this.extractParams(
            req,
            {
                sauce: String
            }
        );

        if(!body || !req['file'] || req['file'].fieldname != 'image')
            return this.sendError(res, "Invalid Body");

        let parsedSauce = null;
        try {
            parsedSauce = this.extractParams(
                { body: JSON.parse(body.sauce) },
                {
                    name: String,
                    manufacturer: String,
                    description: String,
                    mainPepper: String,
                    heat: Number
                }
            );

            if(!parsedSauce
                || (parsedSauce.heat < 0 || parsedSauce.heat > 10)) 
                throw new Error("Invalid Sauce Format");
        }
        catch(err) {
            return this.sendError(res, err.message);
        }

        try {
            const photoName = photosManager.createPhoto(req['file'].absolutePath, path.extname(req['file'].originalname));

            const sauce = await Sauce.create({
                userId: req.params.userId,
                name: parsedSauce.name,
                manufacturer: parsedSauce.manufacturer,
                description: parsedSauce.description,
                mainPepper: parsedSauce.mainPepper,
                imageUrl: photoName,
                heat: parsedSauce.heat,
                likes: 0,
                dislikes: 0,
                usersLiked: [],
                usersDisliked: []
            });

            this.processSauceImageUrl(sauce._doc);
    
            res.json({
                ...sauce._doc,
                message: 'success'
            });
        }
        catch(err) {
            this.sendError(res, err.message);
        }
    }

    /**
     * Met à jour une sauce
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    async updateSauce(req, res) {
        let updateSauce = null;
        try {
            updateSauce = await Sauce.findById(req.params.updateId).exec();
            if(!updateSauce) throw new Error();
        }
        catch(err) {
            return this.send404(res);
        }

        // Vérifie si la sauce appartient bien à l'utilisateur
        if(updateSauce.userId != req.params.userId)
            return this.sendError(res, 'unauthorized', 401);

        try {
            let updateBody = {};

            // Request body
            if(req.body) {
                updateBody = this.extractParams(
                    // form-data or JSON body
                    req.body.sauce ? { body: JSON.parse(req.body.sauce) } : req,
                    {
                        name: String,
                        manufacturer: String,
                        description: String,
                        mainPepper: String,
                        heat: Number
                    },
                    false
                );
            }

            // Image
            if(req['file'] && req['file'].fieldname == 'image') {
                const uploadedPhoto = photosManager.createPhoto(req['file'].absolutePath, path.extname(req['file'].originalname));

                if(updateSauce.imageUrl)
                    photosManager.deletePhoto(updateSauce.imageUrl);

                updateBody.imageUrl = uploadedPhoto;
            }

            if(updateBody && Object.keys(updateBody).length)
                await Sauce.findByIdAndUpdate(req.params.updateId, updateBody).exec();

            res.json({ message: "success" });
        }
        catch(err) {
            this.sendError(res, err.message);
        }
    }

    /**
     * Met à jour le like de l'utilisateur authentifié
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    async updateSauceLike(req, res) {
        let updateSauce = null;
        try {
            updateSauce = await Sauce.findById(req.params.updateId).exec();
            if(!updateSauce) throw new Error();
        }
        catch(err) {
            return this.send404(res);
        }

        try {
            const body = this.extractParams(
                req,
                {
                    like: Number
                }
            );

            if(!body)
                throw new Error('Invalid body');

            updateSauce.usersLiked = updateSauce.usersLiked.filter(userId => userId != req.params.userId);
            updateSauce.usersDisliked = updateSauce.usersDisliked.filter(userId => userId != req.params.userId);

            if(body.like == 1)
                updateSauce.usersLiked.push(req.params.userId);
            else if(body.like == -1)
                updateSauce.usersDisliked.push(req.params.userId);

            await Sauce.findByIdAndUpdate(
                req.params.updateId,
                {
                    usersLiked: updateSauce.usersLiked,
                    usersDisliked: updateSauce.usersDisliked,
                    likes: updateSauce.usersLiked.length,
                    dislikes: updateSauce.usersDisliked.length
                }
            ).exec();

            res.json({ message: "success" });
        }
        catch(err) {
            this.sendError(res, err.message);
        }
    }
}