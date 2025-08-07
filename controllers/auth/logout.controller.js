import { config } from "dotenv";
import express from "express";

export const logout = async (req, res) => {
    try {
        // Clear the cookie by setting its expiration date to the past
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            expires: new Date(0)
        });

        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

