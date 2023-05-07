const crypto = require('crypto');

module.exports = {
    /**
     * Hasher une string en fonction de l'algorithme et au salt donné.
     * @param {string} string 
     * @param {string|{ name: string, iteration: number }} algorithm 
     * @param {string|undefined} salt 
     * @returns {string}
     */
    hashString: function(string, algorithm, salt = undefined) {
        if(typeof algorithm === 'string') algorithm = [{ name: algorithm, iteration: 1 }];

        let hashedString = `${salt ? salt : ''}${string}`;

        try {
            algorithm.forEach(method => {
                for(let i = 0; i < method.iteration; i++)
                    hashedString = crypto.createHash(method.name).update(hashedString).digest('hex').toLowerCase();
            })
        }
        catch(err) {
            console.log(`An error occured while hashing the string "${string}" with this algorithm :`, algorithm);
            console.log(err);
            return null;
        }

        return hashedString;
    },
    /**
     * Comparer la correspondance d'une string avec un hash en fonction de l'algorithme et au salt donné.
     * @param {string} hashedString 
     * @param {string} string 
     * @param {string|{ name: string, iteration: number }} algorithm 
     * @param {string} salt 
     * @returns 
     */
    compareHash: function(hashedString, string, algorithm, salt = undefined) {
        return hashedString.toLowerCase() == this.hashString(`${salt ? salt : ''}${string}`, algorithm).toLowerCase();
    }
};