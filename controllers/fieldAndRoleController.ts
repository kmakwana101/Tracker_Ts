import FIELD from '../models/fieldModel';
import ROLE from '../models/roleModel';
import { Request, Response } from 'express';

export const getFieldAndRole = async (req : Request, res : Response) => {

    try {

        const fieldArray = await FIELD.find({
            subscriptionId: req.subscriptionId
        })

        const roleArray = await ROLE.find({
            subscriptionId: req.subscriptionId
        })

        let response = {
            fieldArray,
            roleArray
        }

        res.status(200).json({
            status: 200,
            message: "field create Successfully.",
            data: response
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const addFieldAndRole = async (req : Request, res : Response) => {
    try {

        const { name, type } = req.body;

        if (!name) {
            throw new Error('name is required.')
        } else if (!['role', 'field'].includes(type)) {
            throw new Error('Please provide a valid type: "role" or "field".');
        }

        if (type == 'field') {

            let field = await FIELD.findOne({ name: name })

            if (!field) {
                field = await FIELD.create({
                    name,
                })
            }

            return res.status(200).json({
                status: 200,
                message: "field create Successfully.",
                data: field
            });

        } else if (type == 'role') {

            let role = await ROLE.findOne({ name: name })

            if (!role) {
                role = await ROLE.create({
                    name,
                })
            }

            return res.status(200).json({
                status: 200,
                message: "role create Successfully.",
                data: role
            });
        }

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}