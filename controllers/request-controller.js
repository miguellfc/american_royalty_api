import Request from "../models/Request.js";
import {datesOfMonth} from "../utils.js";

const RequestController = () => {}

RequestController.getAll = async (request, response, next) => {
    try {
        const options = request.body;
        const requests = await Request.getAll(options);

        response.status(200)
            .json(requests);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            });
    }
}

RequestController.create = async (request, response, next) => {
    try {
        const new_request = request.body;

        const result = await Request.create(new_request);

        response.status(200)
            .json(result)

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

RequestController.update = async (request, response, next) => {
    try {
        const old_request = request.body;

        const result = await Request.update(old_request);

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

RequestController.delete = async (request, response, next) => {
    try {
        const { ids } = request.params;
        const result = await Request.delete( ids );

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

RequestController.resumeMonth = async (request, response, next) => {
    try {
        const options = datesOfMonth();
        const result = await Request.resumeMonth(options);

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

RequestController.budgetCollect = async (request, response, next) => {
    try {
        const options = datesOfMonth();
        const result = await Request.budgetCollect(options);

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            });
    }
}

export default RequestController;