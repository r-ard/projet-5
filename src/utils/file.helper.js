const fs = require("fs");
const { dirname } = require('path');

module.exports = {
    /**
     * Récupérer tous les fichiers d'un dossier de manière récursive.
     * @param {string} path 
     * @returns {string[]}
     */
    getFiles: function(path) {
        try {
            const entries = fs.readdirSync(path, { withFileTypes: true });
    
            const files = entries
                .filter(file => !file.isDirectory())
                .map(file => ({ ...file, path: path + file.name }));
        
            const folders = entries.filter(folder => folder.isDirectory());
        
            for (const folder of folders)
                files.push(...this.getFiles(`${path}${folder.name}/`));
        
            return files;
        }
        catch(err) {
        }
        return [];
    },
    /**
     * Récupérer le dossier Root du projet
     * @returns {string}
     */
    getRootPath: function() {
        return dirname(require.main.filename);
    }
};