import express, { json } from "express";

const app = express();

app.use(json());

app.get("/", (req, res) => {
	res.send({
		message: "ok",
	});
});

export default app;
