const App = require("../app");

module.exports = class Controller {
    /**
     * Controller constructor
     * @param {App} appInstance 
     */
    constructor(appInstance) {
        this.appInstance = appInstance;
    }

    /**
     * Méthode virtuel utilisé par les controllers afin d'exporter leurs routes à l'application.
     * @returns {any[]}
     */
    getRoutes() {
        return [];
    }

    /**
     * Envoie comme réponse une erreur.
     * @param {Express.Response} res 
     * @param {string|undefined} message 
     * @param {number} status 
     */
    sendError(res, message = undefined, status = 500) {
        if(!message)
            res.status(status).send();
        else
            res.status(status).json({ message });
    }

    /**
     * Envoie comme réponse une erreur 404.
     * @param {Express.Response} res 
     * @param {string|undefined} message 
     */
    send404(res, message = undefined) {
        this.sendError(res, message, 404);
    }

    /**
     * Envoie comme réponse une erreur 400.
     * @param {Express.Response} res 
     * @param {string|undefined} message 
     */
    sendInvalid(res, message = undefined) {
        this.sendError(res, message, 400);
    }

    /**
     * Extrait les paramètres d'un requête selon le selecteur indiqué.
     * @param {Express.Request} req 
     * @param {any|undefined} paramsSelector
     * @param {boolean} nullIfError
     */
    extractParams(req, paramsSelector = undefined, nullIfError = true) {
        if(!req.body || typeof req.body !== 'object') return null;
        if(!paramsSelector || typeof paramsSelector !== 'object') return {...req.body};

        let errorOccured = false;

        const parseBodyWithSelector = (obj, selector) => {
            const out = {};

            for(const [key, value] of Object.entries(selector)) {
                if(errorOccured) return null;

                if(obj[key] === undefined
                    || (typeof value === 'function' && typeof obj[key] !== value.name.toLowerCase())
                    || (typeof value === 'string' && typeof obj[key] !== value.toLowerCase())
                    ) {
                    if(!nullIfError) continue;
                    errorOccured = true;
                    return null;
                }
                else if(typeof value === 'object')
                    out[key] = parseBodyWithSelector(obj[key], value);
                else
                    out[key] = obj[key];
            }

            return errorOccured ? null : out;
        };

        return parseBodyWithSelector(req.body, paramsSelector);
    }
};