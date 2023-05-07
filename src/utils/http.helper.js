module.exports = {
    /**
     * Liste des méthodes HTTP (Express)
     */
    httpMethods: {
        ALL: 'ALL',
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE',
        PATCH: 'PATCH'
    },
    /**
     * Vérifier si une méthode HTTP donné est correcte.
     * @param {string} method 
     * @returns {boolean}
     */
    httpMethodIsCorrect: function(method) {
        return Object.keys(this.httpMethods).includes(method);
    },
    /**
     * Récupère la méthode d'enregistrement Express d'une route via son nom.
     * @param {Express.Application} server 
     * @param {string} method 
     * @returns {Function}
     */
    getExpressRegisterMethodForHttpMethod: function(server, method) {
        switch(method) {
            case "ALL":
                return server.all;
            case "GET":
                return server.get;
            case "POST":
                return server.post;
            case "PUT":
                return server.put;
            case "DELETE":
                return server.delete;
            case "PATCH":
                return server.patch;
            default:
                break;
        }
        return null;
    }
};