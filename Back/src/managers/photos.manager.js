const fileHelper = require('../utils/file.helper');
const fs = require('fs');
const path = require('path');
const hashHelper = require('../utils/hash.helper');

class PhotosManager {
    constructor() {
        this.photosPath = `${fileHelper.getRootPath()}/photos`;
        if(!fs.existsSync(this.photosPath))
            fs.mkdirSync(this.photosPath);
    }

    /**
     * Vérifie si une photo existe dans le dossier "photos".
     * @param {string} name 
     * @returns {boolean}
     */
    photoExists(name) {
        return fs.existsSync(this.getPhotoPath(name));
    }

    /**
     * Supprime la photo du dossier "photos".
     * @param {string} name 
     */
    deletePhoto(name) {
        if(this.photoExists(name))
            fs.rm(this.getPhotoPath(name), () => {});
    }

    /**
     * Récupèrer le chemin absolute d'une photo.
     * @param {string} name 
     * @returns {string}
     */
    getPhotoPath(name) {
        return `${this.photosPath}/${name}`;
    }

    /**
     * Récupère toutes les photos du dossier "photos".
     * @returns {any[]}
     */
    getPhotos() {
        const photosPath = `${this.photoPath}/`;
        return fileHelper.getFiles(photosPath).map(file => file.path.replace(photosPath, '').replace('\\', '/'));
    }

    /**
     * Génère un nouveau nom de photo unique.
     * @param {string} extension 
     * @returns {string}
     */
    _getNewPhotoName(extension = undefined) {
        const newId = `${hashHelper.hashString(Date.now().toString(16) + Math.round(Math.random()*10e6).toString(16), 'sha256')}${extension ? extension : ''}`;
        return this.photoExists(newId) ? this._getNewPhotoName() : newId;
    }

    /**
     * Génère un fichier "photo" dans le dossier "photos" à partir d'un fichier existant.
     * @param {string} photo 
     * @param {string} extension 
     * @returns {string|null}
     */
    createPhoto(photo, extension) {
        if(!fs.existsSync(photo)) return null;
        const photoName = this._getNewPhotoName(extension);
        fs.copyFileSync(photo, this.getPhotoPath(photoName));
        return photoName;
    }
};

const photosManager = new PhotosManager();
module.exports = photosManager;