const multer = require('multer');

const fs = require('fs');
const fileHelper = require('../utils/file.helper');

module.exports = {
    /**
     * Générer un middleware wrapper de multer afin de supprimer automatiquement les fichiers générés par celui-ci.
     * @param {string} fieldName 
     * @returns 
     */
    createHandleFileMiddleware(fieldName) {
        const multerMiddleware = multer({ dest: "uploads/" }).single(fieldName);
        return async (req, res, next) => {
            try {
                await new Promise(resolve => {
                    multerMiddleware(req, res, () => resolve());
                });
            }
            catch(err) {}

            if(req['file']) {
                const filePath = `${fileHelper.getRootPath()}\\${req['file'].path}`;
                req['file'].absolutePath = filePath;

                const ogResEnd = res.end;
                res['end'] = (arg) => {
                    ogResEnd.bind(res)(arg);
                    fs.rm(filePath, () => {});
                };
            }
            next();
        };
    }
}