const App = require("../app");

module.exports = class Controller {
    /**
     * Controller constructor
     * @param {App} appInstance 
     */
    constructor(appInstance) {
        this.appInstance = appInstance;
    }

    getRoutes() {
        return [];
    }

    sendError(res, message = undefined, status = 500) {
        if(!message)
            res.status(status).send();
        else
            res.status(status).json({ message });
    }

    send404(res, message = undefined) {
        this.sendError(res, message, 404);
    }

    sendInvalid(res, message = undefined) {
        this.sendError(res, message, 400);
    }

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