const fileHelper = require('./file.helper');

module.exports = {
    /**
     * Require tous les fichiers d'un dossier de manière récursive et retourne les requires sous forme d'objet.
     * @param {string} path 
     * @param {string} extension 
     * @returns {{ [key: string]: any }}
     */
    requireDir: function(path, extension = '.js') {
        const out = {};

        fileHelper.getFiles(path).filter(file => !extension || file.path.toLowerCase().endsWith(extension)).forEach(file => {
            const localPath = file.path.replace(path, '').replace('\\', '/');
            out[localPath] = require(file.path);
        });

        return out;
    }
};