const jwt = require("jsonwebtoken");

module.exports = {
    jwtDecode: function(token, key, cb) {
        jwt.verify(token, key, (err, decoded) => {
            try {
                if(!err && decoded.expiration < Date.now())
                    throw new Error();
            }
            catch(error){
                err = true;
            }
            cb(err ? null : decoded);
        });
    },
    jwtEncode: function(data, expiration, key) {
        return jwt.sign({ ...data, expiration: Date.now() + (expiration*1000) }, key);
    }
};