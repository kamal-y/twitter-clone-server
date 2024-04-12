import bodyParser from "body-parser";
import { initServer } from "./app/index"
import cors from "cors";

async function init() {
    const app = await initServer();

    app.use(bodyParser.json());

    // Start listening
    app.listen(8000, () => {
        console.log("app started at port :- 8000");
    })
}

init()
