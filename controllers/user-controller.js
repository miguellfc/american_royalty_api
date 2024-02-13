import User from "../models/User.js";

const UserController = () => {}

UserController.getAll = async (request, response) => {
    try {
        const options = request.query
        const users = await User.getAll(options)

        response.status(200)
            .json(users);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            });
    }
}

UserController.create = async (request, response, next) => {
    try {
        const new_user = request.body

        const result = await User.create(new_user)

        response.status(200)
            .json(result)

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

UserController.update = async (request, response, next) => {
    try {
        const new_user = request.body

        const result = await User.update( new_user )

        response.status(200)
            .json(result)

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

UserController.delete = async (request, response, next) => {
    try {
        const { ids } = request.params
        const result = await User.delete( ids )

        response.status(200)
            .json(result)

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

UserController.totals = async (request, response, next) => {
    try {
        const result = await User.totals();

        response.status(200)
            .json(result)

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

UserController.waiter = async (request, response, next) => {
    try {
        const result = await User.waiter();

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

UserController.finisher = async (request, response, next) => {
    try {
        const result = await User.finisher();

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

UserController.sellers = async (request, response, next) => {
    try {
        const result = await User.sellers();

        response.status(200)
            .json(result);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            })
    }
}

export default UserController