import User from "../models/users.model.js"

export const getAllInstructors = async (req,res)=>{

    try {
        
        const instructors = await User.find({role: 'instructor'});
        res.status(200).json(instructors);
    } catch (error) {
        console.error("Error fetching instructors:", error);
        res.status(500).json({ message: "Server error" });
    }
}