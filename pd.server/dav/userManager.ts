import {v2 as webDav} from 'npm:webdav-server@2.6.2';
import {IUser} from 'npm:webdav-server@2.6.2/lib/user/v2/IUser.d.ts';

export class UserManager extends webDav.SimpleUserManager {
  getUserByNamePromise(name: string): Promise<IUser | undefined> {
    return new Promise<IUser | undefined>((resolve, reject) => {
      super.getUserByName(name, (error: Error, user?: IUser) => {
        if (error) {
          return reject(error);
        }

        resolve(user);
      });
    });
  }

  getUserByNamePasswordPromise(
    name: string,
    password: string,
  ): Promise<IUser | undefined> {
    return new Promise<IUser | undefined>((resolve, reject) => {
      this.getUserByNamePassword(
        name,
        password,
        (error: Error, user?: IUser) => {
          if (error) {
            return reject(error);
          }

          resolve(user);
        },
      );
    });
  }
}
