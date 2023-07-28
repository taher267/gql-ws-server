import mg from "mongoose";

export default mg.model(
    "Book",
    new mg.Schema(
        {
            title: { type: String, required: true },
            author: { type: String, required: true },
        },
        { timestamps: true }
    )
);
