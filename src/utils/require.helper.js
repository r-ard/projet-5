const fileHelper = require('./file.helper');

module.exports = {
    requireDir: function(path, extension = '.js') {
        const out = {};

        fileHelper.getFiles(path).filter(file => !extension || file.path.toLowerCase().endsWith(extension)).forEach(file => {
            const localPath = file.path.replace(path, '').replace('\\', '/');
            out[localPath] = require(file.path);
        });

        return out;
    }
};