const multer = require('multer');

const fs = require('fs');
const fileHelper = require('../utils/file.helper');

module.exports = { 
    createHandleFileMiddleware(fieldName) {
        const multerMiddleware = multer({ dest: "uploads/" }).single(fieldName);
        return async (req, res, next) => {
            try {
                await new Promise(resolve => {
                    multerMiddleware(req, res, () => resolve());
                });
            }
            catch(err) {}

            if(req[fieldName]) {
                const filePath = `${fileHelper.getRootPath()}\\${req[fieldName].path}`;
                req[fieldName].absolutePath = filePath;

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