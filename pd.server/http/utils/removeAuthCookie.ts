import { Context } from "@oak/oak";
import { USER_SESSION_COOKIE_KEY, USER_SESSION_EXPIRED_AT_COOKIE_KEY } from '../../../shared/authConst.ts';

export async function removeAuthCookie(ctx: Context): Promise<void> {
  await ctx.cookies.delete(USER_SESSION_COOKIE_KEY);
  await ctx.cookies.delete(USER_SESSION_EXPIRED_AT_COOKIE_KEY);
}
