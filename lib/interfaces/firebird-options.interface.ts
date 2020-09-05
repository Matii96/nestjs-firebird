import { Options } from 'node-firebird';

export interface FirebirdModuleOptions extends Options {
  encoding?: string;
}
