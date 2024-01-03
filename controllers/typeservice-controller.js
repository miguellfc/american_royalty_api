import TypeService from "../models/TypeService.js";

const TypeServiceController = () => {}

TypeServiceController.getAll = async (request, response, next) => {
    try {
        const result = await TypeService.getAll()

        response.status(200)
            .json(result.rows)

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

export default TypeServiceController