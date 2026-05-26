export const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers
    }
  });

export const badRequest = (message: string) => json({ error: message }, { status: 400 });

export const unauthorized = () => json({ error: "Unauthorized" }, { status: 401 });

export const methodNotAllowed = () => json({ error: "Method not allowed" }, { status: 405 });

export const readJson = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
};
