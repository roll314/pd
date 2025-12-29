import {accessSync, constants, readdirSync, statSync} from "node:fs";
import {join} from "node:path";

export const dirSize = (dir: string): number => {
  try {
    accessSync(dir, constants.R_OK | constants.X_OK);
  } catch (e) {
    console.error(
      `Cannot compute directory size for ${dir}. Access denied. Total size will be incorrect.`,
    );
    return 0;
  }

  try {
    const files = readdirSync(dir, { withFileTypes: true });

    const paths = files.map((file) => {
      const path = join(dir, file.name);
      if (file.isDirectory()) {
        return dirSize(path);
      }

      if (file.isFile()) {
        const { size } = statSync(path);
        return size;
      }

      console.warn("Folder entry type is not a directory nor a file");
      return 0;
    });

    return paths.reduce((i, size) => i + size, 0);
  } catch (e) {
    console.log(`Cannot read the directory: ${dir}. ${e}`);
    return 0;
  }
};
