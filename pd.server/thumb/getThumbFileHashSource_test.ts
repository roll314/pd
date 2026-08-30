import {assertNotEquals} from '@std/assert';
import {ThumbSize} from '../../shared/thumbSize.ts';
import {getThumbFileHashSource} from './getThumbFileHashSource.ts';

Deno.test('thumb cache key changes after source file update', async () => {
  const filePath = await Deno.makeTempFile();

  try {
    await Deno.writeTextFile(filePath, 'first');
    const firstHashSource = getThumbFileHashSource(filePath, ThumbSize.GRID);

    await Deno.writeTextFile(filePath, 'second version');
    const secondHashSource = getThumbFileHashSource(filePath, ThumbSize.GRID);

    assertNotEquals(firstHashSource, secondHashSource);
  } finally {
    await Deno.remove(filePath);
  }
});
