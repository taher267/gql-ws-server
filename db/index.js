import env from "dotenv";
env.config();
import mg from "mongoose";
const STR = process.env.MONGO_STR;
export default () => mg.connect(STR);
