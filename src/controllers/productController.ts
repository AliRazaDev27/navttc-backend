import type { Request,Response } from "express";
export const getProducts = (request:Request, response:Response) => {
  console.log(request.body);
  const page = request.body["page"]
  const limit = request.body["limit"]
  response.send(`Product page:${page} and limit:${limit}`)
}

// self-invoking function