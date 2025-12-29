import fs from "node:fs";

export function touchFile(filename: string) {
  fs.open(filename, "w", (err, fd) => {
    if (err) {
      throw err;
    }
    fs.close(fd, (err) => {
      if (err) {
        throw err;
      }
    });
  });
}
