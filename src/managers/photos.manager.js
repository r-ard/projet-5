const fileHelper = require('../utils/file.helper');
const fs = require('fs');
const path = require('path');
const hashHelper = require('../utils/hash.helper');

class PhotosManager {
    constructor() {
        this.photosPath = `${fileHelper.getRootPath()}/photos`;
    }

    photoExists(name) {
        return fs.existsSync(this.getPhotoPath(name));
    }

    deletePhoto(name) {
        if(this.photoExists(name))
            fs.rm(this.getPhotoPath(name), () => {});
    }

    getPhotoPath(name) {
        return `${this.photosPath}/${name}`;
    }

    getPhotos() {
        const photosPath = `${this.photoPath}/`;
        return fileHelper.getFiles(photosPath).map(file => file.path.replace(photosPath, '').replace('\\', '/'));
    }

    _getNewPhotoName(extension = undefined) {
        const newId = `${hashHelper.hashString(Date.now().toString(16) + Math.round(Math.random()*10e6).toString(16), 'sha256')}${extension ? extension : ''}`;
        return this.photoExists(newId) ? this._getNewPhotoName() : newId;
    }

    createPhoto(photo, extension) {
        if(!fs.existsSync(photo)) return null;
        const photoName = this._getNewPhotoName(extension);
        fs.copyFileSync(photo, this.getPhotoPath(photoName));
        return photoName;
    }
};

const photosManager = new PhotosManager();
module.exports = photosManager;