import { Context, Middleware, Next } from '@oak/oak';

export const queryParser = (): Middleware => async (ctx: Context, next: Next) => {
  const params: Record<string, string | string[]> = {};

  for (const [key, value] of ctx.request.url.searchParams) {
    if (params.hasOwnProperty(key)) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  }

  ctx.state.query = params;

  await next();
};
