const express = require("express");
const requireHelper = require("./utils/require.helper");
const httpHelper = require("./utils/http.helper");
const path = require('path');
const Mongoose = require('mongoose');
const Controller = require("./core/controller");

const cors = require('cors');
const bodyParser = require('body-parser');

const { createHandleFileMiddleware } = require("./middlewares/file.middleware");

class App {
    constructor(port, config) {
        this._port = port;
        this._config = config;
        this._server = null;
        this._routes = [];
        this._controllers = {};
        this._middlewares = [];
    }

    /**
     * Récupérer la configuration chargé de l'application
     */
    get appConfig() {
        return this._config;
    }

    /**
     * Récupérer le port utilisé par l'application
     */
    get serverPort() {
        return this._port;
    }

    /**
     * Récupérer le status d'éxecution de l'application
     */
    get isRunning() {
        return this._server != null;
    }

    /**
     * Démarrer l'application'
     * @param {(err: any) => void} cb 
     * @returns
     */
    start(cb = undefined) {
        if(this.isRunning) {
            cb(new Error("Server is already running"));
            return;
        }

        this._initMongoose().then(() => {
            console.log("Successfully connected to the database");

            this._server = express();

            this._server.use(bodyParser.json());
            this._server.use(bodyParser.urlencoded({ extended: true }));
            this._server.use(cors());

            this._loadControllers();
            this._loadRoutes(this._server);
            this._server.listen(this._port, cb);
        }).catch(err => {
            console.log(`Error : Can not access to the Mongo Database @`, this.appConfig.db.url);
            cb(err);
        });
    }

    /**
     * Récupérer le nom d'un controlleur via son instance
     * @param {Controller} name 
     * @returns {string}
     */
    getControllerName(instance) {
        for(const [name, _instance] of Object.entries(this._controllers))
            if(instance === _instance) return name;
        return null;
    }

    /**
     * Récupérer un controller chargé dans l'application via son nom
     * @param {string} name 
     * @returns {Controller}
     */
    getControllerByName(name) {
        for(const [_name, instance] of Object.entries(this._controllers))
            if(name == _name) return instance;
        return null;
    }

    /**
     * Récupérer une route par son chemin et sa méthode
     * @param {string} path 
     * @param {string} method 
     * @returns {any}
     */
    getRoute(path, method) {
        for(const route of this._routes)
            if(route.path == path && route.method == method) return route;
        return null;
    }

    /**
     * Charger toutes les routes des controlleurs chargé dans l'application.
     */
    _loadRoutes(server) {
        this._routes = [];

        // Parcourir les controlleurs de l'application
        for(const [name, controller] of Object.entries(this._controllers)) {
            const routes = controller.getRoutes();

            // Parcourir les routes exportés du controlleur
            (routes instanceof Array ? routes : [routes])
            .forEach(route => {
                try {
                    // Corriger et vérifier la méthode de la route
                    route.method = route.method.toUpperCase();
                    if(!httpHelper.httpMethodIsCorrect(route.method))
                        throw new Error(`The "${route.method}" method isn't allowed, available routes : ${Object.keys(httpHelper.httpMethods).join(", ")}`);

                    // Vérifier si la route n'est pas déjà utilisé par une autre route
                    if(this.getRoute(route.path, route.method))
                        throw new Error(`The [${route.method}] "${route.path}" already exists`);
                   
                    // Récupérer la méthode express à appelé à partir de la méthode la route.
                    // Exemple : 'POST' => server.post, 'GET' => server.get 
                    const routeMethod = httpHelper.getExpressRegisterMethodForHttpMethod(server, route.method);
                    if(!routeMethod)
                        throw new Error(`Failed to get the express register method for the "${route.method} method"`);

                    // Récupérer les middlewares de la route
                    const middlewares = [(req, res, next) => { req.appInstance = this; next(); }];
                    if(route.middlewares)
                        (route.middlewares instanceof Array ? Array.from(route.middlewares) : [route.middlewares])
                            .forEach(h => middlewares.push(h));

                    // Enregistrer la route dans express
                    routeMethod.bind(server)(
                        route.path,
                        middlewares,
                        route.handler.bind(controller)
                    );
                    console.log(`[Route] ${route.method} '${route.path}' successfully registered`);

                    // Ajouter la route dans la liste des routes de l'application
                    this._routes.push({ 
                        ...route,
                        controller: {
                            name: name,
                            instance: controller
                        }
                    });
                }
                catch(err) {
                    console.log('An error occured while registering a route', route);
                    console.log(err.message);
                }
            });
        }
    }

    /**
     * Charger tous les controllers ".controller.js" présents dans le dossier "controllers/".
     */
    _loadControllers() {
        const controllersDir = path.join(__dirname, "controllers/");
        const requiredControllers = requireHelper.requireDir(controllersDir, '.controller.js');

        this._controllers = {};

        for(const [name, cls] of Object.entries(requiredControllers)) {
            try {
                const instance = new cls(this);
                if(instance instanceof Controller)
                    this._controllers[name] = instance;
            }
            catch(err) {
                continue;
            }
        }
    }

    /**
     * Initialiser la connexion Mongoose avec le serveur MongoDB
     * @returns
     */
    _initMongoose() {
        return Mongoose.connect(this.appConfig.db.url);
    }
}

module.exports = App;