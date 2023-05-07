const { jwtDecode } = require("../utils/jwt.helper");

module.exports = {
    checkToken: (req, res, next) => {
        const unAuthorizedHandler = () => {
            res.status(403).send('unauthorized request.');
        };

        const authorization = req.headers['authorization'] ? req.headers['authorization'].split(' ') : [];

        if(authorization.length == 2 && authorization[0] == 'Bearer') {
            jwtDecode(authorization[1], req.appInstance.appConfig.jwt.key, data => {
                try {
                    if(!data) throw new Error();
                    if(typeof data.userId == 'string')
                        req.params.userId = data.userId;
                }
                catch(err) {
                    return unAuthorizedHandler();
                }
                next();
            });
        }
        else
            unAuthorizedHandler();
    }
}