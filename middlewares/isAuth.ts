import { Request,Response,NextFunction } from 'express'
import SESSION from '../models/sessionModel'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { constants } from '../config'
import SUBSCRIPTION from '../models/subscriptionModel'
import moment from 'moment'
import path from 'path';

const secretKeyPath = path.resolve(__dirname, '../jwtRS256.key');
const secretKey = fs.readFileSync(secretKeyPath, 'utf-8');

const options : jwt.SignOptions = {
    expiresIn: constants.ACCESS_TOKEN_EXPIRE_IN_DAY,
    algorithm: 'RS256'
};

interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

declare global {
    namespace Express {
        interface Request {
            userId?: string; 
            token?: string;
            role?: string;
            subscriptionId?: String;
            files?: UploadedFile[];
        }
    }
}

export const isAuthenticated = async (req : Request , res : Response, next : NextFunction ) => {

    try {

        console.log(req.headers)
        const token = req.headers["authorization"] || req.headers["authentication"] || req.body.token || req.query.token || req.headers["token"];

        if (!token) {
            throw new Error('A token is required for authentication')
        }

        const tokenArray = token.split(" ");
        if (tokenArray.length !== 2) {
            return res.status(401).json({
                token: tokenArray,
                tokenLength: tokenArray?.length,
                message: "Invalid Token 1",
                header: req.headers
            });
        }

        const authentication = tokenArray[1]

        const FIND_SESSION = await SESSION.findOne({ jwtToken: authentication, isActive: true });

        if (!FIND_SESSION) {
            throw new Error("Your session is expired.")
        }

        // @ts-ignore
        const isUser = jwt.decode(authentication, secretKey, options)
        console.log(isUser,"isUser")

        if (!isUser) throw new Error('invalid token')
        const FIND_SUBSCRIPTION = await SUBSCRIPTION.findById(isUser.subscriptionId);

        if (!FIND_SUBSCRIPTION) {
            throw new Error('Subscription not found');
        }

        const subscriptionEndDate = moment(FIND_SUBSCRIPTION.subscriptionEndDate);
        const currentDate = moment();
        const isExpired = currentDate.isAfter(subscriptionEndDate);

        if (isExpired) {
            throw new Error('The subscription has expired.');
        }

        if (isUser.exp) {
            let tokeExpiresAt = new Date(isUser.exp * 1000);
            const currentDate = new Date();
            // console.log(tokeExpiresAt.getTime(), currentDate.getTime());
            if (tokeExpiresAt.getTime() > currentDate.getTime()) {

                req.userId = isUser.userId;
                req.role = isUser.role;
                req.token = FIND_SESSION.jwtToken
                req.subscriptionId = isUser.subscriptionId;
                console.log(req.role, '----------------', req.userId)
                next();

            } else {
                throw new Error('Token expired')
            }

        } else {
            throw new Error('Invalid token')
        }

    } catch (error : any) {
        res.status(401).json({
            status: 401,
            message: error.message
        });
    }
}
