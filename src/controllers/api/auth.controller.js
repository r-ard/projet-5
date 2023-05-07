const Controller = require("../../core/controller");
const User = require("../../models/user.model");
const hashHelper = require("../../utils/hash.helper");
const { jwtEncode } = require("../../utils/jwt.helper");

module.exports = class AuthController extends Controller {
    constructor(server) {
        super(server);

        this.hashAlgorithm = this.appInstance.appConfig.hash.algorithm;
        this.hashSalt = this.appInstance.appConfig.hash.salt;
        this.jwtKey = this.appInstance.appConfig.jwt.key;
        this.jwtExpiration = this.appInstance.appConfig.jwt.expiration;
    }

    getRoutes() {
        return [
            {
                path: '/api/auth/signup',
                method: 'POST',
                handler: this.signup
            },
            {
                path: '/api/auth/login',
                method: 'POST',
                handler: this.login
            }
        ];
    }

    /**
     * Créer un compte
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    async signup(req, res) {
        const body = this.extractParams(
            req,
            {
                email: String,
                password: String
            }
        );

        try {
            if(!body)
                throw new Error("Invalid body");

            await User.create({
                email: body.email,
                password: hashHelper.hashString(body.password, this.hashAlgorithm, this.hashSalt),
                created_at: new Date()
            });

            res.json({ message: "success" });
        }
        catch(err) {
            this.sendError(res, err.message);
        }
    }

    /**
     * S'authentifier
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    async login(req, res) {
        const body = this.extractParams(
            req,
            {
                email: String,
                password: String
            }
        );

        try {
            if(!body)
                throw new Error("Invalid body");

            const user = await User.findOne({ email: body.email }).exec();
            if(!user 
                || !hashHelper.compareHash(user.password, body.password, this.hashAlgorithm, this.hashSalt)
                )
                throw new Error("Invalid email or password");

            const token = jwtEncode({ userId: user._id }, this.jwtExpiration, this.jwtKey);
            res.json({ message: "success", userId: user._id, token });
        }
        catch(err) {
            this.sendError(res, err.message);
        }
    }
};