const fs = require("fs");
const { dirname } = require('path');

module.exports = {
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
    getRootPath: function() {
        return dirname(require.main.filename);
    }
};