const express = require("express");
const requireHelper = require("./utils/require.helper");
const httpHelper = require("./utils/http.helper");
const path = require('path');
const Mongoose = require('mongoose');
const Controller = require("./core/controller");

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

    get appConfig() {
        return this._config;
    }

    get serverPort() {
        return this._port;
    }

    get isRunning() {
        return this._server != null;
    }

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

            this._loadControllers();
            this._loadRoutes(this._server);
            this._server.listen(this._port, cb);
        }).catch(err => {
            console.log(`Error : Can not access to the Mongo Database @`, this.appConfig.db.url);
            cb(err);
        });
    }

    getControllerName(instance) {
        for(const [name, _instance] of Object.entries(this._controllers))
            if(instance === _instance) return name;
        return null;
    }

    getControllerByName(name) {
        for(const [_name, instance] of Object.entries(this._controllers))
            if(name == _name) return instance;
        return null;
    }

    getRoute(path, method) {
        for(const route of this._routes)
            if(route.path == path && route.method == method) return route;
        return null;
    }

    _loadRoutes(server) {
        this._routes = [];

        for(const [name, controller] of Object.entries(this._controllers)) {
            const routes = controller.getRoutes();

            (routes instanceof Array ? routes : [routes])
            .forEach(route => {
                try {
                    route.method = route.method.toUpperCase();
                    if(!httpHelper.httpMethodIsCorrect(route.method))
                        throw new Error(`The "${route.method}" method isn't allowed, available routes : ${Object.keys(httpHelper.httpMethods).join(", ")}`);

                    if(this.getRoute(route.path, route.method))
                        throw new Error(`The [${route.method}] "${route.path}" already exists`);
                   
                    const routeMethod = httpHelper.getExpressRegisterMethodForHttpMethod(server, route.method);
                    if(!routeMethod)
                        throw new Error(`Failed to get the express register method for the "${route.method} method"`);

                    const middlewares = [(req, res, next) => { req.appInstance = this; next(); }];
                    //if(route.handleFile) middlewares.push(createHandleFileMiddleware(route.handleFile));

                    if(route.middlewares)
                        (route.middlewares instanceof Array ? Array.from(route.middlewares) : [route.middlewares])
                            .forEach(h => middlewares.push(h));

                    routeMethod.bind(server)(
                        route.path,
                        middlewares,
                        route.handler.bind(controller)
                    );
                    console.log(`[Route] ${route.method} '${route.path}' successfully registered`);

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

    _initMongoose() {
        return Mongoose.connect(this.appConfig.db.url);
    }
}

module.exports = App;