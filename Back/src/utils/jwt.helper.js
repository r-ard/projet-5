const jwt = require("jsonwebtoken");

module.exports = {
    /**
     * Décode un jeton JWT et vérifie si il est expirer.
     * @param {string} token 
     * @param {string} key 
     * @param {(data: any) => void} cb 
     */
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
    /**
     * Génère un jeton JWT en lui appliquant une date d'expiration.
     * @param {any} data 
     * @param {number} expiration 
     * @param {string} key 
     * @returns 
     */
    jwtEncode: function(data, expiration, key) {
        return jwt.sign({ ...data, expiration: Date.now() + (expiration*1000) }, key);
    }
};