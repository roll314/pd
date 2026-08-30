import {assertExists, assertMatch} from '@std/assert';
import {getEtag} from './getEtag.ts';

Deno.test('etag is returned in the HTTP quoted form', async () => {
  const filePath = await Deno.makeTempFile();

  try {
    await Deno.writeTextFile(filePath, 'thumb');
    const etag = await getEtag(filePath);

    assertExists(etag);
    assertMatch(etag, /^"[a-f0-9]{32}"$/);
  } finally {
    await Deno.remove(filePath);
  }
});
