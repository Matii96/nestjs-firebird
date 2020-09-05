import { Injectable, Inject, Logger } from '@nestjs/common';
import { decode } from 'iconv-lite';
import * as firebird from 'node-firebird';
import { FIREBIRD_MODULE_OPTIONS } from './firebird.constants';
import { FirebirdModuleOptions } from './interfaces';

@Injectable()
export class FirebirdService {
  private logger: Logger;

  public constructor(@Inject(FIREBIRD_MODULE_OPTIONS) private readonly options: FirebirdModuleOptions) {
    this.logger = new Logger('FirebirdModule');
  }

  public Transaction<T>(executable: (transaction: firebird.Transaction) => any): Promise<T[]> {
    return new Promise((resolve, reject) => {
      firebird.attach(
        this.options,
        (err: Error, db: firebird.Database): void => {
          if (err) {
            reject(err);
            return;
          }

          db.transaction(firebird.ISOLATION_READ_COMMITED, async (err: any, transaction: firebird.Transaction) => {
            if (err) {
              db.detach();
              reject(err);
              return;
            }

            // Execute actions
            let result: T[];
            try {
              result = await executable(transaction);
              transaction.commit(() => {
                db.detach();
                resolve(result);
              });
            } catch (err) {
              transaction.rollback(() => {
                db.detach();
                reject(err);
              });
            }
          });
        }
      );
    });
  }

  public Query<T>(
    queryString: string,
    parameters: (string | number)[] = [],
    transaction?: firebird.Transaction
  ): Promise<T[]> {
    if (!transaction) {
      return this.Transaction(t => this.Query(queryString, parameters, t));
    }

    return new Promise((resolve, reject) => {
      transaction.query(
        queryString,
        parameters,
        (err: Error, result: any[]): void => {
          if (err) {
            reject(err);
            return;
          }
          if (!result) {
            resolve([]);
            return;
          }

          if (result.length === undefined) {
            result = [result];
          }

          // Convert buffers to strings
          for (let row of result) {
            this.RowConvertBuffers(row);
          }
          resolve(result);
        }
      );
    });
  }

  private RowConvertBuffers(row: any): void {
    for (const col in row) {
      if (Buffer.isBuffer(row[col])) {
        row[col] = decode(row[col], this.options.encoding || 'UTF-8');
      }
      if (typeof row[col] === 'string' || row[col] instanceof String) {
        row[col] = row[col].trim();
      }
    }
  }

  public async TestConnection() {
    try {
      await this.Query<void>('SELECT 1+1 FROM RDB$DATABASE');
    } catch (err) {
      this.logger.error(err.toString());
    }
  }
}
