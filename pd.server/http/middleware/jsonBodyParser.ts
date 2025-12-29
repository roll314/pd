import { Context, Middleware, Next } from '@oak/oak';
import { CommonErrorResponse } from '../models/commonErrorResponse.ts';

export const jsonBodyParser = (): Middleware => async (ctx: Context, next: Next) => {
  if (ctx.request.hasBody) {
    const body = ctx.request.body;

    if (body.type() === "json") {
      try {
        const json = await body.json();
        ctx.state.body = json;
      } catch {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid JSON" } as CommonErrorResponse;
        return;
      }
    } else {
      ctx.response.status = 415;
      ctx.response.body = {
        error: "Expected application/json",
      } as CommonErrorResponse;
      return;
    }
  } else {
    ctx.state.body = null;
  }

  await next();
};
