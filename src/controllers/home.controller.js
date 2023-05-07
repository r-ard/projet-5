const Controller = require("../core/controller");

module.exports = class HomeController extends Controller {
    getRoutes() {
        return {
            path: '/',
            method: 'GET',
            handler: this.homePage
        };
    }

    homePage(req, res) {
        res.send(`Welcome to the Sauces API !`);
    }
}