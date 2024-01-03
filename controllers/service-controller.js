import Service from "../models/Service.js";

const ServiceController = () => {}

ServiceController.getAll = async (request, response, next) => {
    try {
        const options = request.body;
        const services = await Service.getAll(options);

        response.status(200)
            .json(services);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            });
    }
}

ServiceController.create = async (request, response, next) => {
    try {
        const new_service = request.body;

        const result = await Service.create( new_service );

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            });
    }
}

ServiceController.update = async (request, response, next) => {
    try {
        const new_service = request.body;

        const result = await Service.update( new_service );

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            });
    }
}

ServiceController.delete = async (request, response, next) => {
    try {
        const { ids } = request.params;

        const result = await Service.delete( ids );

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            });
    }
}

ServiceController.bests = async (request, response, next) => {
    try {
        const result = await Service.bests();

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

export default ServiceController