<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS Firebird</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

## Description

[Firebird](https://firebirdsql.org/) module for [Nest](https://github.com/nestjs/nest). Wrapper for [node-firebird](https://github.com/hgourvest/node-firebird).

## Installation

```bash
$ npm i --save @nestjs/firebird
```

## Quick Start

```
import { Module } from '@nestjs/common';
import { FirebirdModule } from '@nestjs/firebird';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    FirebirdModule.forRoot({
      host: '10.10.160.130',
      port: 3025,
      user: 'SYSDBA',
      password: 'masterkey',
      database: 'd:/database.fdb',
      encoding: 'win1250' // Default: UTF-8
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

```

## Usage

```
import { Injectable } from '@nestjs/common';
import { FirebirdService } from '@nestjs/firebird';

@Injectable()
export class AppService {
  public constructor(private fb: FirebirdService) {}

  public async SingleQuery() {
    let result = await this.fb.Query<{ADD: number}>('SELECT ?+? FROM RDB$DATABASE', [1,1]);
    console.log(result); // => [{ADD: 2}]
  }

  public async Transaction() {
    const transactionResult = await this.fb.Transaction<{ USERNAME: string }>(async t => {
      let result1 = await this.fb.Query<{ADD: number}>('SELECT ?+? FROM RDB$DATABASE', [2,2], t);
      let result2 = await this.fb.Query<{USERNAME: string}>('SELECT USERS.USERNAME FROM USERS', null, t);

      console.log(result1); // => [{ADD: 4}]
      console.log(result2); // => [{USERNAME: 'John'}]
      return result2;
    })
    console.log(transactionResult); // => [{USERNAME: 'John'}]
  }
}
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).
