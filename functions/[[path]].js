export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname.startsWith('/api/')) {
    return context.next();
  }

  const assetResponse = await context.env.ASSETS.fetch(context.request);
  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    return assetResponse;
  }

  return context.env.ASSETS.fetch(new URL('/index.html', url.origin));
}
