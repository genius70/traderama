export async function parseJsonBody<T>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text || text.trim() === '') {
      return null;
    }
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Failed to parse JSON body:', error);
    return null;
  }
}
