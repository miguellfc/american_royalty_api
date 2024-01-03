import Role from "../models/Role.js";

const RoleController = () => {}

RoleController.getAll = async (request, response, next) => {
    try {
        const roles = await Role.getAll();

        response.status(200)
            .json(roles);

    } catch (error) {
        response.status(404)
            .json({
                message: error.message
            });
    }
}

export default RoleController;