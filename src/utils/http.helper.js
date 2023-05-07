module.exports = {
    httpMethods: {
        ALL: 'ALL',
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE',
        PATCH: 'PATCH'
    },
    httpMethodIsCorrect: function(method) {
        return Object.keys(this.httpMethods).includes(method);
    },
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