import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const Login = async (request, response) => {
    try {
        const {email, password} = request.body

        const user = await User.login(email)
        if (!user)
            return response.status(400).json({
                msg: "User doesn't exist."
            })

        const isMatch = await bcrypt.compare(password, user.rows[0].password)
        if (!isMatch)
            return response.status(400).json({
                msg: "Invalid credentials."
            })

        const token = jwt.sign({
            user: user.rows[0]
        }, process.env.JWT_SECRET)
        response.status(200).json({token, user})

    } catch (error) {
        response.status(500).json({error: error.message})
    }
}